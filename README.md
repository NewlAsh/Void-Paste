# 📝 VoidPaste

> A modern backend-focused code snippet sharing platform built with FastAPI, SQLAlchemy, and React.
>
> VoidPaste allows developers to create, manage, and share code snippets through a clean and minimal interface. The project was built primarily as a backend engineering exercise, focusing on authentication, database relationships, middleware development, API design, and privacy-aware data handling.

---

# ✨ Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Secure password hashing using `pwdlib`
* Protected routes for authenticated actions
* Ownership-based access control

### Clip Management

* Create code snippets ("clips")
* View public clips
* Edit existing clips
* Delete clips
* View a user's complete clip history

### Privacy Controls

* Public and private account modes
* Private users are automatically excluded from the homepage feed
* Privacy enforcement occurs directly at the database query level

### Security & Middleware

* Honeypot route protection
* Bot and scanner detection
* User-Agent filtering
* IP-based rate limiting
* Request interception using custom FastAPI middleware

### Frontend

* React single-page application
* Protected client-side routing
* Authentication state management
* Responsive user interface
* Framer Motion powered interactions

---

# 🛠 Tech Stack

| Layer            | Technology     |
| ---------------- | -------------- |
| Backend          | FastAPI        |
| ORM              | SQLAlchemy 2.0 |
| Database         | SQLite         |
| Async Driver     | aiosqlite      |
| Authentication   | JWT            |
| Password Hashing | pwdlib         |
| Validation       | Pydantic       |
| Frontend         | React (Vite)   |
| Styling          | Tailwind CSS   |
| Animation        | Framer Motion  |
| API Client       | Axios          |

---

# ⚙️ How the Application Works

## 1. User Registration

A new user registers through the FastAPI backend.

During registration:

* User information is validated
* Passwords are hashed using `pwdlib`
* User records are stored in the database
* Privacy preferences are saved

Passwords are never stored in plaintext.

---

## 2. Authentication

Users authenticate using OAuth2-compatible login endpoints.

The backend:

* Verifies submitted credentials
* Generates JWT access tokens
* Encodes the user identifier inside the `sub` claim
* Returns a bearer token for future requests

Example response:

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

Protected routes use dependency injection to retrieve the currently authenticated user.

---

## 3. Clip Creation

Authenticated users can create clips.

Each clip is automatically associated with:

* The current authenticated user
* A creation timestamp
* Its database relationship owner

The application maintains a one-to-many relationship between users and clips.

---

## 4. Clip Management

Users can:

* Create clips
* Read clips
* Update clips
* Delete clips

Before updates or deletions occur, ownership checks ensure that only the original author may modify their content.

---

## 5. Public Feed

The homepage acts as a global feed of publicly visible clips.

Instead of retrieving all clips and filtering them in Python, VoidPaste performs filtering directly at the SQL query level.

This ensures:

* Improved efficiency
* Lower memory usage
* Better scalability
* Stronger privacy guarantees

---

## 6. Privacy System

Each account contains a privacy flag:

```python
private_account = True
```

When enabled:

* User clips remain visible to the owner
* User clips remain stored normally
* Public feed queries exclude those clips automatically

Privacy filtering occurs inside database queries before records are returned to the application.

---

# 🛡️ Middleware & Security

One of the primary backend-focused aspects of VoidPaste is its custom middleware layer.

The middleware intercepts incoming requests before they reach application routes and applies basic security checks.

---

## Honeypot Route Protection

Many automated bots continuously scan websites looking for vulnerable applications.

VoidPaste blocks requests targeting common attack vectors such as:

```text
/wp-admin
/phpmyadmin
/config.php
/.env
```

Requests attempting to access these routes immediately receive:

```http
403 Forbidden
```

This acts as a lightweight defense against automated scanning behavior.

---

## User-Agent Filtering

The middleware performs simple User-Agent inspection.

Requests originating from obvious scripting clients such as:

