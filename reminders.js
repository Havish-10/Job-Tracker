const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const { User, Job } = require('./database');
const { Op } = require('sequelize');

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL || "jobtracker@trial-3yxj6lj900pgdo2r.mlsender.net", "Job Tracker");

async function checkAndSendReminders() {
    console.log('Checking for reminders...');
    try {
        const users = await User.findAll({
            where: {
                reminderFrequency: {
                    [Op.ne]: 'none'
                },
                email: {
                    [Op.ne]: null
                }
            }
        });

        for (const user of users) {
            if (shouldSendReminder(user)) {
                await sendReminder(user);
            }
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
}

function shouldSendReminder(user) {
    const now = new Date();
    const lastSent = user.lastReminderSent ? new Date(user.lastReminderSent) : new Date(0);
    const diffHours = (now - lastSent) / (1000 * 60 * 60);

    switch (user.reminderFrequency) {
        case 'daily':
            return diffHours >= 24;
        case 'twice_weekly':
            return diffHours >= (24 * 3.5);
        case 'weekly':
            return diffHours >= (24 * 7);
        case 'monthly':
            return diffHours >= (24 * 30);
        case 'custom':
            // Simple custom implementation: check if today matches any day in customDates
            // Assuming customDates is a JSON array of day names ['Monday', 'Friday'] or dates
            try {
                const days = JSON.parse(user.customDates || '[]');
                const today = now.toLocaleDateString('en-US', { weekday: 'long' });
                // Send only if it's the right day AND we haven't sent one today
                return days.includes(today) && diffHours >= 20;
            } catch (e) {
                return false;
            }
        default:
            return false;
    }
}

async function sendReminder(user) {
    try {
        // Fetch job stats
        const jobCount = await Job.count(); // Currently global, ideally per user
        const appliedCount = await Job.count({ where: { status: 'Applied' } });

        const recipients = [
            new Recipient(user.email, user.username)
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject("Job Application Reminder")
            .setHtml(`
                <h1>Hello ${user.username},</h1>
                <p>Here is your job application summary:</p>
                <ul>
                    <li><strong>Total Applications:</strong> ${jobCount}</li>
                    <li><strong>Active Applications:</strong> ${appliedCount}</li>
                </ul>
                <p>Don't forget to follow up!</p>
                <p><a href="http://localhost:3000">Go to Dashboard</a></p>
            `)
            .setText(`Hello ${user.username}, You have ${appliedCount} active job applications. Don't forget to follow up!`);

        console.log(`Attempting to send email FROM: ${sentFrom.email} TO: ${user.email}`);

        await mailerSend.email.send(emailParams);

        // Update last sent time
        user.lastReminderSent = new Date();
        await user.save();

        console.log(`Reminder sent to ${user.email}`);
    } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
    }
}

module.exports = { checkAndSendReminders };
