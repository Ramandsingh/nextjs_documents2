# Project Progress Tracker: Receipt Analyzer App

## Goal
Build a Vercel-hosted web application that allows users to upload multiple receipt images simultaneously. The app will use the Gemini API to analyze each receipt, extract key data (e.g., date, total, line items), and display the results in a structured, interactive table.

## Checklist for Project Progress

- [x] **Setup:** Initialize Next.js project with Vercel AI SDK.
    - [x] Next.js project created in `Gitlink/nextjs_documents`.
    - [x] Tailwind CSS configured (`tailwind.config.ts`, `app/globals.css`).
    - [x] Shadcn UI manually configured (`components.json`, `lib/utils.ts`, `clsx`, `tailwind-merge` installed).
    - [x] Vercel AI SDK installed.
    - [x] `@google/generative-ai` installed to resolve module not found error.
    - [x] `tailwindcss-animate` installed to resolve module not found error.
- [x] **API Integration:** Configure Gemini API key as an environment variable (GOOGLE_GEMINI_API_KEY).
    - *Note: User needs to manually add `GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here` to `.env.local`.*
    - [x] Gemini model name is now configurable via `GEMINI_MODEL_NAME` in `.env.local`.
    - *Note: Encountered `429 Too Many Requests` due to API quota limits (`limit: 0`). User needs to enable billing in Google Cloud Console to increase quotas.*
    - [x] Switched to Moonshot AI (OpenAI-compatible API).
    - [x] `openai` package installed.
    - [x] `app/actions.ts` updated to use OpenAI client with `KIMI_BASE_URL` and `KIMI_API_KEY`.
    - [x] Moonshot AI model name is now configurable via `KIMI_MODEL` in `.env.local`.
- [x] **Show a basic run:** Initialize Next.js project with Vercel AI SDK and create a simple chatbot.
    - [x] `app/api/chat/route.ts` created for Gemini API integration.
    - [x] `app/page.tsx` initially set up with a basic chatbot UI (later replaced).
- [x] **File Upload:** Create a frontend component for multi-file drag-and-drop.
    - [x] `components/file-upload.tsx` created.
    - [x] `react-dropzone` installed.
    - [x] `app/page.tsx` updated to integrate `FileUpload` component.
- [x] **Server Action:** Write a Next.js Server Action to handle the file upload and send data to the Gemini API.
    - [x] `app/actions.ts` created with `processReceipts` function.
- [x] **Gemini Prompt:** Craft a concise, detailed prompt for Gemini to extract data from the receipt image. The prompt should specify the desired JSON output format.
    - [x] Prompt updated in `processReceipts` server action.
- [x] **Data Processing:** Process Gemini's JSON output on the server and and send it back to the client.
    - [x] JSON parsing and data extraction implemented in `processReceipts`.
- [x] **UI Component:** Develop a dynamic React component (e.g., using Shadcn UI's Table component) to display the extracted data.
    - [x] Shadcn UI Table component installed.
    - [x] `components/receipt-table.tsx` created.
    - [x] `app/page.tsx` updated to use `ReceiptTable`.
    - [x] `ReceiptTable` updated to display new fields and include a border.
    - [x] `app/page.tsx` UI layout and styling improved.
- [x] **Authentication:** Implement simple username/password authentication.
    - [x] `bcryptjs` installed.
    - [x] `lib/auth.ts` created with login, logout, and session management for a default user.
    - [x] `app/login/page.tsx` created with login form (registration removed).
    - [x] `app/page.tsx` protected with server-side authentication check and logout button (fixed Client Component issue).
- [ ] **State Management:** Implement a solution to manage the state of multiple receipts (uploading, processing, complete, error).
    - *Note: Basic state management is in place in `app/page.tsx`. Further refinement might be needed.*
- [ ] **Error Handling:** Add robust error handling for API failures and malformed receipts.
    - *Note: Basic error handling is in place in `app/page.tsx` and `app/actions.ts`. Further refinement might be needed.*
- [ ] **Deployment:** Deploy the application to Vercel.