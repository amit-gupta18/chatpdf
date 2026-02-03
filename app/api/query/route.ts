import { auth } from "@clerk/nextjs/server";
import { openai } from "@/lib/openai";
import { Pinecone } from "@pinecone-database/pinecone";

export const runtime = "nodejs";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});
const index = pc.index("pdfchat");

export async function POST(request: Request): Promise<Response> {
    try {

        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await request.json();
        const question = body.question as string;
        if (!question) {
            return new Response(JSON.stringify({ ok: false, error: "No question provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }


        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-004",
            input: question,
        });

        const uploadedDocumentId = (await index.query({
            vector: embeddingResponse.data[0].embedding,
            topK: 1,
            includeMetadata: true,
            filter: { userId: { $eq: userId } },
        })).matches?.[0]?.metadata?.documentId;

        const queryEmbedding = embeddingResponse.data[0].embedding;


        const searchResponse = await index.query({
            vector: queryEmbedding,
            topK: 5,
            includeMetadata: true,
            filter: {
                userId: { $eq: userId }, 
                documentId: { $eq: uploadedDocumentId },
            },
        });

        const matches = searchResponse.matches ?? [];
        const context = matches.map(m => m.metadata?.text).join("\n\n");


        const systemPrompt = `You are a helpful assistant. Answer the user's question using ONLY the provided context.
If the answer is not in the context, say "I could not find the answer in the document.".
Context:
${context}`;

        const completion = await openai.chat.completions.create({
            model: "gemini-1.5-flash", // Gemini (OpenAI-compatible)
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
            ],
            temperature: 0.2,
        });

        const answer = completion.choices[0]?.message?.content ?? "No answer generated.";

        return new Response(
            JSON.stringify({
                ok: true,
                question,
                answer,
                contextUsed: matches.map(m => m.metadata?.file),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err: unknown) {
        console.error("Query error:", err);
        return new Response(
            JSON.stringify({ ok: false, error: (err as Error)?.message || "Unknown error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
