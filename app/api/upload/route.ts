import { auth } from '@clerk/nextjs/server';
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { openai } from '@/lib/openai';
import { Pinecone } from '@pinecone-database/pinecone';
export const runtime = "nodejs"; 


const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});
const index = pc.index("pdfchat");



function chunkText(text: string, chunkSize = 800) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
        if ((current + sentence).length > chunkSize) {
            chunks.push(current.trim());
            current = sentence;
        } else {
            current += (current ? " " : "") + sentence;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}


export async function POST(request: Request): Promise<Response> {
    try {
  
        const { userId } = await auth();
        if (!userId) {
            return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return new Response(JSON.stringify({ ok: false, error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const arrayBuffer = await file.arrayBuffer();
        const b64 = Buffer.from(arrayBuffer).toString('base64');
        const docId = crypto.randomUUID();



        const buffer = Buffer.from(arrayBuffer);
        console.log("Buffer is : ", buffer);
        console.log("PDF buffer size:", buffer.length);

        // Extract text from PDF
        // console.log("Is Buffer?", Buffer.isBuffer(buffer)); 
        const pdfData = await pdf(buffer);
        // console.log("Extracted PDF text length:", pdfData.text.length);
        // console.log("First 200 characters:", pdfData.text);
        const chunks = chunkText(pdfData.text);
        // console.log("chunks are : ", chunks);

        console.log(`User ${userId} uploaded file ${file.name} (${file.size} bytes)`);
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-004",
            input: chunks,
        });



        const vectors = embeddingResponse.data.map((item, i) => ({
            id: `${docId}-${i}`,
            values: item.embedding,
            metadata: {
                text: chunks[i],
                file: file.name,
                userId,
            },
        }));

        await index.upsert(vectors);
        console.log(`Stored ${vectors.length} vectors for ${file.name}`);



        return new Response(JSON.stringify({
            ok: true,
            userId,
            docId,
            fileName: file.name,
            chunksStored: vectors.length,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err: any) {
        const message = err?.message || 'Unknown error handling file upload';
        return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
