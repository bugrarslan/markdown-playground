# Markdown Playground

A modern, feature-rich Markdown editor and previewer built with Next.js 15, React 19, and TypeScript. Transform your Markdown content into beautifully rendered HTML in real-time with an elegant split-pane interface.

Markdown Playground is a web application that features real-time preview, persistent storage via IndexedDB, dark mode support, and a comprehensive custom Markdown parser. All documents are stored locally in the browser, ensuring privacy and offline functionality.

------------------------------------------------------------------------

## 📖 Table of Contents

-   🎯 Overview
-   ✨ Features
-   🛠 Tech Stack
-   🏗 Architecture
-   📁 Project Structure
-   🎨 Design Patterns
-   🚀 Key Implementation Details
-   🔧 Development Setup
-   📦 Building & Deployment
-   📄 License
-   📞 Support

------------------------------------------------------------------------

## 🎯 Overview

### Key Objectives

-   **Real-Time Preview:** Live Markdown to HTML rendering with debounced updates for optimal performance.
-   **Local-First Storage:** All documents and settings stored in IndexedDB for privacy and offline access.
-   **Modern UI/UX:** Split-pane editor with fullscreen support, theme toggle, and responsive design.
-   **Type Safety:** Full TypeScript implementation ensuring robust development and maintainability.
-   **Extensibility:** Custom Markdown parser with fallback support for advanced features.

### Project Metadata

-   **Version:** 0.1.0
-   **Platform:** Web (All modern browsers)
-   **Framework:** Next.js 15.3.1 with React 19
-   **Language:** TypeScript 5.x
-   **Build Tool:** Next.js with Turbopack

------------------------------------------------------------------------

## ✨ Features

### 📝 Markdown Editing

-   **Live Preview:** Real-time HTML rendering as you type with 300ms debounce optimization.
-   **Split-Pane Interface:** Side-by-side editor and preview panes for seamless workflow.
-   **Syntax Support:**
    -   Headers (H1-H6)
    -   Bold, italic, and inline code
    -   Links and images (including badge-style links)
    -   Bullet and numbered lists (with nesting)
    -   Task lists with checkboxes
    -   Blockquotes
    -   Code blocks with syntax highlighting support
    -   Tables with alignment
    -   Horizontal rules
    -   Footnotes with references
-   **Keyboard Shortcuts:**
    -   `Ctrl/⌘ + S`: Save document
    -   `Ctrl/⌘ + 1/2/3`: Load sample documents
    -   `F11`: Toggle fullscreen

### 📚 Document Management

-   **Auto-Save:** Automatic document persistence to IndexedDB with debounced saves.
-   **Sample Documents:** Three built-in sample documents to demonstrate features:
    -   Welcome: Basic Markdown introduction
    -   Features: Advanced formatting showcase
    -   Usage: How-to guide with code examples
-   **Custom Documents:** Create and edit your own documents with automatic state detection.
-   **Export:** Download rendered HTML with embedded styles for sharing.

### 🎨 Appearance & Customization

-   **Theme System:** Light and dark mode with smooth transitions.
-   **Theme Persistence:** Theme preference stored in IndexedDB.
-   **Responsive Design:** Fully responsive layout adapting to different screen sizes.
-   **Custom Styling:** Beautiful prose rendering with custom CSS for optimal readability.
-   **Fullscreen Mode:** Distraction-free editing with fullscreen toggle for editor and preview.

### 💾 Storage & Performance

-   **IndexedDB Integration:** Dexie.js-powered database for settings and documents.
-   **Debounced Updates:** Optimized rendering with 300ms debounce to reduce CPU usage.
-   **Dynamic Imports:** Lazy loading of Markdown parsing libraries for faster initial load.
-   **Fallback Parser:** Custom lightweight parser ensures functionality even if libraries fail.
-   **Browser-Native Storage:** No external databases or authentication required.

------------------------------------------------------------------------

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Core Framework | Next.js 15.3.1, React 19, TypeScript 5 | Modern React framework with server and client components |
| Styling | Tailwind CSS 4.1, PostCSS, CSS Variables | Utility-first CSS with custom theming support |
| State Management | React Hooks, Custom Context | Local state management with reusable custom hooks |
| Markdown Processing | unified, remark, rehype | Pluggable Markdown parsing and HTML generation |
| Storage | Dexie.js 4.2, IndexedDB | Type-safe IndexedDB wrapper for local persistence |
| Build Tools | Next.js Compiler, Turbopack | Fast builds and hot module replacement |
| Code Quality | ESLint, TypeScript | Linting and type checking for code quality |
| Fonts | Geist Sans, Geist Mono | Modern, clean typography from Vercel |

------------------------------------------------------------------------

## 🏗 Architecture

Markdown Playground follows a **component-based architecture** with clear separation of concerns and React best practices.

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Components, Page, Layout)                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Application Layer                   │
│  (Custom Hooks, State Management)           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Service Layer                     │
│  (Markdown Parser, IndexedDB Service)       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Data Layer                        │
│  (IndexedDB, Browser Storage)               │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities

-   **Presentation Layer (components/, app/):** React components handling UI rendering and user interactions.
-   **Application Layer (hooks/):** Custom hooks encapsulating business logic and state management.
-   **Service Layer (hooks/useMarkdownParser.ts, hooks/useIndexedDB.ts):** Data processing and storage operations.
-   **Data Layer:** Browser-native IndexedDB for persistent storage.

