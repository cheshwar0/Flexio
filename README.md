# Weekly Top 10 Performers — Corporate TV Display & HR Admin Recognition System

A production-ready corporate employee-recognition web application designed to run autonomously on large office televisions (1080p & 4K), paired with a secure HR Administration suite for managing employees and publishing weekly leaderboards.

---

## 🌟 Key Highlights & Features

- **📺 Autonomous Public TV Display (`/display`)**:
  - High-impact corporate dark navy theme (`#080E1E`) with gold, silver, and bronze visual ranking hierarchy.
  - **Rank 1**: Premium gold highlight, golden champion crown badge, and enlarged portrait.
  - **Rank 2**: Silver accent badge and polished card aesthetics.
  - **Rank 3**: Bronze accent badge.
  - **Ranks 4–10**: Consistent, elegant glassmorphism cards.
  - **Continuous 5-Second Horizontal Carousel**: Automatically advances every 5,000 ms, looping smoothly without mouse/keyboard intervention.
  - **Independent 60-Second Background Sync**: Silently pulls newly published weekly leaderboards and auto-updates the display without interrupting the ongoing carousel rotation.
  - **Offline Resilience**: Retains the last loaded leaderboard in memory if connectivity drops, showing a discreet status badge, and auto-recovers when back online.
  - **Unpublished Fallback**: When no rankings have been published, cleanly displays: *"Weekly rankings will be announced soon."*

- **🛡️ Secure HR Administration Portal (`/admin/login`)**:
  - First-time admin initialization wizard (permanently locks once the first admin is created).
  - Rate-limited login protected with bcrypt password hashing and short-lived JWT access tokens.
  - **Employee Management**: Create, edit, search, filter, and deactivate employees (historical rankings are strictly preserved).
  - **Cloudinary Image Integration**: Upload or replace employee headshots directly to Cloudinary with automatic facial-recognition centering, or use the built-in local development fallback.
  - **Scorecard Formulation**: Add up to 10 employees to a week, enter performance scores (0–1000) and achievement quotes.
  - **Dual Ranking Modes**: Choose between **Automatic** (sorted descending by score) or **Manual** (HR-ordered rankings).
  - **Leaderboard Simulator**: Live visual modal to preview the exact TV presentation before publishing.
  - **One-Click TV Publishing**: Instant broadcast of approved draft results to all office TV screens.
  - **Historical Archives**: Access past weekly rankings with scores and achievements preserved.
  - **Corporate Branding Settings**: Configure company name, logo, footer slogan, and rotation intervals.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Multer, Helmet, CORS, express-rate-limit |
| **Database** | MongoDB Atlas M0 Free Cluster (via Mongoose), In-Memory local fallback |
| **Asset Storage** | Cloudinary (Free Tier) with automatic face-detection cropping |
| **Testing** | Vitest, Supertest, React Testing Library, JSDOM |
| **Deployment** | Vercel (Frontend Free), Render (Backend Free) |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **npm** v9+

### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
- Server starts on `http://localhost:5000`
- If no `MONGODB_URI` is provided, it automatically boots a high-speed in-memory database and seeds demo employees and active week `2026-W42`!
- Default HR credentials:
  - **Email**: `admin@flexio.internal`
  - **Password**: `AdminPass123!`

### 3. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
- Client starts on `http://localhost:5173`
- Open `http://localhost:5173/display` for the **TV Display**
- Open `http://localhost:5173/admin/login` for the **HR Admin Portal**

---

## 🍃 MongoDB Atlas M0 Free Cluster Setup Guide

Follow these steps to connect your production MongoDB database:

1. **Create an Account**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. **Create a Free Cluster**:
   - In the Atlas dashboard, click **"Create Deployment"**.
   - Select **M0 Free (Shared Cluster)**.
   - Choose your preferred cloud provider (AWS / GCP / Azure) and region closest to your office or server.
   - Name your cluster (e.g. `Cluster0`) and click **"Create"**.
3. **Create Database User Credentials**:
   - Navigate to **Security > Database Access**.
   - Click **"Add New Database User"**.
   - Select **Password Authentication**. Set a secure username (e.g. `flexio_admin`) and a strong password.
   - Assign the **"Read and write to any database"** built-in role.
4. **Configure Network Access**:
   - Navigate to **Security > Network Access**.
   - Click **"Add IP Address"**.
   - For Render/cloud deployment, select **"Allow Access from Anywhere"** (`0.0.0.0/0`) or enter your hosting provider's egress IP range.
