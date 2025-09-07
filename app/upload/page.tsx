"use client";
import { useState } from "react";

export default function QuickUpload() {
  const [status, setStatus] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setStatus("Uploading...");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      console.log("Raw response:", res);
      const data = await res.json();
      console.log("Upload response:", data);
      setStatus(res.ok ? `✅ ${data.message || "Success!"} (Chunks: ${data.chunks ?? "?"})` : `❌ ${data.error || "Failed"}`);
    } catch (err: any) {
      setStatus("❌ Upload failed: " + (err?.message ?? String(err)));
    }
  }

  return (
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
  );
}