------------------------------------------------------------------------

## 📁 Project Structure

```
markdown-playground/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Global styles and theme variables
│   ├── components/
│   │   ├── Editor.tsx          # Markdown editor with keyboard shortcuts
│   │   ├── Preview.tsx         # HTML preview with export functionality
│   │   ├── ThemeToggle.tsx     # Dark/light theme switcher
│   │   ├── FullscreenToggle.tsx # Fullscreen mode toggle
│   │   └── SampleSelector.tsx  # Sample document loader
│   └── hooks/
│       ├── useDebounce.ts      # Debounce hook for performance
│       ├── useIndexedDB.ts     # IndexedDB operations wrapper
│       └── useMarkdownParser.ts # Markdown to HTML parser
├── public/
│   └── samples/
│       ├── intro.md            # Welcome sample
│       ├── features.md         # Features showcase
│       └── usage.md            # Usage guide
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── postcss.config.mjs          # PostCSS configuration
└── package.json                # Dependencies and scripts
```

**File Naming Conventions**
- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Pages: `camelCase.tsx`
- Configs: `*.config.*`

------------------------------------------------------------------------

## 🎨 Design Patterns

-   **Custom Hook Pattern:** Reusable logic encapsulated in custom hooks (`useDebounce`, `useIndexedDB`, `useMarkdownParser`).
-   **Controlled Component Pattern:** Editor component fully controlled by parent state.
-   **Compound Component Pattern:** Preview component with integrated export functionality.
-   **Singleton Pattern:** Single Dexie database instance shared across the application.
-   **Fallback Pattern:** Graceful degradation with custom parser when unified fails.
-   **Optimistic UI Pattern:** Immediate theme changes with async persistence.

------------------------------------------------------------------------

## 🚀 Key Implementation Details

### IndexedDB Schema

```typescript
// Database: MarkdownPlayground
{
  settings: {
    key: string (primary key)
    value: any
  },
  documents: {
    id: number (auto-increment primary key)
    content: string
  }
}
```

**Settings Stored:**
- `theme`: 'light' | 'dark'

**Documents:**
- Only the most recent document is stored
- Auto-saved every 300ms after changes
- Retrieved on application load

### Markdown Parser Implementation

**Dual Parser Strategy:**

1. **Primary Parser (unified + remark + rehype):**
   - Production-grade Markdown parsing
   - CommonMark compliant
   - Sanitized HTML output

2. **Fallback Parser (Custom implementation):**
   - Lightweight alternative when primary fails
   - Supports advanced features:
     - Task lists with checkboxes
     - Tables with alignment
     - Footnotes with back-references
     - Image badges (linked images)
     - Nested lists
     - Horizontal rules
   - Automatically used for complex Markdown patterns

**Smart Detection:**
```typescript
// Automatically uses fallback for:
- Footnotes: [^1] syntax
- Tables: pipe-delimited tables
- Task lists: - [ ] and - [x]
- Complex images: badge patterns
- Horizontal rules: ---, ***, ___
```

### Theme System

**CSS Variables-Based Theming:**
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --text-primary: #111827;
  /* ... */
}

.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --text-primary: #f8fafc;
  /* ... */
}
```

**Hydration-Safe Theme Loading:**
- Inline script in `<head>` to prevent flash
- IndexedDB query before React hydration
- Smooth 200ms transitions between themes

### Performance Optimizations

1. **Debounced Markdown Parsing:** 300ms delay reduces unnecessary renders
2. **Dynamic Imports:** Markdown libraries loaded on-demand
3. **Memoized Callbacks:** `useCallback` prevents unnecessary re-renders
4. **Efficient Storage:** Single document storage prevents IndexedDB bloat

------------------------------------------------------------------------

## 🔧 Development Setup

### Prerequisites

-   Node.js 20+ (recommended for Next.js 15)
-   npm, yarn, pnpm, or bun package manager
-   Modern web browser with IndexedDB support

### Installation

```bash
git clone https://github.com/bugrarslan/markdown-playground.git
cd markdown-playground
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint for code quality
```

------------------------------------------------------------------------

## 📦 Building & Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deployment Options

**Vercel (Recommended):**
```bash
vercel
```

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Static Export:**
```javascript
// next.config.ts
const nextConfig = {
  output: 'export',
};
```

### Environment Variables

No environment variables required. All configuration is client-side.

------------------------------------------------------------------------

## 📄 License

This project is proprietary software.
All rights reserved.
© 2025 Bugra Arslan

------------------------------------------------------------------------

## 📞 Support

For issues or feedback:
**GitHub Issues:** [github.com/bugrarslan/markdown-playground/issues](https://github.com/bugrarslan/markdown-playground/issues)

------------------------------------------------------------------------

## 🌟 Highlights

-   ✅ **Zero Dependencies on External Services** - Fully client-side application
-   ✅ **Privacy First** - All data stored locally in your browser
-   ✅ **Modern Stack** - Latest Next.js, React, and TypeScript
-   ✅ **Comprehensive Markdown Support** - Including tables, footnotes, and task lists
-   ✅ **Production Ready** - Type-safe, tested, and optimized
-   ✅ **Open Source Ready** - Clean code structure and documentation

Built with ❤️ using Next.js, React, and TypeScript.
