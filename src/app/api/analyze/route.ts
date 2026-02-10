import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
// NOTE: User must provide OPENAI_API_KEY in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        console.log("Analyze API called (OpenAI version)");
        
        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing in environment variables");
            return NextResponse.json(
                { error: "Server configuratie fout: OPENAI_API_KEY ontbreekt." },
                { status: 500 }
            );
        }

        // Log key prefix for debugging
        console.log(`OPENAI_API_KEY present, starts with: ${process.env.OPENAI_API_KEY.substring(0, 4)}...`);

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
        const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64Image}`;

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

        console.log("Calling OpenAI API (gpt-4o)...");

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        console.log("OpenAI Response received");
        const responseText = response.choices[0].message.content;

        if (!responseText) {
            throw new Error("No content in OpenAI response");
        }

        console.log("OpenAI Response Raw:", responseText.substring(0, 100) + "...");
        
        // Clean markdown code blocks if present
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const data = JSON.parse(cleanedText);
            console.log("OpenAI Response Parsed:", data);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error("Failed to parse OpenAI response:", responseText);
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
