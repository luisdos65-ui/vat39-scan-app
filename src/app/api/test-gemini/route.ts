import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json({ 
                status: 'error', 
                message: 'GEMINI_API_KEY is missing in environment variables' 
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Try to list models or just init a model to check auth
        // ListModels is not available in the Node SDK directly in the same way, 
        // so we try to get a model and generate a tiny content.
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test connection");
        const response = result.response.text();

        return NextResponse.json({
            status: 'ok',
            message: 'Gemini API connection successful',
            modelResponse: response,
            keyPrefix: apiKey.substring(0, 4) + '...'
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
