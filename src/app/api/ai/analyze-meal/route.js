import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || '').trim().replace(/['"]/g, ''));

export async function POST(req) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server misconfiguration: missing GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const { mealText, dietaryPreference } = await req.json();

    if (!mealText) {
      return NextResponse.json({ error: 'Meal description is required.' }, { status: 400 });
    }

    // Configure the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The prompt guarantees strict JSON so we can parse it reliably in the app
    const prompt = `
      You are a world-class nutritionist AI.
      The user describes what they just ate: "${mealText}".
      Their dietary preference is: ${dietaryPreference || 'Not specified'}.
      
      Calculate or estimate the total calories and macronutrients for this meal based on standard serving sizes.
      Then, compare it to a standard 2000 calorie/day baseline, and output a short sentence suggesting what nutrient groups are missing and what specific foods (respecting their dietary preference) they should eat next to attain those basic human nutrient needs.

      You MUST respond in ONLY strict JSON format matching exactly this schema, with no markdown formatting or backticks:
      {
        "estimated_meal_name": "Short label for the meal",
        "calories": 450,
        "protein": 20,
        "carbs": 50,
        "fats": 15,
        "fiber": 5,
        "missing_nutrients_suggested": "You are low on fiber and vitamins. Suggestion: Add a side of roasted broccoli or a bowl of mixed berries."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Sometimes Gemini adds markdown backticks around JSON anyway, we should clean it
    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      
      // In a real app we'd save it to Supabase here if we passed the user_id. 
      // But we will let the client fetch this, display it, and THEN the client can POST to a db route to save it if they confirm it.
      // Alternatively, we save it here if user_id is passed:
      // const supabase = createRouteHandlerClient({ cookies });
      // await supabase.from('meal_logs').insert({...})
      
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini output:', responseText);
      return NextResponse.json({ error: 'AI returned malformed data.' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Meal Analysis Error:', error);
    return NextResponse.json({ error: 'AI Error: ' + error.message }, { status: 500 });
  }
}
