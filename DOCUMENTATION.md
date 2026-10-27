# Perplexity Documentation

This document explains the current Perplexity implementation feature by feature. It is intended for developers who need to run, maintain, extend, or review the project.

## 1. Product summary

Perplexity is an AI-powered answer workspace with a deliberately focused SaaS interface. The experience has three primary states:

1. **Discovery**: A public landing page explains the product and directs visitors to registration or sign in.
2. **Access**: Users register, verify their email, and authenticate through a cookie-backed session.
3. **Research workspace**: Authenticated users create threads, ask questions, read Markdown answers, and return to previous conversations.

The application separates presentation from server responsibilities:

- React owns navigation, forms, responsive UI, Redux state, and API orchestration.
- Express owns validation, authentication, persistence, email, and AI requests.
- MongoDB owns users, chats, and messages.

## 2. Feature-by-feature reference

### 2.1 Landing page

**Location:** `Frontend/src/features/landing/Landing.jsx`

The landing page is the public product introduction at `/`.

It includes:

- Brand navigation with links to product sections.
- Sign-in and get-started calls to action.
- Hero message focused on turning questions into clarity.
- Animated Three.js canvas with an orb and particles.
- Framer Motion entrance animations.
- GSAP hover treatment for the primary CTA.
- Product preview card showing a sample research interaction.
- Proof strip describing the product mindset.
- Three feature cards:
  - Answers with depth.
  - Always in context.
  - Made for momentum.
- Final call to action and footer.

The Three.js effect is decorative. The canvas is non-interactive and is cleaned up when the component unmounts. The page hides the preview card and stacks content on narrow screens so the visual treatment does not reduce mobile usability.

### 2.2 Registration

**Location:** `Frontend/src/features/auth/pages/Register.jsx`

The registration page collects:

- Username.
- Email address.
- Password.

The form:

- Prevents browser navigation on submit.
- Calls `handleRegister` from `useAuth`.
- Displays backend errors.
- Disables the submit button while the request is in progress.
- Redirects to `/login` after a successful registration.

The backend applies the authoritative validation rules:

- Username is required.
- Username length must be 3–30 characters.
- Username may contain letters, numbers, and underscores.
- Email must be valid.
- Password must be at least six characters.

The user is initially stored with `verified: false`. Registration therefore does not immediately create an authenticated session.

### 2.3 Email confirmation

**Backend locations:**

- `Backend/src/controllers/auth.controller.js`
- `Backend/src/services/mail.service.js`
- `Backend/src/routes/auth.routes.js`

After registration, the backend signs a JWT containing the user's email. The verification URL is included in an email:

```text
GET /api/auth/verify-email?token=<signed-token>
```

Nodemailer sends the message using Gmail OAuth2 credentials:

- `GOOGLE_USER`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

When the link is opened:

1. The token is read from the query string.
2. `jwt.verify` validates it.
3. The user is found by the email in the token.
4. `verified` is changed to `true`.
5. The backend returns an HTML success page containing a link to `/login`.

Invalid tokens return a JSON error response with HTTP 400. The current implementation does not yet set an expiry on email-verification tokens and does not have a dedicated React confirmation route.

### 2.4 Login

**Location:** `Frontend/src/features/auth/pages/Login.jsx`

The login form sends email and password to `/api/auth/login`.

The server:

1. Finds the user by email.
2. Compares the submitted password with the bcrypt hash.
3. Rejects unverified accounts.
4. Signs a seven-day JWT containing the user ID and username.
5. Writes the token to a cookie.
6. Returns basic user information.

The frontend stores the returned user in Redux and redirects to `/dashboard`. If a user is already loaded, the page redirects away from login automatically.

### 2.5 Cookie authentication and protected routes

**Locations:**

- `Backend/src/middleware/auth.middleware.js`
- `Frontend/src/features/auth/components/Protected.jsx`
- `Frontend/src/app/App.jsx`

The frontend Axios client uses `withCredentials: true`, allowing the browser to send the auth cookie to the API.

The `authUser` middleware:

- Reads `req.cookies.token`.
- Returns `401` if no token exists.
- Verifies the token with `JWT_SECRET`.
- Places the decoded payload on `req.user`.
- Allows the request to continue.

