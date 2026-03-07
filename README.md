# 🎮 Gaming Vault: Full-Stack Discovery App

This is a professional gaming library application that allows users to explore titles using the **IGDB API**, manage a personal collection, and watch official trailers via **YouTube**.

## 📱 Project Overview
The application is designed with a **Mobile-First** approach, featuring a high-performance interactive UI with 3D flip-cards and a responsive video player.

## 📂 Project Structure
- **`/vault-backend`**: Node.js & TypeScript server handling OAuth2 authentication with Twitch/IGDB and metadata processing.
- **`/vault-frontend`**: React & Vite application optimized for mobile browsers with zero-zoom search and fluid animations.

## 🛠️ Technology Stack
- **Backend:** Node.js, Express, TypeScript, Axios.
- **Frontend:** React 18, Vite, TypeScript, CSS3 (Flexbox/Grid).
- **APIs:** IGDB (Twitch), YouTube Data API v3.

## 🔑 Setup & Environment Variables
Each part of the project requires its own setup. You must create a `.env` file in the **backend** folder with:
- `YOUTUBE_API_KEY`
- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`

## 🚀 How to Run
1. **Backend:** `cd vault-backend && npm install && npm run dev`
2. **Frontend:** `cd vault-frontend && npm install && npm run dev -- --host`

---
*Developed by **Tox** as an original full-stack implementation.*
