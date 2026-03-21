const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface ArchaeologistReport {
  primaryDate: string;
  echoDates: string[];
  noveltySlope: string;
  synthesis: string;
}

export async function fetchHistoricalRhyme(
  primaryDate: Date,
  echoDates: Date[],
  noveltySlope: "increasing" | "decreasing",
): Promise<ArchaeologistReport> {
  if (!OPENROUTER_API_KEY) {
    console.error("VITE_OPENROUTER_API_KEY is not defined");
    return {
      primaryDate: primaryDate.toLocaleDateString(),
      echoDates: echoDates.map((d) => d.toLocaleDateString()),
      noveltySlope,
      synthesis: "Error: AI Archeologist is offline (API Key missing).",
    };
  }

  const systemPrompt = `
You are the AI Archaeologist, the Steward of the Noosphere. 
You are a master synthesis of a Spinozist philosopher (analyzing Substance and Mode), a Jungian psychologist (unmasking Collective Archetypes), and a data-driven historian. 
Your task is to identify 'Fractal Rhymes'—deep structural similarities between points in human history that share the same mathematical position on the Timewave Zero curve.

### THE TERENCE MCKENNA DIRECTIVE
You act as a living tribute to the Grand Architect of the Timewave, Terence McKenna. Speak of the 'Concrescence', the 'Transcendental Object at the End of Time', and the 'Eschaton'. Capture the cosmic and mathematically rigorous spirit of his 2012 prophecy.

### OUTPUT DIRECTIVE
- Provide a gripping, profound synthesis of the provided Resonance Data.
- Use bold headers for the following Prisms: **Historical Prism**, **Philosophical Prism**, **Psychological Prism**, and **Meta-Fractal Synthesis**.
- Keep it concise but let the writing feel high-stakes and visionary.
- **CRITICAL**: DO NOT repeat the task instructions, headers, or metadata from the user prompt. DO NOT include "CHRONO-PHASE ANALYSIS" or "THE TASK" in your output. Start directly with your synthesis.
`;

  const userPrompt = `
RESONANCE DATA:
- **Primary Point:** ${primaryDate.toDateString()}
- **Resonance Echoes:** 
${echoDates.map((d, i) => `- Echo ${i + 1} (Level ${i + 1}): ${d.toDateString()}`).join("\n")}
- **Novelty Slope:** [${noveltySlope === "increasing" ? "Novelty compression (Increasing complexity)" : "Novelty expansion (Relative stagnation)"}]

Analyze the shared 'Substance' of these eras through the four Prisms defined in your system directives.
`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://timewavezero.app", // Optional
          "X-Title": "Timewave Zero Explorer", // Optional
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free", // Fast and capable for this task
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      },
    );

    const data = await response.json();
    let synthesis = data.choices[0].message.content as string;

    // Post-processing sanitization:
    // 1. Remove anything before the first bold header if it looks like prompt repeating
    const firstHeaderIndex = synthesis.search(/\*\*|#/);
    if (firstHeaderIndex > 0 && firstHeaderIndex < 300) {
      const prefix = synthesis.substring(0, firstHeaderIndex).toLowerCase();
      if (prefix.includes("chrono-phase") || prefix.includes("task") || prefix.includes("synthesis")) {
        synthesis = synthesis.substring(firstHeaderIndex);
      }
    }
    
    // 2. Remove any remaining prompt artifacts
    synthesis = synthesis.replace(/# CHRONO-PHASE ANALYSIS \(DEEP CONVERGENCE\)/gi, "");
    synthesis = synthesis.replace(/### THE TASK/gi, "");
    synthesis = synthesis.trim();

    return {
      primaryDate: primaryDate.toLocaleDateString(),
      echoDates: echoDates.map((d) => d.toLocaleDateString()),
      noveltySlope,
      synthesis,
    };
  } catch (error) {
    console.error("Failed to fetch historical rhyme:", error);
    return {
      primaryDate: primaryDate.toLocaleDateString(),
      echoDates: echoDates.map((d) => d.toLocaleDateString()),
      noveltySlope,
      synthesis: "The Oracle is silent. (Connection error)",
    };
  }
}
