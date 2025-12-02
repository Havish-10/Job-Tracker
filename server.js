require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { sequelize } = require('./database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

const cron = require('node-cron');
const { checkAndSendReminders } = require('./reminders');
const { User } = require('./database');

// ... (previous imports)

// Passport Configuration
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or Create User
        const [user, created] = await User.findOrCreate({
            where: { discordId: profile.id },
            defaults: {
                username: profile.username,
                email: profile.email,
                avatar: profile.avatar,
                discriminator: profile.discriminator
            }
        });

        // Update user info if changed
        if (!created) {
            user.username = profile.username;
            user.email = profile.email;
            user.avatar = profile.avatar;
            user.discriminator = profile.discriminator;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize by ID
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth Middleware
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Unauthorized' });
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/login.html'
}), (req, res) => {
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login.html');
    });
});

app.get('/api/user', checkAuth, (req, res) => {
    res.json(req.user);
});

// User Settings Routes
app.put('/api/user/settings', checkAuth, async (req, res) => {
    try {
        const { reminderFrequency, customDates } = req.body;
        const user = await User.findByPk(req.user.id);

        user.reminderFrequency = reminderFrequency;
        user.customDates = customDates ? JSON.stringify(customDates) : null;
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/settings', checkAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({
            reminderFrequency: user.reminderFrequency,
            customDates: user.customDates ? JSON.parse(user.customDates) : []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protect API Routes
app.use('/api', checkAuth, routes);

// Scheduler (Run every hour)
cron.schedule('0 * * * *', () => {
    checkAndSendReminders();
});

// Test Route for Email Reminders
app.get('/test-email', async (req, res) => {
    try {
        console.log('Manual reminder check triggered via /test-email');
        await checkAndSendReminders();
        res.send('Reminder check triggered! Check your server console for logs ("Reminder sent..." or errors).');
    } catch (error) {
        console.error('Error in /test-email:', error);
        res.status(500).send('Error triggering reminders: ' + error.message);
    }
});

// Sync Database and Start Server
sequelize.sync({ alter: true }).then(() => { // Using alter: true to update schema
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
