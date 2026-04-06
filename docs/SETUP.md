# IntelliStock Setup Guide

## Requirements
- Node.js 20+
- Python 3.11+
- Local MySQL 8 Server running on 3306.

## 1. Environment Variables
1. Duplicate `backend/.env.example` -> `backend/.env`
2. Duplicate `ml-service/.env.example` -> `ml-service/.env`
3. In both files, set `DB_PASSWORD` to your local MySQL root password.

## 2. Bootstrapping Database & Backend
1. Navigate to `backend/`
2. Run `npm install`
3. Run `npm run seed` (We highly recommend doing this via `node seeders/seed.js` directly first to populate mocked LSTM seed data).
4. Run `npm start`

## 3. Data Science Engine
1. Navigate to `ml-service/`
2. Make sure you have activated virtual environment `venv\Scripts\activate`
3. Execute `uvicorn main:app --reload --port 8000`

## 4. Web Application (Frontend)
1. Navigate to `frontend/`
2. Ensure you ran `npm install`
3. Execute `npm run dev`
4. Access via URL. Use `admin@intellistock.com` : `Admin@1234`
