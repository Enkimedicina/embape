import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real production app, ensure this key is not exposed to the client if possible, 
// or use a proxy. For this demo, we assume process.env is injected securely or user provides it.
const apiKey = process.env.API_KEY || ''; 

// We'll lazy load this to avoid immediate errors if key is missing during init
let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai && apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const analyzeTrade = async (
  buyPrice: number,
  sellPrice: number,
  amount: number,
  profit: number,
  roi: number
): Promise<string> => {
  const client = getAIClient();
  if (!client) {
    return "API Key no configurada. Por favor verifica tu configuración.";
  }

  try {
    const prompt = `
      Actúa como un experto en arbitraje financiero de criptomonedas P2P.
      Analiza la siguiente operación en tiempo real:
      
      - Precio de Compra: $${buyPrice} MXN
      - Precio de Venta: $${sellPrice} MXN
      - Cantidad vendida: ${amount} USDT
      - Ganancia Neta: $${profit.toFixed(2)} MXN
      - Retorno (ROI): ${roi.toFixed(2)}%
      
      Dame un consejo ultra-breve (máximo 2 oraciones) sobre si el spread es saludable, si el ROI justifica el riesgo de bloqueo bancario, o si debería buscar mejor precio. Sé directo y profesional.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar un consejo.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al consultar con el Asesor AI. Intenta más tarde.";
  }
};