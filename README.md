# 📝 VoidPaste



> A modern backend-focused code snippet sharing platform built with FastAPI, SQLAlchemy

>

> VoidPaste allows developers to create, manage, and share code snippets through a clean and minimal interface. The platform includes secure authentication, profile privacy controls, custom middleware protections, and a structured backend architecture designed around modern FastAPI practices.

>

> Developed as a backend-focused learning project with emphasis on API design, authentication, database relationships, middleware development, and frontend integration.



---



# ✨ Features



* User registration and login

* JWT-based authentication

* Secure password hashing

* Create, edit, update, and delete code snippets

* Public homepage feed

* User-specific clip history

* Account privacy controls

* Protected routes and ownership validation

* Custom security middleware

* IP-based rate limiting

* Bot and scanner detection

* Responsive frontend interface

* Smooth Framer Motion interactions



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



### 1. User Authentication



Users create an account and log in through FastAPI authentication endpoints.



The backend:



* hashes passwords securely

* verifies login credentials

* generates JWT access tokens

* protects authenticated routes



---



### 2. Clip Management



Authenticated users can:



* create clips

* edit clips

* delete clips

* view their clip history



Ownership validation is enforced before any update or deletion operation.



---



### 3. Public Feed



The homepage displays clips from public accounts only.



Instead of filtering results after retrieval, the backend performs database-level filtering using SQL joins and privacy checks, ensuring private content never reaches application memory.



---



### 4. Privacy System



Users may enable:



```python

private_account = True

```



When enabled:



* all clips remain accessible to the owner

* clips are excluded from the global homepage feed

* privacy is enforced directly in database queries



---



# 🛡️ Custom Middleware



VoidPaste includes custom middleware designed to reduce unwanted traffic and demonstrate backend security concepts.



### Bot Scanner Protection



The middleware automatically blocks requests to common malicious scanning paths such as:



```text

/wp-admin

/phpmyadmin

/config.php

/.env

```



These paths are frequently targeted by automated bots searching for vulnerable applications.



---



### User-Agent Filtering



Requests originating from obvious scripting tools are denied.



Examples:



```text

curl

python-scripts

```



This helps reduce basic automated scraping attempts.



---



### Rate Limiting



An in-memory rate limiter tracks requests by IP address.



Current configuration:



```python

Rate_limit_window = 60

max_requests = 5

```



Meaning:



* Maximum 5 requests

* Per 60-second window

* Per client IP



Excessive requests receive:



```http

429 Too Many Requests

```



---



# 🧱 Database Structure



## Users Table



| Field           | Description     |

| --------------- | --------------- |

| id              | Primary Key     |

| username        | Unique username |

| email           | User email      |

| password_hash   | Hashed password |

| private_account | Privacy flag    |



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



### Relationship



```text

Users (1)

    │

    └──────< Clips (Many)

```



A single user may own multiple clips while each clip belongs to exactly one author.



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



## 1. Clone the repository



```bash

git clone https://github.com/YOUR-USERNAME/Void-Paste.git



cd Void-Paste

```



---



## 2. Create a virtual environment



### Windows



```bash

python -m venv venv



venv\Scripts\activate

```



### Mac/Linux



```bash

python3 -m venv venv



source venv/bin/activate

```



---



## 3. Install dependencies



```bash

pip install -r requirements.txt

```



---



## 4. Run the backend server



```bash

uvicorn main:app --reload

```

```



---



## 5. Run the frontend



```bash

npm install



npm run dev

```



The React frontend will communicate directly with the FastAPI backend.



---



# 📌 Main API Endpoints



| Method | Endpoint            | Description       |

| ------ | ------------------- | ----------------- |

| POST   | `/api/users/`       | Register user     |

| POST   | `/api/users/token`  | Login             |

| GET    | `/api/users/me`     | Current user      |

| POST   | `/`                 | Create clip       |

| GET    | `/{clip_id}`        | Fetch clip        |

| PATCH  | `/update/clip/{id}` | Update clip       |

| DELETE | `/delete/{id}`      | Delete clip       |

| GET    | `/user/{user_id}`   | User clip history |



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



* JWT tokens

* Password hashing

* Access control

* Ownership verification



### Backend Architecture



* Modular project structure

* Router separation

* Database abstraction

* Scalable API organization



### Middleware Design



* Request interception

* Rate limiting

* Bot detection

* Security-focused request filtering



### Frontend Integration



* React state management

* API communication with Axios

* Protected routes

* Modern SPA architecture



---



# 🎨 Frontend Design Goals



The frontend was intentionally designed to be:



* clean

* minimal

* responsive

* developer-focused

* distraction-free



The application follows a monochrome utility-first aesthetic built around content creation rather than flashy visual effects.



---



# ⚠️ Disclaimer



The backend architecture, authentication flow, database design, API contracts, middleware implementation, and application logic were designed and implemented by me.



The frontend implementation was developed through AI-assisted iteration based on detailed requirements and design direction provided by me, allowing faster UI development while maintaining full control over project structure and behavior.



---



# 👨‍💻 Author



Built by **Kalash Desai**.



Feel free to explore the codebase, learn from the implementation, and build upon the ideas presented here.
