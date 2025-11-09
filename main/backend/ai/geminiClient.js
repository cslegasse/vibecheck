import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); 

export const forecastCampaign = async (userPrompt) => {
  const prompt = `
    You are an AI assistant for a charity platform called ConTrust.
    A user wants to create a new fundraiser.
    User's goal: "${userPrompt}"

    Your task:
    1. Analyze this goal using your real-time data.
    2. Predict the top 3-5 most critical spending categories (e.g., "Clean Water", "Medical Kits", "Logistics").
    3. Provide a high-level estimated budget for a 30-day operation.
    4. Identify 2 potential risks (e.g., "Weather disruption," "Supply chain delays").

    Return this as a JSON object.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
};


export const explainDonationTrace = async (traceData) => {
  const prompt = `
    You are an AI assistant for a charity platform, ConTrust.
    A donor wants to understand where their money went.
    Here is the technical trace data: ${JSON.stringify(traceData)}

    Your task:
    Write a brief, friendly, and clear explanation (2-3 sentences) for the donor.
    Example: "Your $50 donation was locked in the 'Shelter' fund... etc."
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};