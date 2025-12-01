const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'jobs.sqlite'),
    logging: false // Disable logging for cleaner output
});

// Define Model
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

module.exports = { sequelize, Job };
