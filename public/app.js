// DOM
const jobsList = document.getElementById('jobsList');
const jobModal = document.getElementById('jobModal');
const addJobBtn = document.getElementById('addJobBtn');
const closeBtn = document.querySelector('.close');
const jobForm = document.getElementById('jobForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');

let jobs = [];

// API URL
const API_URL = '/api';

// Initialize DOM
document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    fetchJobs();

    // Set default date to today
    document.getElementById('dateApplied').valueAsDate = new Date();
});

// Fetch Stats
async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();

        document.getElementById('totalStats').textContent = data.total;
        document.getElementById('appliedStats').textContent = data.applied;
        document.getElementById('interviewingStats').textContent = data.interviewing;
        document.getElementById('offerStats').textContent = data.offer;
        document.getElementById('rejectedStats').textContent = data.rejected;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch Jobs
async function fetchJobs() {
    try {
        const res = await fetch(`${API_URL}/jobs`);
        jobs = await res.json();
        renderJobs(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

// Render Jobs
function renderJobs(jobsToRender) {
    jobsList.innerHTML = '';

    if (jobsToRender.length === 0) {
        jobsList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No applications found.</td></tr>';
        return;
    }

    jobsToRender.forEach(job => {
        const tr = document.createElement('tr');
        tr.onclick = () => editJob(job.id); // Row click opens modal

        tr.innerHTML = `
            <td><strong>${job.company}</strong></td>
            <td>${job.position}</td>
            <td><span class="status-badge status-${job.status}">${job.status}</span></td>
            <td>${job.dateApplied}</td>
            <td>
                <button class="action-btn edit" onclick="event.stopPropagation(); editJob(${job.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="event.stopPropagation(); deleteJob(${job.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        jobsList.appendChild(tr);
    });
}

// Search Filter
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = jobs.filter(job =>
        job.company.toLowerCase().includes(term) ||
        job.position.toLowerCase().includes(term)
    );
    renderJobs(filtered);
});

// Modal Handling
addJobBtn.onclick = () => {
    openModal();
};

closeBtn.onclick = () => {
    closeModal();
};

window.onclick = (e) => {
    if (e.target == jobModal) {
        closeModal();
    }
};

function openModal(isEdit = false) {
    jobModal.style.display = 'flex';
    if (!isEdit) {
        jobForm.reset();
        document.getElementById('jobId').value = '';
        document.getElementById('dateApplied').valueAsDate = new Date();
        modalTitle.textContent = 'Add New Application';
    } else {
        modalTitle.textContent = 'Edit Application';
    }
}

function closeModal() {
    jobModal.style.display = 'none';
}

// Form Submission
jobForm.onsubmit = async (e) => {
    e.preventDefault();

    const id = document.getElementById('jobId').value;
    const jobData = {
        company: document.getElementById('company').value,
        position: document.getElementById('position').value,
        status: document.getElementById('status').value,
        dateApplied: document.getElementById('dateApplied').value,
        notes: document.getElementById('notes').value
    };

    try {
        if (id) {
            // Update
            await fetch(`${API_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
        } else {
            // Create
            await fetch(`${API_URL}/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData)
            });
        }

        closeModal();
        fetchJobs();
        fetchStats();
    } catch (error) {
        console.error('Error saving job:', error);
    }
};

// Edit Job
window.editJob = (id) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
        document.getElementById('jobId').value = job.id;
        document.getElementById('company').value = job.company;
        document.getElementById('position').value = job.position;
        document.getElementById('status').value = job.status;
        document.getElementById('dateApplied').value = job.dateApplied;
        document.getElementById('notes').value = job.notes || '';

        openModal(true);
    }
};

// Delete Job
window.deleteJob = async (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
        try {
            await fetch(`${API_URL}/jobs/${id}`, {
                method: 'DELETE'
            });
            fetchJobs();
            fetchStats();
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }
};
