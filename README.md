# Job Tracker
Job Application Tracking App - Personal Project.

## Setup
Setup the dependencies by running `npm install`
Start the server by running `npm start`

## Home Page
- A premium dashboard greeting you with your application statistics.
- Cards at the top show the breakdown of your applications (Applied, Interviewing, Offers, etc.).
- A "Add Application" button that opens a sleek modal to log a new job.
- A main table displaying all your current applications.
- Users can search for specific companies or positions using the search bar.
- You can edit the status of an application or delete it entirely if you get rejected (or accepted!).
- The design features a modern "Glassmorphism" aesthetic with animated background blobs.

## Granted more time
- I focused a lot on the visual design to make it look "premium", which meant I spent less time on advanced features like authentication.
- If I had planned better, I would have implemented a Kanban board view, which would feel more interactive than a simple list.
- If I had to do this again, I would probably use a frontend framework like React or Vue instead of Vanilla JS to manage the state better.

## Future Features
- User Authentication so you can actually keep your data private.
- File uploads to attach specific resumes or cover letters to each application.
- A "Kanban" drag-and-drop board for moving jobs between statuses.
- Email notifications for upcoming interviews.
- Mobile-responsive improvements.

## Storage
- Applications are saved using a local SQLite database.
- Sequelize is used as the ORM to manage database interactions.

## Bad Coding Habits
- `app.js` is getting a bit long; I should have split the API calls into a separate service file.
- The CSS file is one giant block; using SASS or CSS variables more extensively would have been smarter.
- I relied on `alert` and `confirm` for some interactions instead of custom modals.
- Hardcoded some colors in the JS instead of pulling from CSS variables.

## Server Routes
### GET
- `/api/jobs` - Fetch all jobs
- `/api/stats` - Get application statistics

### POST
- `/api/jobs` - Create a new job

### PUT
- `/api/jobs/:id` - Update an existing job

### DELETE
- `/api/jobs/:id` - Remove a job

## Known Bugs
- The background animation might be heavy on older laptops.
- On very small mobile screens, the table might require horizontal scrolling which isn't the best UX.