5. **Obtain Connection String**:
   - Navigate to **Deployments > Database > Connect**.
   - Choose **"Drivers"** (Node.js).
   - Copy the SRV URI string. It will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/flexio_leaderboard?retryWrites=true&w=majority
     ```
6. **Set Backend Environment Variable**:
   - In `backend/.env` (or in Render environment variables):
     ```env
     MONGODB_URI=mongodb+srv://flexio_admin:<password>@cluster0.xxxxx.mongodb.net/flexio_leaderboard?retryWrites=true&w=majority
     ```

*Free Tier Limit*: MongoDB Atlas M0 provides 512 MB storage and shared RAM, which comfortably supports tens of thousands of corporate employees and weekly archives.

---

## ☁️ Cloudinary Image Storage Integration

The application uses Cloudinary to store high-resolution employee headshots, applying automatic face detection (`gravity: 'face'`, `crop: 'fill'`) to optimize images for high-definition TV displays.

### Setup Instructions:
1. Register for a free account at [cloudinary.com](https://cloudinary.com).
2. From your Cloudinary Dashboard, copy:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Configure in `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
*(Note: If Cloudinary keys are omitted during development, the backend automatically falls back to clean base64 data streams, ensuring testing never fails.)*

---

## 📺 Office TV Full-Screen & Kiosk Mode Setup

The public display endpoint `/display` is engineered to run 24/7 on office TVs without requiring mouse or keyboard inputs.

### Method 1: Google Chrome / Microsoft Edge Kiosk Mode (Recommended)
Create a Windows desktop shortcut or startup script with the following command:

```cmd
# Google Chrome
chrome.exe --kiosk --incognito --disable-pinch --overscroll-history-navigation=0 http://localhost:5173/display

# Microsoft Edge
msedge.exe --kiosk http://localhost:5173/display --edge-kiosk-type=fullscreen
```

### Method 2: Smart TV / Mini PC Browser Fullscreen
1. Open the built-in browser on your TV or stick (Apple TV, Fire TV, Raspberry Pi).
2. Navigate to your deployed URL ending in `/display`.
3. Press **F11** on your keyboard, or hover over the top-right corner of the screen and click the discreet **Fullscreen icon**.
4. In your TV's system settings, ensure that sleep/screensaver mode is disabled during office hours.

---

## 🌐 Free Hosting & Deployment

### 1. Frontend on Vercel Free
1. Push your repository to GitHub.
2. Sign in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository and select the **`frontend`** directory as root.
4. Set Framework Preset to **Vite**.
5. Add the environment variable:
   - `VITE_API_URL`: Your deployed backend URL + `/api` (e.g. `https://flexio-backend.onrender.com/api`)
6. Deploy!

### 2. Backend on Render Free
1. Sign in to [render.com](https://render.com) and create a **"New Web Service"**.
2. Connect your repository and select the **`backend`** directory as root.
3. Configure:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. In **Environment Variables**, set:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure 32+ character string
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret
   - `CORS_ORIGIN`: Your deployed Vercel domain (e.g. `https://flexio-display.vercel.app`)

> **Free Tier Notice (Render Cold Starts)**: Render free web services spin down after 15 minutes of inactivity. When the TV requests data after a dormant period, the first request may take 30–50 seconds while the instance boots. The TV frontend's resilience system gracefully retains cached leaderboard data in memory during wake-up and connects automatically once ready.

---

## 🧪 Automated Test Verification

Both test suites were executed and verified locally:

```bash
# Run all tests across backend and frontend
npm test
```

### Backend Test Results (11 tests passed):
- ✅ Automatic ranking orders performers by score descending.
- ✅ Rejection of duplicate employee IDs within the same leaderboard.
- ✅ Rejection of leaderboards exceeding 10 employees.
- ✅ Validation of manual rankings and duplicate rank detection.
- ✅ Support for ties when enabled.
- ✅ Score boundary validation (0–1000).
- ✅ Public display endpoint sanitization (sensitive fields hidden).
- ✅ Authentication enforcement on employee management routes.
- ✅ Authentication enforcement on weekly leaderboard routes.

### Frontend Test Results (7 tests passed):
- ✅ `useCarousel` initializes index 0 and calculates slide limits.
- ✅ `useCarousel` automatically advances every 5 seconds (5000ms).
- ✅ `useCarousel` loops continuously back to index 0.
- ✅ `useCarousel` cleans up interval timers on unmount (zero memory leaks).
- ✅ `useCarousel` prevents scrolling if items count is less than cardsPerView.
- ✅ `PerformerCard` renders Rank 1 champion styling, badge, score, and achievement quotes.
- ✅ `PerformerCard` renders Rank 2 and subsequent ranks properly.
