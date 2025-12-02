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
    checkAuth();
    fetchStats();
    fetchJobs();

    // Set default date to today
    document.getElementById('dateApplied').valueAsDate = new Date();
});

// Check Auth
async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/user`);
        if (res.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const user = await res.json();

        // Render Avatar
        const avatarImg = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (user.avatar) {
            avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        } else {
            let avatarUrl;
            if (user.avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
            } else if (user.discriminator === '0') {
                // New Discord username system: (userId >> 22) % 6
                const defaultAvatarIndex = Number((BigInt(user.discordId) >> 22n) % 6n);
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
            } else {
                // Legacy system
                avatarUrl = `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
            }
            avatarImg.src = avatarUrl;
        }

        avatarImg.style.display = 'block';
        userName.textContent = user.username;

    } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = '/login.html';
    }
}

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

// ... (existing code)

// Settings Modal
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const settingsCloseBtn = document.querySelector('.settings-close');
const settingsForm = document.getElementById('settingsForm');
const reminderFrequency = document.getElementById('reminderFrequency');
const customDatesGroup = document.getElementById('customDatesGroup');

settingsBtn.onclick = () => {
    openSettingsModal();
};

settingsCloseBtn.onclick = () => {
    settingsModal.style.display = 'none';
};

window.onclick = (e) => {
    if (e.target == jobModal) {
        closeModal();
    }
    if (e.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
};

reminderFrequency.onchange = () => {
    if (reminderFrequency.value === 'custom') {
        customDatesGroup.style.display = 'block';
    } else {
        customDatesGroup.style.display = 'none';
    }
};

async function openSettingsModal() {
    settingsModal.style.display = 'flex';
    try {
        const res = await fetch(`${API_URL}/user/settings`);
        const data = await res.json();

        reminderFrequency.value = data.reminderFrequency;

        if (data.reminderFrequency === 'custom') {
            customDatesGroup.style.display = 'block';
            const days = data.customDates || [];
            document.querySelectorAll('input[name="customDay"]').forEach(cb => {
                cb.checked = days.includes(cb.value);
            });
        } else {
            customDatesGroup.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
}

settingsForm.onsubmit = async (e) => {
    e.preventDefault();

    const frequency = reminderFrequency.value;
    let customDates = [];

    if (frequency === 'custom') {
        document.querySelectorAll('input[name="customDay"]:checked').forEach(cb => {
            customDates.push(cb.value);
        });
    }

    try {
        await fetch(`${API_URL}/user/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reminderFrequency: frequency,
                customDates: customDates
            })
        });

        settingsModal.style.display = 'none';
        alert('Settings saved!');
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings.');
    }
};

// ... (existing deleteJob function)
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
