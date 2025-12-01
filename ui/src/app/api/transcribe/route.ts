// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // make sure this is set in .env.local
// });

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File | null;

//     if (!file) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // Call Whisper (speech-to-text)
//     const transcription = await openai.audio.transcriptions.create({
//       file,
//       model: "whisper-1",
//     });

//     return NextResponse.json({ text: transcription.text ?? "" });
//   } catch (error) {
//     console.error("Transcription error:", error);
//     return NextResponse.json(
//       { error: "Failed to transcribe audio" },
//       { status: 500 }
//     );
//   }
// }

// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Get the file from the frontend request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 2. Prepare to send it to the Python backend (Port 8001)
    const pythonServiceUrl = 'http://127.0.0.1:8001/transcribe';
    
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // 3. Forward the request
    const response = await fetch(pythonServiceUrl, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`);
    }

    // 4. Return the Python result (JSON) back to the frontend
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Transcription proxy failed:', error);
    return NextResponse.json(
      { error: 'Transcription service failed' },
      { status: 500 }
    );
  }
}
