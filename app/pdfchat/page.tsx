"use client"
import React, { useEffect, useState } from 'react'

const Page = () => {
    const [data, setData] = useState<any>(null);

    async function generateResponse() {
        console.log("generate response got called ");
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: "What do you think we should do with people who uses us?" }),
        });
        const result = await res.json();
        setData(result);
        console.log("API response:", result);

    }

    return (
        <div>
            <div>
                <button className='p-2 bg-white rounded-xl text-black m-6 cursor-pointer' onClick={generateResponse}>Generate Response</button>
            </div>
            {data ? JSON.stringify(data) : "Loading..."}
        </div>
    )
}

export default Page