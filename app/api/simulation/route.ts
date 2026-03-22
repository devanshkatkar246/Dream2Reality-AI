import { NextResponse } from "next/server";
import { smartClient } from "@/lib/aiRotator";
import { SimulationPrompt } from "@/lib/ai";
import { incrementUsage } from "@/lib/usage";

const SYSTEM_PROMPT = "You are a 'Future Simulation Engine' assistant. Provide immersive, engaging, and realistic scenarios.";

export async function POST(req: Request) {
  try {
    const { dream, history } = await req.json();

    if (!dream) {
      return NextResponse.json({ error: "Dream is required" }, { status: 400 });
    }

    incrementUsage();
    const content = await smartClient.complete(SimulationPrompt(dream, history || []), SYSTEM_PROMPT);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Simulation Error:", error);
    if (error.message.includes("exhausted")) {
      return NextResponse.json({ error: "AI temporarily unavailable, please retry" }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
