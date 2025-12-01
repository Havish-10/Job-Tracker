// Using global fetch available in Node 18+

// Using built-in fetch if available (Node 18+), otherwise this might fail if node-fetch isn't installed.
// Since I didn't add node-fetch to package.json, I'll assume Node 18+ environment or I'll add it.
// Actually, to be safe, I'll just use http module or assume Node 18+.
// Let's assume Node 18+ which has global fetch.

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('Starting API Tests...');

    // 1. Create a Job
    console.log('\n1. Testing POST /jobs');
    const newJob = {
        company: 'Test Corp',
        position: 'Developer',
        status: 'Applied',
        dateApplied: '2023-10-27',
        notes: 'Test note'
    };

    let createdJobId;

    try {
        const res = await fetch(`${BASE_URL}/jobs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newJob)
        });

        if (res.status === 201) {
            const data = await res.json();
            console.log('✅ Job created:', data);
            createdJobId = data.id;
        } else {
            console.error('❌ Failed to create job:', await res.text());
        }
    } catch (e) {
        console.error('❌ Error creating job:', e.message);
    }

    if (!createdJobId) return;

    // 2. Get All Jobs
    console.log('\n2. Testing GET /jobs');
    try {
        const res = await fetch(`${BASE_URL}/jobs`);
        const data = await res.json();
        console.log(`✅ Fetched ${data.length} jobs`);
        const found = data.find(j => j.id === createdJobId);
        if (found) console.log('✅ Created job found in list');
        else console.error('❌ Created job NOT found in list');
    } catch (e) {
        console.error('❌ Error fetching jobs:', e.message);
    }

    // 3. Update Job
    console.log('\n3. Testing PUT /jobs/:id');
    try {
        const res = await fetch(`${BASE_URL}/jobs/${createdJobId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Interviewing' })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('✅ Job updated:', data);
            if (data.status === 'Interviewing') console.log('✅ Status updated correctly');
            else console.error('❌ Status NOT updated');
        } else {
            console.error('❌ Failed to update job');
        }
    } catch (e) {
        console.error('❌ Error updating job:', e.message);
    }

    // 4. Get Stats
    console.log('\n4. Testing GET /stats');
    try {
        const res = await fetch(`${BASE_URL}/stats`);
        const data = await res.json();
        console.log('✅ Stats:', data);
    } catch (e) {
        console.error('❌ Error fetching stats:', e.message);
    }

    // 5. Delete Job
    console.log('\n5. Testing DELETE /jobs/:id');
    try {
        const res = await fetch(`${BASE_URL}/jobs/${createdJobId}`, {
            method: 'DELETE'
        });

        if (res.status === 204) {
            console.log('✅ Job deleted');
        } else {
            console.error('❌ Failed to delete job');
        }
    } catch (e) {
        console.error('❌ Error deleting job:', e.message);
    }
}

// Wait for server to start
setTimeout(testAPI, 2000);
