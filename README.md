<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

[![CI](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/ci.yml)
[![E2E & Performance](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/e2e-performance.yml/badge.svg)](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/e2e-performance.yml)
[![Deploy](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/webapp-aesthetics-statistics/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/your-username/webapp-aesthetics-statistics/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/webapp-aesthetics-statistics)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

# 医美统计学应用指南

An interactive React + TypeScript web application focused on probability distributions and their practical applications in the medical aesthetics industry.

View your app in AI Studio: https://ai.studio/apps/drive/1hRIiXCx8xjKqJubwnQwqUtw_-28uDaBq

## 🚀 Quick Start

**Live Demo**: [Coming Soon]
**Documentation**: See [CLAUDE.md](CLAUDE.md) for detailed architecture
**CI/CD**: Automated testing and deployment via GitHub Actions

## Architecture

This project uses a **client-server architecture** to protect API keys:

- **Frontend**: React app running on port 3000
- **Backend API**: Express server running on port 3001 (proxies requests to Gemini API)

## Prerequisites

- Node.js (v18 or higher recommended)
- A valid Gemini API key

## Setup & Installation

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend API Dependencies

```bash
cd api
npm install
cd ..
```

### 3. Configure Environment Variables

**Frontend (.env.local):**

```bash
# For AiDesigner component (temporary, will be migrated)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (optional, defaults to http://localhost:3001)
VITE_API_URL=http://localhost:3001
```

**Backend (api/.env):**

```bash
cp api/.env.example api/.env
# Edit api/.env and add your GEMINI_API_KEY
```

⚠️ **SECURITY WARNING**:

- **NEVER commit `.env` or `.env.local` files to Git**
- The `.gitignore` file is configured to prevent this, but always double-check
- If you accidentally expose your API key, rotate it immediately in Google AI Studio

## Running the Application

You need to run **both** the frontend and backend servers:

### Terminal 1 - Backend API Server

```bash
cd api
npm run dev
```

The API server will start on http://localhost:3001

### Terminal 2 - Frontend Development Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000

### Alternative: Using a Process Manager

You can use `concurrently` or `pm2` to run both servers from a single command:

```bash
# Install concurrently (one-time)
npm install -g concurrently

# Run both servers
concurrently "cd api && npm run dev" "npm run dev"
```

## Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Run backend in production mode
cd api
npm start
```

## Project Structure

```
webapp-aesthetics-statistics/
├── api/                    # Backend API server
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── .env              # Backend environment variables (not committed)
├── components/            # React components
├── contexts/              # React context providers
├── data/                  # Static data and configurations
├── services/              # API service layer
│   └── api.ts            # Client-side API service
├── hooks/                 # Custom React hooks
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
└── vite.config.ts        # Vite configuration

```

## Available Scripts

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analysis
- `npm run preview` - Preview production build

**Testing:**

- `npm test` - Run unit tests in watch mode
- `npm run test:ui` - Run unit tests with UI
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run unit tests with coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests in UI mode
- `npm run test:e2e:visual` - Run visual regression tests
- `npm run test:e2e:report` - View E2E test report

**Performance:**

- `npm run perf` - Run Lighthouse performance analysis
- `npm run perf:collect` - Collect Lighthouse data only
- `npm run perf:assert` - Check performance budgets

**Code Quality:**

- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

**Backend:**

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server

## Features

✅ Interactive statistical distribution learning
✅ AI-powered chatbot assistant
✅ File analysis and data insights
✅ AI image generation for marketing materials
✅ Learning paths and quizzes
✅ A/B test calculator
✅ Customizable themes and settings

## Quality Assurance

✅ 93.75% unit test coverage (Vitest)
✅ 34+ E2E tests covering critical user flows (Playwright)
✅ Visual regression testing for UI consistency
✅ Automated performance monitoring (Lighthouse CI)
✅ Performance budgets (80%+ scores, Core Web Vitals)
✅ Git hooks for automated quality checks

## Security Features

✅ API keys protected on backend server
✅ Rate limiting (100 requests/15min globally, 20 requests/min for AI)
✅ CORS protection
✅ Request validation and sanitization

## Need Help?

See [CLAUDE.md](CLAUDE.md) for detailed architectural documentation and development guidelines.
