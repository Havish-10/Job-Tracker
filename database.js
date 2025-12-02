const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'jobs.sqlite'),
    logging: false // Disable logging for cleaner output
});

// Define Job Model
const Job = sequelize.define('Job', {
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Applied', 'Interviewing', 'Offer', 'Rejected'),
        defaultValue: 'Applied'
    },
    dateApplied: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    notes: {
        type: DataTypes.TEXT
    }
});

// Define User Model
const User = sequelize.define('User', {
    discordId: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.STRING
    },
    discriminator: {
        type: DataTypes.STRING
    },
    reminderFrequency: {
        type: DataTypes.ENUM('daily', 'twice_weekly', 'weekly', 'monthly', 'custom', 'none'),
        defaultValue: 'none'
    },
    customDates: {
        type: DataTypes.STRING, // Stores JSON string of dates or days
        allowNull: true
    },
    lastReminderSent: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = { sequelize, Job, User };