The React `Protected` component:

- Displays a loading state while the current user is being checked.
- Redirects unauthenticated users to `/login`.
- Renders the dashboard for authenticated users.

`App.jsx` calls `handleGetMe` once at startup so a page refresh can restore the session from the cookie.

### 2.6 Chat dashboard

**Location:** `Frontend/src/features/chat/pages/Dashboard.jsx`

The dashboard is the primary authenticated workspace.

#### Sidebar

The sidebar contains:

- Perplexity brand mark.
- New thread button.
- Discover and Library navigation items.
- Recent thread list.
- Search-thread affordance.
- Settings affordance.
- Current account avatar, name, and plan label.

On screens narrower than 760px, the sidebar becomes a drawer. The menu button opens it, and an overlay closes it.

#### Empty state

When no thread is selected, the dashboard shows:

- A product mark.
- A personalized greeting.
- A short explanation of the answer engine.
- Suggestion cards for exploring, planning, and writing.

Selecting a suggestion places its text into the composer; it does not send automatically.

#### Conversation state

When a thread is active, the dashboard shows:

- Thread label and title.
- User messages in right-aligned bubbles.
- Assistant messages with a product mark.
- Markdown-rendered assistant content.
- GFM support for tables, lists, and other GitHub-Flavored Markdown constructs.
- Animated thinking indicator while the response request is pending.

#### Composer

The composer supports:

- Multiline textarea input.
- Enter to submit.
- Shift+Enter for a new line.
- Disabled send button for empty input or while loading.
- Error banner when the API fails.
- Mobile-friendly layout that hides the keyboard hint on small screens.

### 2.7 Thread creation and title generation

**Locations:**

- `Backend/src/controllers/chat.controller.js`
- `Backend/src/services/ai.service.js`
- `Frontend/src/features/chat/hooks/useChat.js`

The first message in a new conversation triggers title generation. The title prompt asks Groq for a concise, specific three-to-six-word title with no prefix or punctuation.

Example:

```text
User message: How can I build a responsive SaaS dashboard for my startup?
Generated title: Responsive SaaS Dashboard
```

The title service has a fallback path:

- Normalizes whitespace.
- Uses the first seven words.
- Limits the fallback to 48 characters.
- Returns `New conversation` for empty input.

Title generation has a shorter timeout than answer generation. If the title call fails, the chat still proceeds with the fallback title rather than blocking thread creation.

### 2.8 AI answer generation

**Location:** `Backend/src/services/ai.service.js`

The answer service sends requests to the OpenAI-compatible Groq chat-completions endpoint.

It:

- Requires `GROQ_API_KEY`.
- Converts database roles:
  - `user` becomes `user`.
  - `ai` becomes `assistant`.
- Adds a system instruction for helpful and precise answers.
- Uses the configured `GROQ_MODEL`.
- Uses a 16-second request timeout.
- Rejects unsuccessful API responses.
- Rejects empty model responses.
- Converts timeouts into a readable error.

The chat controller returns HTTP 502 when the AI provider cannot produce a response.

### 2.9 Chat persistence

**Models:**

- `Backend/src/models/chat.model.js`
- `Backend/src/models/message.model.js`

Each chat belongs to one user and has a title. Each message belongs to one chat and has:

- `content`
- `role`: `user` or `ai`
- timestamps

The controller checks chat ownership before loading messages, sending messages, or deleting a chat. Deleting a chat also deletes its messages.

### 2.10 Chat history loading

**Location:** `Frontend/src/features/chat/hooks/useChat.js`

At dashboard startup:

1. The client initializes the Socket.IO connection.
2. It requests the authenticated user's chats.
3. Redux stores the chat summaries.

When a thread is selected:

1. The client checks whether messages are already loaded.
2. It requests messages only when necessary.
3. It maps database messages into the UI message shape.
4. It makes the selected chat active.

This prevents repeatedly fetching the same thread while the page remains mounted.

### 2.11 Redux state

**Locations:**

- `Frontend/src/app/app.store.js`
- `Frontend/src/features/auth/auth.slice.js`
- `Frontend/src/features/chat/chat.slice.js`

