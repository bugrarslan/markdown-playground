# Live Markdown Playground

A **client-only**, real-time Markdown editor with live HTML preview built with React, TypeScript, and Next.js. No backend required—everything runs in the browser.

## 🚀 **Live Demo**
Visit the deployed application: [Live Markdown Playground](https://your-deployed-url.com)

## ✨ **Features**

### **Core Requirements**
- ✅ **Real-time Markdown Rendering** - Live preview updates on every keystroke with 300ms debouncing
- ✅ **Dynamic Parser Loading** - Markdown parsers loaded via dynamic imports for optimal performance
- ✅ **Sample Documents** - Three pre-built samples: intro.md, features.md, usage.md
- ✅ **Theme Toggle** - Light/dark mode with IndexedDB persistence
- ✅ **Document Persistence** - Auto-saves and restores last-edited document using IndexedDB
- ✅ **Responsive Layout** - Side-by-side on desktop, stacked on mobile

### **Bonus Features Implemented**
- 🎁 **Custom Shortcuts** - Ctrl/Cmd+S to save, Ctrl/Cmd+1/2/3 for samples, F11 for fullscreen
- 🎁 **Multiple Fullscreen Modes** - Browser fullscreen, editor-only, preview-only
- 🎁 **Advanced Markdown Extensions** - Footnotes[^1], tables, task lists, horizontal rules
- 🎁 **Export HTML** - Download rendered content as standalone HTML file
- 🎁 **Accessibility** - Semantic HTML, keyboard navigation, proper ARIA labels

[^1]: Footnotes work with bidirectional navigation and auto-numbering

## 🏗️ **Architecture & Approach**

### **Technology Stack**
- **Framework**: Next.js 15.3.1 with App Router
- **Language**: TypeScript 5+ with strict type checking
- **Styling**: Tailwind CSS v4.1.13 with custom CSS properties for theming
- **Database**: IndexedDB with Dexie.js 4.2.0 (zero localStorage usage)
- **Markdown Processing**: unified + remark + rehype ecosystem with sanitization

### **Key Design Decisions**

#### **1. Dual Parser Strategy**
- **Primary**: unified + remark + rehype for standard markdown
- **Fallback**: Custom parser for advanced features (footnotes, tables, task lists)
- **Smart Detection**: Automatically chooses best parser based on content analysis

```typescript
// Smart parser selection
if (markdown.includes('[^') && /\[\^[^\]]+\]/.test(markdown)) {
  return simpleMarkdownParser(markdown); // Use fallback for footnotes
}
```

#### **2. Performance Optimizations**
- **Debounced Rendering**: 300ms delay prevents excessive parser calls
- **Dynamic Imports**: Markdown parsers loaded only when needed
- **Code Splitting**: Production bundle analysis shows proper chunk separation
- **Memoization**: useCallback and dependency arrays minimize re-renders

#### **3. State Management Strategy**
- **Local State**: React hooks for UI state and real-time editing
- **Persistent State**: IndexedDB for theme preferences and document content
- **Smart Document Switching**: Distinguishes between samples and custom documents

### **Project Structure**
```
src/
├── app/
│   ├── globals.css          # Tailwind + custom CSS variables
│   ├── layout.tsx           # Root layout with theme support
│   └── page.tsx             # Main application logic
├── components/
│   ├── Editor.tsx           # Markdown input with syntax highlighting
│   ├── Preview.tsx          # HTML preview with export functionality
│   ├── ThemeToggle.tsx      # Light/dark theme switcher
│   ├── FullscreenToggle.tsx # Browser fullscreen functionality
│   └── SampleSelector.tsx   # Sample document dropdown
├── hooks/
│   ├── useIndexedDB.ts      # Database operations with Dexie
│   ├── useMarkdownParser.ts # Dynamic parser loading & smart selection
│   └── useDebounce.ts       # Performance optimization utility
public/
├── samples/
│   ├── intro.md            # Welcome & basic syntax
│   ├── features.md         # Feature overview with footnotes
│   └── usage.md            # Usage instructions with code blocks
```

## 🔄 **Trade-offs & Decisions**

### **Performance vs Features**
- **Trade-off**: Dual parser system adds complexity but enables advanced features
- **Decision**: Built custom fallback parser for features not supported by unified
- **Result**: Best of both worlds - performance for simple markdown, features for complex

### **Bundle Size vs Functionality**
- **Trade-off**: Multiple fullscreen modes and extensions increase bundle size
- **Decision**: Used dynamic imports and code splitting to defer loading
- **Result**: Initial bundle stays lean while providing rich functionality

### **Type Safety vs Development Speed**
- **Trade-off**: Strict TypeScript slows initial development
- **Decision**: Invested in proper typing from the start
- **Result**: Fewer runtime errors, better developer experience, maintainable code

### **CSS Approach**
- **Trade-off**: Tailwind vs CSS Modules vs Styled Components
- **Decision**: Tailwind + CSS custom properties for theming
- **Result**: Rapid development, consistent design system, perfect theme switching

## 🛠️ **How to Run**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Installation & Development**
```bash
# Clone the repository
git clone https://github.com/bugrarslan/sevenapps-react-case-study.git
cd sevenapps-react-case-study

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### **Production Build**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or serve static files
npm run build && npx serve out
```

### **Verify Dynamic Imports**
```bash
# Check bundle analysis
npm run build

# Look for separated chunks in output:
# ✓ chunks/4bd1b696-*.js (unified parser)
# ✓ chunks/684-*.js (main app)
```

## 🧪 **Testing the Features**

### **Markdown Extensions**
Try these in the editor:

```markdown
## Tables
| Feature | Status |
|---------|--------|
| Tables  | ✅     |
| Tasks   | ✅     |

## Task Lists  
- [x] Completed task
- [ ] Pending task

## Footnotes
Here's a footnote reference[^1]

[^1]: This is the footnote content

## Horizontal Rules
---
```

### **Keyboard Shortcuts**
- `Ctrl/Cmd + S` - Save document
- `Ctrl/Cmd + 1/2/3` - Load sample documents
- `F11` - Toggle browser fullscreen
- Individual fullscreen buttons in editor/preview headers

### **Theme & Persistence**
1. Toggle between light/dark themes
2. Edit content and refresh page
3. Verify theme and content persist via IndexedDB

## 📊 **Technical Achievements**

### **Requirements Compliance**
- ✅ **React Hooks**: useState, useEffect, useCallback, custom hooks
- ✅ **TypeScript**: Strict typing, interfaces, proper declarations
- ✅ **Dynamic Imports**: Parser code split from main bundle
- ✅ **IndexedDB**: Complete CRUD operations, no localStorage
- ✅ **Responsive Design**: Mobile-first with proper breakpoints
- ✅ **Security**: HTML sanitization with rehype-sanitize

### **Performance Metrics**
- **First Load JS**: 138kB (well-optimized)
- **Code Splitting**: Parser chunks separate from main bundle
- **Rendering**: <300ms debounced updates
- **Persistence**: <50ms IndexedDB operations

### **Code Quality**
- **TypeScript**: 100% type coverage, no `any` types
- **ESLint**: Clean code, no warnings
- **Architecture**: Modular, reusable components
- **Error Handling**: Comprehensive error boundaries and fallbacks

---