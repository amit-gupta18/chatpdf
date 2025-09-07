import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function POST(req: NextRequest) {
    const { userId } = getAuth(req);
    console.log("user id is : " , userId);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { prompt } = await req.json();

        const response = await client.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });

        return NextResponse.json({
            reply: response.choices[0].message?.content,
        });
    } catch (error: any) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