The store has two slices.

#### Auth state

```js
{
  user,
  loading,
  error
}
```

Actions include setting the current user, loading state, and error state.

#### Chat state

```js
{
  chats,
  currentChatId,
  isLoading,
  error
}
```

Each chat summary is normalized by ID:

```js
{
  id,
  title,
  messages,
  lastUpdated
}
```

### 2.12 Responsive design system

**Location:** `Frontend/src/app/index.css`

The application uses a shared dark SaaS visual system:

- DM Sans for body text.
- Plus Jakarta Sans for product headings.
- Dark navy and charcoal surfaces.
- Mint/teal accent color.
- Thin borders and soft glows.
- High-contrast focus states.
- Fluid heading sizes through `clamp`.
- Layout changes at 820px, 760px, and 480px.

Responsive behavior includes:

- Sidebar-to-drawer transition.
- Stacked landing-page feature cards.
- Hidden decorative hero card on mobile.
- Full-width mobile form controls.
- Mobile-friendly composer.
- Reduced spacing and typography on narrow screens.

### 2.13 API and CORS layer

**Location:** `Backend/src/app.js`

Express configures:

- JSON request parsing.
- URL-encoded request parsing.
- Cookie parsing.
- Morgan request logging.
- CORS with credentials.
- Authentication routes.
- Chat routes.
- Root health check.
- Final error middleware.

Allowed origins include local Vite addresses and any comma-separated origins in `FRONTEND_URL`.

### 2.14 Database connection

**Location:** `Backend/src/config/database.js`

The backend uses Mongoose to connect to `MONGODB_URI`. The connection is started from `server.js` before the HTTP server begins serving traffic.

The current connection module explicitly configures DNS servers before connecting. In production, this should be tested against the target hosting environment because managed infrastructure may provide its own DNS behavior.

### 2.15 Socket.IO

**Locations:**

- `Backend/src/sockets/server.socket.js`
- `Frontend/src/features/chat/service/chat.socket.js`

The backend creates a Socket.IO server on the same HTTP server as Express. The frontend creates a credentialed Socket.IO client when the dashboard mounts.

The current implementation logs connections but does not yet stream AI tokens or broadcast chat events. REST remains the source of truth for chat creation, history, and responses. Socket.IO is prepared for future real-time functionality.

### 2.16 Internet search service

**Location:** `Backend/src/services/internet.service.js`

The Tavily service accepts a query and returns up to five search results as JSON. It requires `TAVILY_API_KEY`.

The service is available as backend infrastructure, but the current Groq response path does not invoke it. Connecting Tavily to the answer-generation flow is a future integration step.

## 3. Data model

### User

| Field | Type | Description |
|---|---|---|
| `username` | String | Unique, trimmed username |
| `email` | String | Unique, lowercase email |
| `password` | String | Bcrypt hash |
| `verified` | Boolean | Whether email verification succeeded |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

### Chat

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Owning user |
| `title` | String | Generated or fallback thread title |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

### Message

| Field | Type | Description |
|---|---|---|
| `chat` | ObjectId | Parent chat |
| `content` | String | User or assistant content |
| `role` | String | Either `user` or `ai` |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

## 4. API reference

### `POST /api/auth/register`

Request:

```json
{
  "username": "alex_dev",
  "email": "alex@example.com",
  "password": "secure-password"
}
```

Success: `201 Created`.

Failure examples:

- `400`: validation failure.
- `400`: email or username already exists.
- `500`: registration or email delivery failure.

### `POST /api/auth/login`

Request:

```json
{
  "email": "alex@example.com",
  "password": "secure-password"
}
```

Success: `200 OK` with a JWT cookie.

Failure examples:

- `400`: invalid credentials.
- `400`: email is not verified.
- `400`: validation failure.

### `GET /api/auth/verify-email?token=...`

Success: HTML confirmation response.

Failure: `400` JSON response for an invalid token or unknown user.

### `GET /api/auth/get-me`

Requires the JWT cookie. Returns the current user without the password.

### `POST /api/chats/message`

Request:

```json
{
  "message": "Explain the difference between REST and GraphQL",
  "chat": null
}
```

Use the existing chat ID in `chat` for a follow-up message. Leave it null or omit it to create a new thread.

Success response includes:

- `title`
- `chat`
- `aiMessage`

### `GET /api/chats`

Returns chats owned by the authenticated user.

### `GET /api/chats/:chatId/messages`

Returns messages only when the authenticated user owns the requested chat.

### `DELETE /api/chats/delete/:chatId`

Deletes the chat and all messages belonging to it.

## 5. Environment reference

| Variable | Application | Required | Purpose |
|---|---|---:|---|
| `PORT` | Backend | No | HTTP port, defaults to 8000 |
| `FRONTEND_URL` | Backend | Yes for deployment | Allowed frontend origin and email redirect |
| `BACKEND_URL` | Backend | Yes for deployment | Base URL used in verification links |
| `MONGODB_URI` | Backend | Yes | MongoDB connection string |
| `JWT_SECRET` | Backend | Yes | Signs auth and verification tokens |
| `GOOGLE_USER` | Backend | For email | Gmail sender address |
| `GOOGLE_CLIENT_ID` | Backend | For email | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | For email | Google OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | Backend | For email | Gmail OAuth2 refresh token |
| `GROQ_API_KEY` | Backend | Yes for AI | Groq authentication |
| `GROQ_MODEL` | Backend | No | Groq model name |
| `GROQ_API_URL` | Backend | No | OpenAI-compatible Groq endpoint |
| `TAVILY_API_KEY` | Backend | Only for search | Tavily authentication |
| `VITE_API_URL` | Frontend | No | Backend base URL |

## 6. Error behavior

The frontend displays API errors through Redux error state. Common messages include:

- Failed to load chats.
- Failed to load messages.
- Failed to send message.
- Please verify your email before logging in.

The backend:

- Returns `400` for invalid input.
- Returns `401` for missing or invalid authentication.
- Returns `404` for missing or inaccessible chats.
- Returns `502` when AI response generation fails.
- Returns `500` for unhandled application errors.

## 7. Production readiness checklist

Before deploying:

- Replace all local URLs with production HTTPS URLs.
- Rotate any credentials that have ever been exposed.
- Use secure, HTTP-only, same-site cookie settings.
- Add verification-token expiration.
- Add rate limiting for login, registration, verification, and AI endpoints.
- Add password reset and account recovery.
- Add backend automated tests.
- Add frontend component and integration tests.
- Add pagination for chat history and messages.
- Add request size and message-length limits.
- Add structured logging and monitoring.
- Configure Socket.IO CORS from environment values instead of a hard-coded local origin.
- Connect Tavily to the answer-generation path if sourced web answers are required.
- Replace the inline verification HTML with a branded frontend verification page.

## 8. Troubleshooting

### MongoDB connection fails

Check `MONGODB_URI`, database network access, credentials, and whether the MongoDB deployment allows the current IP address.

### Login says email is not verified

Open the verification link from the registration email. Check Gmail OAuth2 credentials and the backend logs if no email is delivered.

### AI requests fail

Check `GROQ_API_KEY`, `GROQ_MODEL`, network access, and the backend logs. A missing key produces a clear configuration error.

### Frontend cannot reach the API

Check that:

- Backend is running on port 8000.
- `Frontend/.env` contains the correct `VITE_API_URL`.
- `FRONTEND_URL` is included in the backend CORS configuration.
- Browser cookies are allowed for the local origin.

### Frontend build fails

Run commands from the `Frontend` directory, not the repository root:

```bash
cd Frontend
npm run lint
npm run build
```

## 9. Extension guide

When adding a feature:

1. Add or update the backend model if data must persist.
2. Add a controller and route with ownership checks.
3. Add validation for all user-controlled input.
4. Add a frontend API function.
5. Add Redux actions only for state that must be shared.
6. Add the page or component using existing design tokens.
7. Add responsive behavior at the established breakpoints.
8. Update `README.md` for onboarding-level changes.
9. Update this document for behavior, architecture, or API changes.
10. Run frontend lint and build before opening a pull request.
