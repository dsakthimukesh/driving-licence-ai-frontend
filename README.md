
# AI Document Intelligence – Frontend

A React and TypeScript frontend for an AI-powered Driving Licence Document Intelligence application. Users can upload driving licence documents, review extracted information, edit the extracted fields, and ask questions about their documents using Retrieval-Augmented Generation (RAG).

## 🚀 Live Application

- **Frontend:** [Add your Vercel deployment URL]
- **Backend API:** https://driving-licence-ai-backend.onrender.com
- **Backend Repository:** https://github.com/dsakthimukesh/driving-licence-ai-backend

## 🌟 Key Features

- **User Authentication**
  - User registration and login
  - JWT-based authentication
  - Protected application routes
  - Session restoration after browser refresh

- **Document Upload**
  - Upload driving licence documents
  - Generate signed upload URLs through the backend
  - Upload files directly to private Supabase Storage
  - Confirm uploads and trigger document processing

- **AI Document Processing**
  - OCR-based text extraction
  - AI-powered structured information extraction
  - Automated document processing status tracking
  - Processing status polling from the frontend

- **Extracted Information**
  - Display structured driving licence information
  - Review extracted details
  - Edit extracted information through the application interface

- **Document Management**
  - View uploaded documents
  - View document processing status
  - View document details
  - Generate temporary download URLs
  - Delete documents

- **AI-Powered Document Q&A**
  - Ask natural-language questions about a document
  - Retrieve relevant document chunks using vector similarity search
  - Generate grounded answers using an LLM
  - Display relevant source information in the response

## 🛠️ Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- React Context API
- React Hooks
- Native Browser Fetch API
- Lucide React

### Backend and Infrastructure

- FastAPI
- Python
- PostgreSQL
- Supabase Storage
- pgvector
- JWT authentication
- Docker
- Render
- Vercel

### AI and Document Processing

- OCR using Tesseract
- Google Gemini for structured extraction
- Google Gemini for text embeddings
- Groq as an LLM fallback provider
- Retrieval-Augmented Generation (RAG)

## 📁 Project Structure

```text
src/
├── components/
│   ├── chat/
│   │   └── DocumentChat.tsx
│   ├── common/
│   │   ├── ErrorAlert.tsx
│   │   └── LoadingSpinner.tsx
│   ├── documents/
│   │   ├── DocumentMetadataCard.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── ExtractedInformationCard.tsx
│   │   ├── InformationField.tsx
│   │   └── StatusBadge.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
├── context/
│   └── AuthContext.tsx
├── layouts/
│   ├── AuthLayout.tsx
│   └── ProtectedLayout.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── documents/
│   │   ├── DocumentDetailsPage.tsx
│   │   └── DocumentsPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── api.ts
│   ├── auth-service.ts
│   ├── chat-service.ts
│   └── document-service.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── chat.ts
│   └── document.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 🏗️ Architecture

The frontend communicates with the FastAPI backend using REST APIs.

```text
┌──────────────────────────────┐
│ React + TypeScript Frontend  │
│ Deployed on Vercel           │
└──────────────┬───────────────┘
               │ REST API
               ▼
┌──────────────────────────────┐
│ FastAPI Backend              │
│ Deployed on Render           │
└──────────────┬───────────────┘
               │
       ┌───────┼────────┬────────────────┐
       ▼       ▼        ▼                ▼
  Supabase  PostgreSQL  Gemini          Groq
  Storage   + pgvector  LLM             Fallback
