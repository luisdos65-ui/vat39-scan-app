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
        // NOTE: 'gemini-1.5-flash' might not be available in v1beta yet or requires specific region.
        // Fallback to 'gemini-pro-vision' which is the stable multimodal model for v1beta, 
        // OR try 'gemini-1.5-flash-latest' if available.
        // For now, let's use the most standard multimodal model that is widely available.
        console.log("Calling Gemini API (model: gemini-1.5-flash)...");
        // Update: Using 'gemini-1.5-flash' resulted in 404 Not Found.
        // Switching to 'gemini-2.0-flash-exp' or 'gemini-1.5-flash-latest' or standard 'gemini-pro-vision' (deprecated but works).
        // Best bet currently for stable v1beta is often just 'gemini-1.5-flash' but maybe the account doesn't have access?
        // Let's try 'gemini-1.5-flash-latest' which is often the alias.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
            Analyze this wine or spirit label image strictly and return a JSON object.
            Do not invent information. If a field is not visible, use null.
            
            Extract the following:
            - brand: The main brand name (e.g. "Glenfiddich", "Chateau Margaux")
            - productName: The specific product name (e.g. "12 Year Old", "Grand Vin")
            - type: "Wijn", "Whisky", "Gin", "Rum", "Vodka", or "Overig"
            - vintage: Year (e.g. "2018")
            - abv: Alcohol percentage (e.g. "40%")
            - volume: Bottle size (e.g. "70cl", "750ml")
            - producer: Full producer name if different from brand
            - region: Region or Country of origin (e.g. "Speyside, Scotland", "Bordeaux, France")
            
            Return ONLY the raw JSON string, no markdown formatting.
        `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: file.type || 'image/jpeg'
                    }
                }
            ]);

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
        } catch (geminiError: any) {
            // Detailed Gemini Error Logging
            console.error("Gemini API Call Failed:");
            console.error("Message:", geminiError.message);
            console.error("Stack:", geminiError.stack);
            if (geminiError.response) {
                 console.error("Response:", JSON.stringify(geminiError.response, null, 2));
            }
            throw geminiError; // Re-throw to be caught by outer block
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
