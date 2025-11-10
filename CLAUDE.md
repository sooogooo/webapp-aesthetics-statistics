# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive React + TypeScript educational web application focused on probability distributions and their practical applications in the medical aesthetics industry. Built with Vite and uses Google's Gemini AI for interactive chat and design features.

## Development Commands

```bash
# Install dependencies
npm install
cd api && npm install && cd ..

# Development
npm run dev                # Frontend (port 3000)
cd api && npm run dev      # Backend (port 3001) - separate terminal

# Build
npm run build              # Production build
npm run build:analyze      # Build with bundle analysis
npm run preview            # Preview production build

# Testing
npm test                   # Run tests in watch mode
npm run test:ui            # Run tests with UI interface
npm run test:coverage      # Generate coverage report

# Code Quality
npm run lint               # Check code with ESLint
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
```

## Environment Setup

Before running the app, set the `GEMINI_API_KEY` in `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

The Vite config exposes this as both `process.env.API_KEY` and `process.env.GEMINI_API_KEY`.

## Architecture

### Application Structure

**Multi-Page SPA with Page-Based Navigation:**
- App uses a page-based routing system via `currentPage` state (not react-router)
- Page types defined in `types.ts`: `'dashboard' | 'models' | 'copilot' | 'designer' | 'article' | 'paths' | 'plan' | 'guide'`
- Main routing logic in `App.tsx` via `mainContent()` switch statement

**Context Providers (nested in App.tsx):**
1. `SettingsProvider` - User preferences (theme, font size, AI style/length)
2. `LoadingProvider` - Global loading state management
3. `ChatProvider` - Chat state coordination between components
4. `UserHistoryProvider` - Tracks viewed models and completed learning path steps

### Key Component Patterns

**Dashboard (components/Dashboard.tsx):**
- Entry point showing distribution categories and overview cards
- Provides navigation to specific models via `setSelectedId` and `setCurrentPage`

**ContentDisplay (components/ContentDisplay.tsx):**
- Main distribution detail page
- Displays mathematical formulas, parameters, applications, and interactive charts
- Uses `selectedDistribution` prop from `distributionsData`

**Chatbot (components/Chatbot.tsx):**
- Floating AI assistant using Google Gemini API
- Accessible from all pages
- Uses `ChatContext` for coordinated state across the app

**StatisticalCopilot (components/StatisticalCopilot.tsx):**
- Dedicated page for statistical analysis and file upload
- Full-page AI assistant experience

**AiDesigner (components/AiDesigner.tsx):**
- Image generation feature using Gemini's image generation capabilities
- Maintains design history in localStorage

### Data Structure

**Core Data Files (data/ directory):**
- `distributions.ts` - Main distribution models data (82KB, primary content)
- `chartData.ts` - Chart configurations for Chart.js visualizations
- `learningPaths.ts` - Structured learning paths linking multiple distributions
- `decisionGuide.ts` - Decision tree for tool selection
- `quizQuestions.ts` - Quiz data for learning reinforcement
- `deepAnalysis.ts` - Extended analysis content
- `promptTemplates.ts` - AI prompt templates for consistent responses
- `mockData.ts` - Sample data for demonstrations

**Distribution Data Model:**
```typescript
interface Distribution {
  id: number;
  name: string;
  title: string;
  description: string;
  parameters: string;
  formula: string;
  application: string[];
  takeaway: string;
  group: number;
  relatedModels?: { id: number; name: string; reason: string }[];
}
```

### State Management Patterns

**URL State Sharing:**
- The app supports `?modelId=X` query parameters for sharing specific distributions
- Handled in `App.tsx` useEffect on mount

**LocalStorage Usage:**
- User settings (via `SettingsContext`)
- Chat history (via `Chatbot` component)
- Design history (via `AiDesigner`)
- User guide acknowledgment (`hasSeenUserGuide`)
- User viewing history (via `UserHistoryContext`)
- Custom hook: `hooks/useLocalStorage.ts`

**Context Communication Pattern:**
- Components can trigger chat opening via `ChatContext.setInitialInput()`
- This opens the chatbot with pre-filled input
- Used for "Ask AI" buttons throughout the app

### Styling

**CSS Framework:**
- Uses Tailwind CSS via CDN (loaded in index.html)
- Custom CSS variables for theming in index.html
- Themes: mint (default), lavender, rose, peach
- Font sizes: sm (14px), md (16px), lg (18px)

**Theme System:**
- Theme switching via `SettingsContext`
- CSS custom properties pattern: `--color-primary`, `--color-bg-base`, etc.
- Applied dynamically to root element

### Path Alias

TypeScript and Vite configured with `@/` alias pointing to project root:
```typescript
import { Distribution } from '@/types';
import { distributionsData } from '@/data/distributions';
```

### Important Implementation Notes

**Dashboard Import:**
- Dashboard component uses named export, NOT default export
- Import as: `import { Dashboard } from './components/Dashboard'`

**Gemini API Integration:**
- API key accessed via `process.env.GEMINI_API_KEY`
- Used in Chatbot, StatisticalCopilot, and AiDesigner components
- File upload supported for analysis features

**Chart.js Integration:**
- Uses `react-chartjs-2` wrapper
- Chart configurations in `data/chartData.ts`
- Rendered in `DistributionChart.tsx` component

**Export Functionality:**
- PDF export using jsPDF + html2canvas
- Implemented in various components for report generation

## Language and Localization

The application is primarily in Chinese (Simplified):
- HTML lang attribute: `zh-CN`
- Font: Noto Sans SC from Google Fonts
- All content, UI text, and data in Chinese
- AI responses also in Chinese based on settings
