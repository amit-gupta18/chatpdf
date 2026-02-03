"use client"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import FileUpload from "@/components/FileUpload"
export default function QuickUpload() {
  const [status, setStatus] = useState("")
  const [question, setQuestion] = useState("What is the main topic of the document?")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.includes("pdf")) {
      setUploadError("Please select a PDF file.")
      return
    }

    setUploadError(null)
    setIsUploading(true)
    setStatus("Uploading...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      console.log("Upload response:", res.data)
      setUploadedFile(file.name)
      setStatus(`✓ Successfully uploaded "${file.name}" (${res.data.chunks || 0} chunks stored)`)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } }; message?: string }
      setUploadError("Upload failed: " + (axiosError?.response?.data?.error || axiosError?.message || String(err)))
    } finally {
      setIsUploading(false)
    }
  }

  async function queryAPI() {
    if (!question.trim()) {
      setStatus("Please enter a question.")
      return
    }

    setStatus("Thinking...")

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      if (!data.ok) {
        setStatus(`Error: ${data.error || "Something went wrong"}`)
        return
      }

      setStatus(data.answer)
    } catch (err: unknown) {
      setStatus(`Error: ${(err as Error).message}`)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {!uploadedFile && (
        <>
          <FileUpload
            onFileSelect={handleFileSelect}
            isDragOver={isDragOver}
            setIsDragOver={setIsDragOver}
            // @ts-expect-error - FileUpload component prop types need to be updated
            fileInputRef={fileInputRef}
            error={uploadError}
          />

          {isUploading && (
            <div className="p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200">
              <Upload className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}

          {status && status.includes("✓") && (
            <div className="p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 bg-green-50 text-green-700 border border-green-200">
              <CheckCircle className="w-4 h-4" />
              {status}
            </div>
          )}
        </>
      )}

      {uploadedFile && (
        <>
          <Card className="transition-all duration-200 hover:shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{uploadedFile}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Successfully uploaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-600 text-center">Ask question from the file</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know about your document?"
                className="resize-none"
              />

              <Button type="button" onClick={queryAPI} className="w-full" size="lg">
                Ask Question
              </Button>

              {status && !status.includes("✓") && !status.includes("Success") && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    status.includes("Error") || status.includes("failed")
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {status.includes("Error") || status.includes("failed") ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {status}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
