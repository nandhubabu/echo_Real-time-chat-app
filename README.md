# ⚡ Echo — Real-Time Chat Application

Echo is a full-stack, real-time messaging application built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. Designed with modern design principles, Echo offers instant communication, user handle discovery (`@username`), secure cookie-based authentication, and a responsive themeable UI.

---

## ✨ Features

- 💬 **Real-Time Messaging:** Instant bidirectional message delivery powered by Socket.io.
- 👤 **Handle & Search System:** Search and connect with users using `@username`, email, or unique IDs.
- 🟢 **Online Status Tracking:** Live status indicators for online/offline contact updates.
- 🔐 **Secure Authentication:** JWT authentication stored securely in `httpOnly` cookies with bcrypt password hashing.
- 🎨 **Modern Aesthetics:** Clean, Apple/Telegram-inspired pill-card UI with 1-click Light & Dark theme toggle.
- 🐳 **Docker Support:** Fully containerized setup with Docker & Docker Compose for seamless local development.
- 🔄 **Automated CI Pipeline:** GitHub Actions workflow verifying automated builds for both client and server on every PR.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, DaisyUI
- **State Management:** Zustand
- **Icons & UI Utilities:** Lucide React, Canvas Confetti
- **Real-Time Client:** Socket.io-client

### **Backend**
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Real-Time Engine:** Socket.io
- **Security & Auth:** JSON Web Tokens (JWT), bcryptjs, `cookie-parser`, CORS

### **DevOps & Deployment**
- **CI/CD:** GitHub Actions (`ci.yml`)
- **Containerization:** Docker & Docker Compose
- **Hosting:** Vercel (Frontend) & Render (Backend)

---

## 📁 Repository Structure

```
echo-real-time-chat-app/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI Workflow
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, ChatContainer, etc.)
│   │   ├── pages/          # Page Views (LoginPage, SignUpPage, ProfilePage)
│   │   ├── store/          # Zustand Stores (useAuthStore, useChatStore)
│   │   └── lib/            # Axios instance and utilities
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express + Socket.io Backend
│   ├── controllers/        # Route Handlers (auth, message)
│   ├── models/             # Mongoose Schemas (User, Message)
│   ├── routes/             # API Endpoints
│   ├── lib/                # Database and Socket initializations
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Multi-container Orchestration
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or v20 recommended)
- MongoDB database (Local instance or MongoDB Atlas URI)
- Git & Docker (optional, for containerized run)

---

### Option A: Running Locally (Node.js)

#### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/echo-real-time-chat-app.git
cd echo-real-time-chat-app
```

#### 2. Configure Environment Variables

Create `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/echo_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Create `.env` file inside the `client/` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
```

#### 3. Install dependencies and start development servers

**Start Backend:**
```bash
cd server
npm install
npm run dev
```

**Start Frontend (in a new terminal):**
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### Option B: Running with Docker Compose 🐳

To spin up both frontend and backend in isolated containers with one command:

```bash
docker-compose up --build
```

Access the application at `http://localhost:5173`.

---

## 🧪 CI/CD Pipeline

This repository uses **GitHub Actions** for continuous integration.

Every push or pull request to `main` executes:
1. **Frontend Job:** Checks out code, sets up Node 20, installs dependencies, and runs `npm run build`.
2. **Backend Job:** Checks out code, sets up Node 20, installs dependencies, and validates entry point compatibility.

---

## 🔒 Environment Variables Reference

| Variable | Description | Location |
|---|---|---|
| `PORT` | Backend server port (default `5000`) | Server |
| `MONGO_URI` | MongoDB connection string | Server |
| `JWT_SECRET` | Secret key used for signing JWT tokens | Server |
| `NODE_ENV` | `development` or `production` | Server |
| `CLIENT_URL` | Frontend origin URL for CORS policy | Server |
| `VITE_BACKEND_URL` | Base API URL pointing to Express backend | Client |

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the project repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.
