import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: User must provide GEMINI_API_KEY in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        console.log("Analyze API called");
        
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing in environment variables");
            return NextResponse.json(
                { error: "Server configuratie fout: GEMINI_API_KEY ontbreekt." },
                { status: 500 }
            );
        }

        // Log key prefix for debugging (never log full key)
        console.log(`GEMINI_API_KEY present, starts with: ${process.env.GEMINI_API_KEY.substring(0, 4)}...`);

        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            console.error("No image file received in request");
            return NextResponse.json({ error: "Geen afbeelding ontvangen" }, { status: 400 });
        }
        
        console.log(`Processing image: ${file.name} (${file.size} bytes, type: ${file.type})`);

        // Convert File to ArrayBuffer then to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        // Use Gemini 1.5 Flash for speed and multimodal capabilities
        // We will try multiple model names to be robust against region/version availability.
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro-vision"];
        
        let result = null;
        let lastError = null;

        console.log("Calling Gemini API with fallback strategy...");

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: file.type || 'image/jpeg'
                        }
                    }
                ]);
                
                // If we get here, it worked!
                console.log(`Success with model: ${modelName}`);
                break; 
            } catch (e: any) {
                console.warn(`Failed with model ${modelName}:`, e.message);
                lastError = e;
                // Continue to next model
            }
        }

        if (!result && lastError) {
             throw lastError;
        }

        const responseText = result.response.text();
        console.log("Gemini Response Raw:", responseText.substring(0, 100) + "...");
        
        // Clean markdown code blocks if present
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const data = JSON.parse(cleanedText);
            console.log("Gemini Response Parsed:", data);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", responseText);
            return NextResponse.json({ error: "Kon antwoord niet verwerken" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("General API Error:", error);
        // Ensure we send a useful error message back to client
        const errorMessage = error.message || "Onbekende fout";
        return NextResponse.json(
            { error: `Fout bij analyseren: ${errorMessage}` },
            { status: 500 }
        );
    }
}
