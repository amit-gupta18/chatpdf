"use client";
import { useState } from "react";
import axios from "axios";

export default function QuickUpload() {
  const [status, setStatus] = useState("");
  const [question, setQuestion] = useState("What is the main topic of the document?");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setStatus("Uploading...");
    try {
      const res = await axios.post("/api/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      console.log("Upload response:", res.data);
      setStatus(` ${res.data.message || "Success!"} (Chunks: ${res.data.chunks ?? "?"})`);
    } catch (err: any) {
      setStatus(" Upload failed: " + (err?.message ?? String(err)));
    }
  }


  async function queryAPI() {
    if (!question.trim()) {
      setStatus("Please enter a question.");
      return;
    }

    setStatus("Thinking...");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!data.ok) {
        setStatus(`Error: ${data.error || "Something went wrong"}`);
        return;
      }

      setStatus(data.answer); // show answer
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-4 p-8 border border-gray-200 rounded-lg shadow-md bg-gray-50 max-w-md mx-auto mt-8"
      >
        <h2 className="mb-4 text-2xl font-semibold text-blue-600">Upload your PDF</h2>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="p-2 rounded border border-gray-300 text-black bg-white w-full"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded font-bold text-base hover:bg-blue-700 transition"
        >
          Upload PDF
        </button>
        <p className="text-green-600 min-h-[1.5em]">{status}</p>
      </form>

      {/* chat interface for the uploaded document */}
      <div className="flex flex-col items-center gap-4 p-8 border border-gray-200 rounded-lg shadow-md bg-gray-50 max-w-md mx-auto mt-4">
        <h2 className="mb-4 text-2xl font-semibold text-blue-600">Ask a question about your document</h2>
        <textarea
          className="p-2 rounded border border-gray-300 text-black bg-white w-full"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="button"
          onClick={queryAPI}
          className="px-6 py-3 bg-blue-600 text-white rounded font-bold text-base hover:bg-blue-700 transition"
        >
          Ask Question
        </button>
        <p className="text-green-600 min-h-[1.5em]">{status}</p>
      </div>
    </div>
  );
}
