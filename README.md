# Job Tracker
Job Application Tracking App - Personal Project.

## Setup
1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment Variables**:
    -   Create a `.env` file in the root directory.
    -   Copy the contents of `.env.example` into `.env`.
    -   **Discord OAuth Setup**:
        -   Create an application at the [Discord Developer Portal](https://discord.com/developers/applications).
        -   Get your `Client ID` and `Client Secret`.
        -   Add `http://localhost:3000/auth/discord/callback` as a Redirect URI.
        -   Fill in the `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` in your `.env` file.
    -   **MailerSend Setup (Email Reminders)**:
        -   Sign up at [MailerSend](https://www.mailersend.com/).
        -   Verify your sending domain.
        -   Generate an API Token.
        -   Add `MAILERSEND_API_KEY` and `MAILERSEND_FROM_EMAIL` to your `.env` file.
    -   **Session Secret**:
        -   Add a random string for `SESSION_SECRET` (e.g., `openssl rand -hex 32`).

3.  **Start the Server**:
    ```bash
    npm start
    ```
4.  **Login**:
    -   Navigate to `http://localhost:3000` and login with Discord.

## Features
- **User Authentication**: Secure login via Discord OAuth.
- **Profile Display**: Shows your Discord avatar and username.
- **Email Reminders**: Customizable reminders (Daily, Weekly, Custom) sent via MailerSend.
- **Dashboard**: A premium dashboard greeting you with your application statistics.
- **Job Management**: Add, edit, and delete job applications.
- **Search**: Filter applications by company or position.
- **Responsive Design**: Modern "Glassmorphism" aesthetic.

## Future Features
- [x] User Authentication (Discord OAuth)
- [x] Email Reminders
- File uploads to attach specific resumes or cover letters to each application.
- A "Kanban" drag-and-drop board for moving jobs between statuses.
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
### Auth
-   `/auth/discord` - Initiate Discord OAuth login
-   `/auth/discord/callback` - Discord OAuth callback
-   `/logout` - Logout user
-   `/api/user` - Get current authenticated user

### User Settings
-   `GET /api/user/settings` - Get reminder preferences
-   `PUT /api/user/settings` - Update reminder preferences
-   `GET /test-email` - Manually trigger email reminder check (for testing)

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