```text
curl
python-scripts
```

can be rejected before reaching application logic.

This helps reduce basic scraping and automated probing attempts.

---

## IP-Based Rate Limiting

VoidPaste includes a custom in-memory rate limiter.

Current configuration:

```python
Rate_limit_window = 60
max_requests = 5
```

Meaning:

* Maximum 5 requests
* Per 60-second window
* Per client IP

Requests exceeding the configured threshold receive:

```http
429 Too Many Requests
```

This middleware was implemented as a learning exercise around request interception, traffic control, and backend security patterns.

---

# 🧱 Database Structure

## Users Table

| Field           | Description              |
| --------------- | ------------------------ |
| id              | Primary Key              |
| username        | Unique username          |
| email           | User email               |
| password_hash   | Securely hashed password |
| private_account | Privacy flag             |

---

## Clips Table

| Field       | Description        |
| ----------- | ------------------ |
| id          | Primary Key        |
| title       | Clip title         |
| content     | Clip content       |
| user_id     | Author reference   |
| date_posted | Creation timestamp |

---

## Relationship Model

```text
Users (1)
    │
    └──────< Clips (Many)
```

A single user may own multiple clips, while each clip belongs to exactly one author.

---

# 📌 Key API Endpoints

## User Endpoints

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| POST   | `/api/users/`      | Register a new account      |
| POST   | `/api/users/token` | Login and obtain JWT token  |
| GET    | `/api/users/me`    | Retrieve authenticated user |
| PATCH  | `/api/users/{id}`  | Update profile              |
| DELETE | `/api/users/{id}`  | Delete profile              |

---

## Clip Endpoints

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| POST   | `/`                 | Create a new clip       |
| GET    | `/{clip_id}`        | Retrieve clip           |
| PATCH  | `/update/clip/{id}` | Update clip             |
| DELETE | `/delete/{id}`      | Delete clip             |
| GET    | `/user/{user_id}`   | Fetch user clip history |

---

# 🧱 Project Structure

```bash
VoidPaste/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   ├── auth.py
│   ├── middleware.py
│   │
│   └── routers/
│       ├── users.py
│       └── clips.py
│
├── voidpaste-client/
│   └── src/
│       ├── api.js
│       ├── context/
│       ├── components/
│       └── pages/
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/VoidPaste.git

cd VoidPaste
```

---

## Backend Setup

Create a virtual environment:

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend server:

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd voidpaste-client

npm install

npm run dev
```

The frontend communicates directly with the FastAPI backend using REST APIs.

---

# 🧠 What I Learned

### FastAPI

* Authentication workflows
* Dependency Injection
* Middleware development
* Route protection
* REST API design

### SQLAlchemy

* ORM relationships
* Async database operations
* Query optimization
* Joins and eager loading

### Authentication & Security

* JWT authentication
* Password hashing
* Ownership verification
* Access control patterns

### Middleware Development

* Request interception
* Bot detection
* User-Agent filtering
* Rate limiting

### Backend Architecture

* Separation of concerns
* Modular router design
* Privacy-aware query handling
* Frontend-backend integration

---

# 🌐 Frontend

While VoidPaste was primarily developed as a backend-focused project, it includes a complete React client for interacting with the API.

Frontend stack:

* React (Vite)
* Tailwind CSS
* Axios
* Framer Motion

The client handles:

* Authentication workflows
* Session management
* Protected routes
* Clip creation and editing
* Profile management
* Feed rendering

---

# ⚠️ Disclaimer

The backend architecture, authentication system, database design, API contracts, middleware implementation, and application logic were designed and implemented by me.

The frontend was developed through AI-assisted iteration based on requirements and design direction provided by me, enabling faster UI development while maintaining full control over project structure, integrations, and application behavior.

---

# 👨‍💻 Author

Built by **Kalash Desai**.

Feel free to explore the codebase, learn from the implementation, and build upon the ideas presented here.
