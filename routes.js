const express = require('express');
const router = express.Router();
const { Job } = require('./database');

// GET /api/jobs - Fetch all jobs
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.findAll({ order: [['dateApplied', 'DESC']] });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/jobs - Create a new job
router.post('/jobs', async (req, res) => {
    try {
        const { company, position, status, dateApplied, notes } = req.body;
        const job = await Job.create({ company, position, status, dateApplied, notes });
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/jobs/:id - Update a job
router.put('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { company, position, status, dateApplied, notes } = req.body;
        const job = await Job.findByPk(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        await job.update({ company, position, status, dateApplied, notes });
        res.json(job);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/jobs/:id - Delete a job
router.delete('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const job = await Job.findByPk(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        await job.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/stats - Get job statistics
router.get('/stats', async (req, res) => {
    try {
        const total = await Job.count();
        const applied = await Job.count({ where: { status: 'Applied' } });
        const interviewing = await Job.count({ where: { status: 'Interviewing' } });
        const offer = await Job.count({ where: { status: 'Offer' } });
        const rejected = await Job.count({ where: { status: 'Rejected' } });

        res.json({
            total,
            applied,
            interviewing,
            offer,
            rejected
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
