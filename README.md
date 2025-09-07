# PDF Chat RAG Application

A Next.js 13+ app for chatting with your PDFs using Retrieval-Augmented Generation (RAG). Upload PDFs, store them as vector embeddings in Pinecone, and ask questions powered by OpenAI’s Gemini model. Built with TailwindCSS and Shadcn UI for a clean, responsive interface.

---

## Features

- **User Authentication:** Secure endpoints with Clerk.
- **PDF Upload:** Drag & drop or select PDFs.
- **Vector Storage:** PDF text is chunked, embedded via OpenAI `text-embedding-004`, and stored in Pinecone.
- **RAG Q&A:** Ask questions about your PDFs; relevant chunks are retrieved from Pinecone and answered using OpenAI Gemini (`gemini-1.5-flash`).
- **Modern UI:** TailwindCSS + Shadcn components with smooth animations.
- **Multi-user Support:** Pinecone filters by user ID for privacy.

---

## Tech Stack

- **Frontend:** Next.js 13+, React, TailwindCSS, Shadcn UI
- **Backend:** Next.js API Routes
- **Vector DB:** Pinecone
- **Embeddings & LLM:** OpenAI (Gemini-compatible)
- **Authentication:** Clerk

---

## Project Structure

```
/app
    /chat           # Authorised Frontend endpoint
    /api
        /query      # Chat API
        /upload     # PDF upload API
/components
    /ui             # Chat UI components
    /FileUpload     # PDF upload card
/lib
    openai.ts       # OpenAI API helper
/public
/styles
    globals.css     # Tailwind import
```

---

## Installation

1. **Clone the repository:**
     ```bash
     git clone https://github.com/amit-gupta18/chatpdf.git
     cd chatpdf
     ```

2. **Install dependencies:**
     ```bash
     npm install
     ```

3. **Set up environment variables (`.env.local`):**
     ```env
     OPENAI_API_KEY=<your_openai_key>
     PINECONE_API_KEY=<your_pinecone_key>
     CLERK_API_KEY=<your_clerk_key>
     ```

4. **Run the development server:**
     ```bash
     npm run dev
     ```

5. **Open in browser:**
     ```
     http://localhost:3000
     ```
