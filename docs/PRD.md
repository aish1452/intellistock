# Product Requirements Document (PRD)

## Project Name: IntelliStock
**Version**: 1.0.0

### Objective
Build an AI-Powered Inventory Management & Demand Forecasting System that allows organizations to track inventory, record sales, predict future demand using Machine Learning, and manage users.

### Target Audience
- **Wait/Admins**: Full control over staff, inventory, and system setup.
- **Managers**: Manage product catalog, adjust inventory thresholds, and record sales.
- **Analysts**: Generate AI forecasts and review overall metrics.
- **Viewers**: Read-only access to dashboards.

### Core Features
- **Role-based Auth (JWT)**: Security layered across frontend routes and backend APIs.
- **Dashboard**: Top level KPIs with React Query and Recharts.
- **Catalog Management**: Add, update, and sort goods.
- **Dynamic Inventory**: Stock levels updated automatically by transactional sales.
- **Demand Forecasting**: Integrated TensorFlow LSTM engine to predict stock requirements based on 90-day rolling data windows.

### Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, Recharts, Zustand.
- Backend: Node.js, Express, Sequelize, MySQL 8.
- ML Service: Python 3.11, FastAPI, TensorFlow 2.
