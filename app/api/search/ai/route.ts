import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI search is not configured", ids: [] },
      { status: 503 }
    );
  }

  try {
    const { query, language = "en" } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query", ids: [] },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const systemPrompt = `You are a Pokémon expert assistant. The user will describe Pokémon they're looking for.
Your task is to return the IDs of Pokémon that match the description.

Rules:
- Only return valid Pokémon IDs (1-1025 for main series Pokémon)
- Return between 1 and 15 Pokémon IDs maximum
- Order results by relevance to the query
- Consider Pokémon names, types, characteristics, lore, appearance, and abilities
- If the query is in ${language === "es" ? "Spanish" : "English"}, consider localized names

Examples:
- "fire starters" → [4, 155, 255, 390, 498, 653, 725, 813, 909]
- "pink round pokémon" → [39, 113, 174, 440]
- "legendary birds" → [144, 145, 146]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pokemon_ids",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ids: {
                type: "array",
                items: { type: "number" },
                description: "Array of Pokémon IDs matching the search query",
              },
            },
            required: ["ids"],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ ids: [] });
    }

    const parsed = JSON.parse(content) as { ids: number[] };
    const validIds = parsed.ids
      .filter((id) => typeof id === "number" && id >= 1 && id <= 1025)
      .slice(0, 15);

    return NextResponse.json({ ids: validIds });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "AI search failed", ids: [] },
      { status: 500 }
    );
  }
}
