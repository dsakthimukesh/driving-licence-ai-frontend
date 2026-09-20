# AI Document Intelligence - React Frontend

A modern, enterprise-grade React + TypeScript application built for the **AI Document Intelligence** system. It enables users to register, log in, upload driving licence documents directly to private object storage via pre-signed URLs, monitor automated OCR & LLM processing pipelines, view structured driving licence fields, and ask grounded AI questions using Retrieval-Augmented Generation (RAG).

---

## 🌟 Key Features

- 🔐 **Authentication & Session Persistence**: Secure user registration, JWT login, protected route layout guards, and automatic session restoration on browser refresh (`GET /api/v1/auth/me`).
- 📤 **Direct Pre-Signed Storage Upload**: Generates pre-signed upload URLs via FastAPI (`POST /api/v1/documents/upload-url`) and uploads files directly to Supabase Storage via native `fetch` PUT requests without exposing backend keys or access tokens.
- ⚡ **Automated Document Processing & Polling**: Triggers end-to-end OCR and AI extraction pipeline, with real-time automatic polling while documents are in `PENDING` or `PROCESSING` states.
- 📂 **Documents Library**: Full-featured documents management dashboard with search, status badges (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), deletion confirmation, and pagination.
- 📄 **Document Details & Secure Download**: Detailed storage metadata overview and pre-signed temporary download URL generation (`GET /api/v1/documents/{id}/download-url`).
- 🪪 **Extracted Driving Licence Information**: Structured card-based view displaying 12 key driving licence fields (`licence_number`, `full_name`, `parent_name`, `date_of_birth`, `blood_group`, `address`, `issue_date`, `expiry_date`, `vehicle_authorization`, `issuing_authority`, `restrictions`, `other_information`).
- 🤖 **Grounded AI RAG Q&A Interface**: Interactive natural language Q&A component allowing users to ask questions about their document, select quick suggested question pills, and inspect collapsible source chunk citations with page numbers, chunk indices, and vector similarity match percentages.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **State Management**: React Context API (`AuthContext`), React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`)
- **API Client**: Native Browser `fetch` API wrapper
- **Icons**: Lucide React

*Note: Built strictly without TanStack Query, Zustand, Redux, Axios, Zod, or React Hook Form to maintain a lightweight, beginner-friendly architecture.*

---

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/
│   │   └── DocumentChat.tsx         # RAG Q&A component & source citations drawer
│   ├── common/
│   │   ├── ErrorAlert.tsx           # Reusable alert component
│   │   └── LoadingSpinner.tsx       # Reusable spinner component
│   ├── documents/
│   │   ├── DocumentMetadataCard.tsx # Storage metadata card
│   │   ├── DocumentUpload.tsx       # Multi-stage file dropzone & upload pipeline
│   │   ├── ExtractedInformationCard.tsx # 12 driving licence fields grid
│   │   ├── InformationField.tsx     # Copyable key-value field item
│   │   └── StatusBadge.tsx          # Status indicator badge
│   ├── layout/
│   │   ├── Sidebar.tsx              # Sidebar navigation drawer
│   │   └── TopNav.tsx               # Top header bar & profile badge
│   └── ui/
│       ├── Button.tsx               # Reusable styled button component
│       └── Input.tsx                # Reusable accessible input component
├── context/
│   └── AuthContext.tsx              # Global authentication context & useAuth hook
├── layouts/
│   ├── AuthLayout.tsx               # Centered public layout wrapper
│   └── ProtectedLayout.tsx          # Authenticated app shell with sidebar & header
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx            # Sign in form
│   │   └── RegisterPage.tsx         # Sign up form
│   ├── dashboard/
│   │   └── DashboardPage.tsx        # Overview dashboard & quick actions
│   ├── documents/
│   │   ├── DocumentDetailsPage.tsx  # Document detail view, OCR fields & RAG chat
│   │   └── DocumentsPage.tsx        # Document library list & management
│   └── NotFoundPage.tsx             # 404 handler page
├── services/
│   ├── api.ts                       # Core native fetch API client & 401 handler
│   ├── auth-service.ts              # Authentication API functions
│   ├── chat-service.ts              # RAG Q&A ask API functions
│   └── document-service.ts          # Document upload, storage, list & info functions
├── types/
│   ├── api.ts                       # Generic API error & response types
│   ├── auth.ts                      # User, Login, Register, AuthState types
│   ├── chat.ts                      # RAG Q&A, Sources & ChatMessage types
│   └── document.ts                  # DocumentItem, DocumentInfo & Upload types
├── App.tsx                          # App routing & provider wrapping
├── main.tsx                         # DOM mounting point
└── index.css                        # Tailwind CSS imports & base styles
```

---

## ⚙️ Environment Setup

1. Copy `.env.example` to create a local `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Configure your FastAPI backend base URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

> **Security Note**: Never expose Supabase service keys, database passwords, or JWT secrets in frontend environment variables.

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Run Code Quality Linter**:
   ```bash
   npm run lint
   ```

4. **Verify TypeScript Type Checks**:
   ```bash
   npx tsc --noEmit
   ```

5. **Build Production Bundle**:
   ```bash
   npm run build
   ```

6. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

## 🏗️ Architecture Explanation

```
┌─────────────────┐       Native fetch       ┌──────────────────────┐
│  React 19 UI    │ ───────────────────────> │  FastAPI Backend     │
│ (TypeScript/Vite)│                         │ (http://localhost:8000)│
└────────┬────────┘                          └──────────┬───────────┘
         │                                              │
         │ Direct HTTP PUT                             │ Storage Signed URLs
         ▼                                              ▼
┌─────────────────┐                          ┌──────────────────────┐
│ Supabase Storage│                          │ PostgreSQL / Vector  │
│ (Private Bucket)│                          │ (pgvector & RAG)     │
└─────────────────┘                          └──────────────────────┘
```

---

## 🔐 Token Persistence Strategy & Security Tradeoffs

- **Storage Method**: JWT access tokens are persisted in browser `localStorage` under key `auth_token`.
- **Session Recovery**: On mount or browser refresh, `AuthProvider` reads the token and calls `GET /api/v1/auth/me` to validate credentials and restore user profile state.
- **Security Tradeoff**: 
  - *Advantage*: Enables clean, self-contained REST API interactions without requiring cross-domain server cookie configuration.
  - *Tradeoff*: `localStorage` can be read by JavaScript on the same origin. In high-security production environments, storing JWTs in `HttpOnly`, `Secure`, `SameSite` cookies is recommended to prevent potential XSS extraction.

---

## ⚠️ Known Limitations

1. **Read-Only Extracted Information**: Extracted driving licence fields are currently read-only. The backend FastAPI service does not expose a `PUT` or `PATCH` endpoint for updating `document_info` records. Manual editing UI will be enabled when the update API is implemented in future backend versions.
2. **File Size Limit**: Maximum file upload size is capped at 10 MB per document as required by backend storage schemas.
