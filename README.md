# Perplexity

Perplexity is a full-stack AI answer and research workspace. Users can create an account, verify their email, sign in, ask questions, receive AI-generated answers, and keep each question-and-answer exchange in a persistent thread.

The repository is split into two independently runnable applications:

- `Frontend`: React 19 + Vite client application.
- `Backend`: Express API, MongoDB data layer, authentication, email verification, AI integration, and Socket.IO server.

## Product capabilities

- Responsive marketing landing page.
- User registration and validation.
- Password hashing with bcrypt.
- Email verification through a signed token and Nodemailer/Gmail OAuth2.
- Cookie-based JWT authentication.
- Protected dashboard route.
- AI chat responses through Groq.
- Context-aware thread titles generated from the first user message.
- Deterministic title fallback when the AI title request is unavailable.
- Persistent chat and message storage in MongoDB.
- Markdown and GitHub-Flavored Markdown rendering for assistant messages.
- Recent-thread navigation and chat history loading.
- Chat deletion API.
- Responsive layouts for desktop, tablet, and mobile.
- Socket.IO server/client connection scaffolding for real-time features.

## Repository structure

```text
Perplexity/
├── Backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/database.js
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── sockets/
│       └── validators/
├── Frontend/
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── app/
│       └── features/
└── DOCUMENTATION.md
```

## Requirements

- Node.js 18 or newer.
- npm.
- MongoDB database, local or hosted.
- Groq API key for answer generation.
- Gmail OAuth2 credentials if registration email verification is enabled.

## Installation

Clone the repository and install dependencies in each application:

```bash
git clone <repository-url>
cd Perplexity

cd Backend
npm install

cd ../Frontend
npm install
```

## Environment configuration

### Backend

Create `Backend/.env` from `Backend/.env.example`:

```env
PORT=8000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

MONGODB_URI=mongodb://localhost:27017/perplexity
JWT_SECRET=replace-with-a-long-random-secret

GOOGLE_USER=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

TAVILY_API_KEY=
```

Never commit `.env` files or real API credentials. The repository ignores `Backend/.env` and `Frontend/.env`; use the example files as templates.

### Frontend

Create `Frontend/.env` from `Frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

## Running locally

Start the backend in one terminal:

```bash
cd Backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173`.

The backend health endpoint is:

```text
GET http://localhost:8000/
```

Expected response:

```json
{
  "message": "Server is running"
}
```

## Frontend commands

Run these commands from `Frontend`:

```bash
npm run dev       # Start Vite development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## Backend command

Run this command from `Backend`:

```bash
npm run dev       # Start nodemon with server.js
```

There is currently no automated backend test script. Backend JavaScript syntax can be checked with:

```bash
node --check src/services/ai.service.js
```

## Authentication overview

1. The user submits the registration form.
2. The API validates username, email, and password.
3. The password is hashed before the user is saved.
4. The user is created with `verified: false`.
5. The backend emails a signed verification link.
6. The verification endpoint validates the token and marks the user as verified.
7. Login is rejected until verification succeeds.
8. A successful login writes a seven-day JWT into an HTTP cookie.
9. Protected requests read the cookie through `authUser`.

The verification endpoint currently returns a small HTML confirmation response from the backend and provides a link back to the frontend login page. It is not a separate React route yet.

## AI chat overview

When a signed-in user submits a message:

1. The API validates that the message is not empty.
2. A new chat is created if no chat ID is supplied.
3. The first message is used to generate a concise title through Groq.
4. The title request falls back to a shortened version of the message if Groq is unavailable.
5. The user message is stored.
6. All messages in the thread are loaded in chronological order.
7. The conversation is sent to Groq as user/assistant messages.
8. The assistant response is stored and returned to the frontend.
9. Redux updates the active thread and message stream.

## API summary

### Public authentication endpoints

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an unverified user and send verification email |
| `POST` | `/api/auth/login` | Verify credentials and issue JWT cookie |
| `GET` | `/api/auth/verify-email?token=...` | Verify a user's email |

### Protected authentication endpoint

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/auth/get-me` | Return the currently authenticated user |

### Protected chat endpoints

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/chats/message` | Store a user message and generate an AI response |
| `GET` | `/api/chats` | List the authenticated user's chats |
| `GET` | `/api/chats/:chatId/messages` | Load messages for an owned chat |
| `DELETE` | `/api/chats/delete/:chatId` | Delete an owned chat and its messages |

All protected routes require the JWT cookie created during login.

## Security notes

- Use a unique, long `JWT_SECRET` in every environment.
- Rotate credentials immediately if an `.env` file is ever exposed.
- Do not place API keys in frontend code or `VITE_` variables.
- Use HTTPS and secure cookie settings in production.
- Restrict `FRONTEND_URL` to trusted production origins.
- Configure a production email sender rather than relying on a personal mailbox.
- Add rate limiting, email-token expiry, and password reset flows before production launch.

## Further documentation

See [`DOCUMENTATION.md`](./DOCUMENTATION.md) for the detailed feature, architecture, data model, API, styling, and troubleshooting reference.
