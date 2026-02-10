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
            You are the expert AI Sommelier for Vat39 (a premium liquor store).
            Analyze this image of a bottle/label. Identify the product accurately.
            
            Return a JSON object with this EXACT structure (no markdown):
            {
                "brand": "Brand Name (e.g. Glenfiddich)",
                "productName": "Specific Product (e.g. 12 Year Old)",
                "type": "Wijn/Whisky/Gin/etc",
                "vintage": "Year (if applicable)",
                "abv": "Alcohol %",
                "volume": "70cl/750ml",
                "description": "A short, engaging description of this product (in Dutch!). Why is it special?",
                "tastingNotes": ["Note 1", "Note 2", "Note 3"],
                "foodPairing": ["Dish 1", "Dish 2"],
                "vat39Tip": "A professional serving tip or buying advice (in Dutch).",
                "productionMethod": "Briefly explain how it is made (in Dutch).",
                "producer": {
                    "name": "Producer Name",
                    "region": "Region, Country",
                    "about": "Short info about the producer (in Dutch)."
                }
            }
            
            Language: DUTCH (for description, tips, notes).
            If you are not 100% sure of the exact bottle, give your best expert guess based on the visual cues.
        `;

        console.log("Calling OpenAI API (gpt-4o-mini)...");

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,
                                "detail": "low" // Faster processing
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
