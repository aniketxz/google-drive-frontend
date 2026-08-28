# 📁 Google Drive Clone — Frontend

A high-fidelity **Google Drive Clone** built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Zustand**, and **TanStack Query**. It replicates the layout, design system, interactions, and responsive UI of the Google Drive web interface.

---

## ✨ Available Features

### 📁 File Explorer & Navigation
- **My Drive & Folder Hierarchy**: Full nested folder navigation (`/drive/folders/:id`) with path breadcrumbs.
- **Grid & List View Switcher**: Segmented icon switcher (`[ ☰ List | ▦ Grid ]`) with persistent view mode state.
- **Filter Chips**: Real-time filtering by item type: `All`, `Folders`, `PDFs`, `Documents`, `Spreadsheets`, `Images`, and `Videos`.
- **Sorting Options**: Cycle sorting items by **Name**, **Date Modified**, and **File Size**.
- **Search Bar**: Debounced live search with URL query synchronization (`?q=`).

### 🛠️ File & Folder Operations
- **Folder Creation**: Create new subfolders instantly via modal dialogs.
- **S3 Chunked File Uploads**: Drag-and-drop dropzone with multipart chunked uploads, real-time progress indicators, and cancellation.
- **File Downloads**: Direct download trigger via presigned S3 download URLs.
- **Item Management**:
  - ✏️ **Rename**: Inline/dialog renaming for both files and folders.
  - ⭐️ **Star / Unstar**: Add or remove items from your favorites.
  - 📦 **Move File**: Move files to different folder locations using an interactive folder tree picker.
  - 🗑️ **Trash & Restore**: Soft-delete items to Trash or restore them back to My Drive.

### ⭐ Starred & 🗑️ Trash Views
- **Starred View (`/starred`)**: Dedicated workspace displaying all favorited files and folders.
- **Trash View (`/trash`)**: Centralized view of deleted items with options to **Restore** individual items or **Empty Trash** in bulk.

### 📊 Storage Usage Meter
- **Storage Option**: Rendered as a native sidebar option with a progress bar indicator.
- **Formatted Byte Units**: Standardized byte formatting using **MB** and **GB** (JEDEC standard).

### 🎨 Theme & Layout Engine
- **Dark Mode**: Light, Dark, and System theme switching via `next-themes`.
- **Responsive Layout**: Mobile-first app shell with drawer navigation on mobile screens, icon rail on tablets, and full sidebar on desktop viewports.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18+** and **npm** installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aniketxz/google-drive-frontend.git
   cd google-drive-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint checks.