```

### Document Upload Flow

1. The user selects a driving licence document.
2. The frontend requests a signed upload URL from the backend.
3. The backend generates a temporary Supabase Storage upload URL.
4. The frontend uploads the file directly to Supabase Storage.
5. The frontend confirms the upload with the backend.
6. The backend starts the document processing pipeline.
7. The frontend polls the document status.
8. The extracted information is displayed to the user.

### AI Question-Answering Flow

1. The user submits a question about a document.
2. The frontend sends the question to the backend.
3. The backend generates an embedding for the question.
4. Relevant document chunks are retrieved using pgvector similarity search.
5. The backend sends the retrieved context to the LLM.
6. Gemini generates the answer when available.
7. Groq is used as the fallback LLM when Gemini is unavailable.
8. The frontend displays the answer and source information.

## 🤖 AI/LLM Approach

The application uses a combination of OCR, LLM-based extraction, embeddings, and RAG.

### Document Extraction

- Tesseract is used for OCR-based text extraction.
- Gemini is used for structured driving licence information extraction.
- Groq is configured as a fallback provider for LLM-based extraction.
- The extracted response is validated using the backend's structured data models.

### Embeddings

- Gemini embedding model is used to generate vector embeddings.
- Document text is divided into chunks.
- Embeddings are stored in PostgreSQL using pgvector.
- Query embeddings are compared against stored document embeddings to retrieve relevant information.

### Retrieval-Augmented Generation

The RAG pipeline retrieves relevant document chunks before generating an answer. This helps the LLM answer questions using information associated with the selected document rather than relying only on general model knowledge.

### LLM Fallback

The application uses:

- **Primary LLM:** Google Gemini
- **Fallback LLM:** Groq using `openai/gpt-oss-120b`
- **Embedding provider:** Google Gemini

The embedding provider is separate from the LLM fallback mechanism because the application uses Gemini embeddings with a 1536-dimensional vector database configuration.

## 🔐 Authentication and Security

- JWT-based authentication is used for API requests.
- The frontend attaches the access token to authenticated API requests.
- Protected routes are used for authenticated application pages.
- Supabase Storage is configured as a private bucket.
- Temporary signed URLs are used for file uploads and downloads.
- Backend secrets are not stored in frontend environment variables.

### Token Storage

The frontend currently stores the JWT access token in browser `localStorage`.

This provides session persistence across browser refreshes but requires protection against cross-site scripting vulnerabilities. A production system with stricter security requirements could use secure, HTTP-only cookies with appropriate CSRF protection.

## ⚙️ Local Setup

### Prerequisites

- Node.js
- npm
- Running instance of the FastAPI backend

### Installation

Clone the repository:

```bash
git clone https://github.com/dsakthimukesh/driving-licence-ai-frontend.git
cd driving-licence-ai-frontend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:8000
```

For the deployed application, configure the Vercel environment variable:

```env
VITE_API_BASE_URL=https://driving-licence-ai-backend.onrender.com
```

Do not add backend secrets, Supabase service keys, database passwords, or JWT signing keys to frontend environment variables.

### Run the Development Server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:5173
```

### Build the Application

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

### TypeScript Validation

```bash
npx tsc --noEmit
```

## ☁️ Deployment

### Frontend

The frontend is deployed using Vercel.

Deployment configuration:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL`

A `vercel.json` file is included to support client-side routing in the single-page application.

### Backend

The backend is deployed separately on Render.

The frontend communicates with the deployed backend using the configured `VITE_API_BASE_URL` environment variable.

## 🔑 Key Technical Decisions

### Direct File Upload Using Signed URLs

Files are uploaded directly from the frontend to Supabase Storage using temporary signed URLs. This avoids sending the complete file through the backend and prevents exposing Supabase service credentials to the browser.

### Native Fetch API

The application uses a lightweight API wrapper based on the browser's native `fetch` API. This avoids introducing an additional HTTP client dependency.

### React Context for Authentication

Authentication state is managed using React Context and React Hooks. This keeps the authentication state accessible across the application without requiring a separate state management library.

### Separate Frontend and Backend Deployments

The frontend and backend are deployed independently. This allows each service to be developed, deployed, and scaled separately.

### LLM Fallback Strategy

Gemini is used as the primary LLM provider, while Groq provides fallback processing when the primary provider encounters availability or quota-related errors.

## ⚠️ Known Limitations

- OCR accuracy depends on the quality, orientation, and readability of the uploaded document.
- Extracted information may require user review and correction.
- AI-generated information should be verified against the original document.
- LLM providers may have usage limits, quotas, or temporary availability issues.
- The application currently focuses on driving licence document processing.
- The frontend depends on the availability and configuration of the deployed backend.
- JWT tokens are stored in browser `localStorage`, which has security tradeoffs compared with HTTP-only cookies.
- The application is an assessment project and has not been evaluated through a formal security audit or large-scale load test.

## 🧰 AI Development Tools Used

- **Antigravity:** Used as an AI-assisted development tool for implementing, reviewing, and improving application functionality.
- **LLM APIs:** Google Gemini and Groq were integrated for document extraction and question answering.
- **AI-assisted debugging:** Used during development to investigate integration issues, improve error handling, and validate implementation decisions.

AI-assisted development was combined with manual testing, API verification, deployment checks, and end-to-end application testing.

## 🧪 Testing

The application was tested through the complete user flow:

1. User registration
2. User login
3. Document upload
4. Document processing
5. Extracted information display
6. Extracted information editing
7. Document Q&A using RAG
8. Frontend and backend deployment verification

The frontend production build was also verified using the Vite build process.

## 📌 Future Improvements

- Add more document types and regional licence formats.
- Improve OCR accuracy and document preprocessing.
- Add stronger validation and confidence scores for extracted fields.
- Introduce more comprehensive automated frontend tests.
- Improve authentication security using HTTP-only cookies.
- Add monitoring and analytics for production usage.
- Add support for more LLM providers and configurable model routing.

## 👨‍💻 Author

**Sakthi**

GitHub: https://github.com/dsakthimukesh