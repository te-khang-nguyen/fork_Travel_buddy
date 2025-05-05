import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { intentPrediction } from "@/libs/services/agents/classifier";
// import { createApiClient } from "@/libs/supabase/supabaseApi";

// Language detection: simple heuristic for Vietnamese
function detectLanguage(text: string): "vi" | "en" {
    const vietnameseRegex = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
    return vietnameseRegex.test(text) ? "vi" : "en";
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed!" });
    }

    const { query } = req.body;
  
    try {
        const { intents } = await detectIntent(query);
        // You might want to select the intent with highest confidence
        const primaryIntent = intents.reduce((prev, current) => 
            (prev.confidence > current.confidence) ? prev : current
        );
        
        res.status(200).json({ 
            intents, // return all intents if needed
            primaryIntent // or just return the primary intent
        });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ 
            error: "Failed to process query",
            intents: [{
                intent: 'general_query',
                confidence: 0,
                needsImage: false
            }]
        });
    }
}
  
async function detectIntent(query: string): Promise<{
    intents: Array<intentPrediction>
}> {
    const queryLanguage = detectLanguage(query);

    // Clear prompt with consistent format instructions and emphasis on JSON formatting
    const systemMessage = `You are a travel intent classifier. Analyze this travel query and classify it into one of these intents:
    - find_location: Looking for specific places, attractions, or destinations
    - get_travel_info: Seeking information about travel options, times, costs, etc.
    - book_reserve: Attempting to make a reservation or booking
    - general_query: Any other travel-related question
    
    VERY IMPORTANT: You MUST respond with valid JSON ONLY, exactly as shown below. Do not include any explanations or text outside the JSON:
    {
      "analysis": {
        "find_location": {"confidence": X, "needsImage": true/false},
        "get_travel_info": {"confidence": Y, "needsImage": true/false},
        "book_reserve": {"confidence": Z, "needsImage": true/false},
        "general_query": {"confidence": W, "needsImage": true/false}
      }
    }
    
    Where:
    - Confidence values (X, Y, Z, W) are numbers between 0-100 (MUST sum to 100)
    - Set needsImage to true ONLY if visual information would be helpful
    - ALWAYS use the exact keys and structure shown above with no additional content`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4', // or 'gpt-4-turbo'
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: `Query (${queryLanguage}): ${query}` }
            ],
            temperature: 0.2 // Lower for more consistency
            // Removed response_format parameter as it's not supported by this model
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No response content');

        // Parse the response and handle potential errors
        let result;
        try {
            result = JSON.parse(content);
            
            // Validate the response has the expected structure
            if (!result.analysis) {
                throw new Error('Response missing analysis object');
            }
            
            // Convert to our desired format
            const intents = Object.entries(result.analysis).map(([intent, data]: [string, any]) => ({
                intent: intent as 'find_location' | 'get_travel_info' | 'book_reserve' | 'general_query',
                confidence: data.confidence / 100, // Convert to 0-1 range
                needsImage: !!data.needsImage // Ensure boolean
            }));
            
            // Validation: check if we have all expected intents
            const expectedIntents = ['find_location', 'get_travel_info', 'book_reserve', 'general_query'];
            const hasAllIntents = expectedIntents.every(intent => 
                intents.some(item => item.intent === intent)
            );
            
            if (!hasAllIntents) {
                throw new Error('Response missing one or more required intents');
            }
            
            return { intents };
        } catch (parseError) {
            console.error('Failed to parse API response:', parseError, content);
            throw new Error('Invalid response format from classification API');
        }
    } catch (error) {
        console.error('Classification failed:', error);
        // Smart fallback - try to guess primary intent
        const guessedIntent = guessIntentFromQuery(query);
        return {
            intents: [
                { intent: 'find_location', confidence: guessedIntent === 'find_location' ? 0.8 : 0.05, needsImage: false },
                { intent: 'get_travel_info', confidence: guessedIntent === 'get_travel_info' ? 0.8 : 0.05, needsImage: false },
                { intent: 'book_reserve', confidence: guessedIntent === 'book_reserve' ? 0.8 : 0.05, needsImage: false },
                { intent: 'general_query', confidence: guessedIntent === 'general_query' ? 0.8 : 0.05, needsImage: false }
            ]
        };
    }
}

// Simple fallback classifier
function guessIntentFromQuery(query: string): string {
    const normalizedQuery = query.toLowerCase();
    
    if (/hotel|restaurant|place|location|where|find|near|nearby|attraction|visit|sight/i.test(normalizedQuery)) 
        return 'find_location';
        
    if (/book|reserve|buy|purchase|ticket|room|reservation|booking/i.test(normalizedQuery)) 
        return 'book_reserve';
        
    if (/how|what|when|why|info|information|cost|price|time|schedule|flight/i.test(normalizedQuery)) 
        return 'get_travel_info';
        
    return 'general_query';
}