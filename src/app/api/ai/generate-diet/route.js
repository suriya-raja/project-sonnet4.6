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

    const { healthInfo, dietaryPreference } = await req.json();

    if (!healthInfo) {
      return NextResponse.json({ error: 'Health information is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a world-class clinical dietician and nutritionist AI.
      The user has provided their medical report, health issues, or physical goals: "${healthInfo}".
      Their dietary preference is: ${dietaryPreference || 'Not specified'}.
      
      Review their health problem carefully. 
      Generate a practical, stabilizing diet plan mapped out over a 7-day or specific focus period.
      Detail the specific critical nutrients they need to survive and improve their condition.
      Suggest specific foods they should eat, strictly adhering to their dietary preference.

      Provide the response in the following strict JSON schema without markdown:
      {
        "survival_nutrients": ["Iron", "Vitamin B12", "Folic Acid"],
        "foods_to_eat": ["Spinach (Iron)", "Fortified cereals (B12)", "Lentils (Folic Acid)"],
        "foods_to_avoid": ["Sugary drinks", "Excessive caffeine"],
        "ai_advice": "A 2-paragraph detailed summary explaining why these nutrients are vital for their specific condition and how the plan works."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();

    try {
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini output:', responseText);
      return NextResponse.json({ error: 'AI returned malformed data.' }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Diet Plan Error:', error);
    return NextResponse.json({ error: 'Failed to generate diet plan.' }, { status: 500 });
  }
}
