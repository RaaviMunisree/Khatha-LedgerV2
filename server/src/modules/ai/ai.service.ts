import { GoogleGenAI } from "@google/genai";

import type { AiContext } from "./ai.types.js";
import { buildSystemPrompt } from "./ai.prompts.js";
import {
  executeAiTool,
  getAiTools,
} from "./ai.tools.js";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured",
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

const model =
  process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

const MAX_TOOL_ROUNDS = 5;
const MAX_RETRY_ATTEMPTS = 3;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const sleep = async (
  milliseconds: number,
): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const isTemporaryGeminiError = (
  error: unknown,
): boolean => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  return (
    errorMessage.includes("503") ||
    errorMessage.includes("UNAVAILABLE") ||
    errorMessage.includes("high demand") ||
    errorMessage.includes("temporarily unavailable")
  );
};

/* -------------------------------------------------------------------------- */
/* Gemini Request With Retry                                                   */
/* -------------------------------------------------------------------------- */

const generateWithRetry = async (
  request: Parameters<
    typeof ai.models.generateContent
  >[0],
) => {
  for (
    let attempt = 1;
    attempt <= MAX_RETRY_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await ai.models.generateContent(
        request,
      );
    } catch (error) {
      const isTemporaryError =
        isTemporaryGeminiError(error);

      if (
        !isTemporaryError ||
        attempt === MAX_RETRY_ATTEMPTS
      ) {
        throw error;
      }

      const delay =
        attempt === 1
          ? 2000
          : attempt === 2
            ? 4000
            : 8000;

      console.warn(
        `Gemini temporarily unavailable. ` +
          `Retrying in ${delay}ms ` +
          `(attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})...`,
      );

      await sleep(delay);
    }
  }

  throw new Error(
    "Gemini request failed after retries",
  );
};

/* -------------------------------------------------------------------------- */
/* AI Chat                                                                     */
/* -------------------------------------------------------------------------- */

export const chatWithKhataXAI = async (
  message: string,
  context: AiContext,
): Promise<{ message: string }> => {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Message is required");
  }

  const tools = getAiTools(context.role);

  const contents: any[] = [
    {
      role: "user",
      parts: [
        {
          text: trimmedMessage,
        },
      ],
    },
  ];

  for (
    let round = 0;
    round < MAX_TOOL_ROUNDS;
    round += 1
  ) {
    const response = await generateWithRetry({
      model,
      contents,
      config: {
        systemInstruction:
          buildSystemPrompt(context),

        tools: [
          {
            functionDeclarations: tools.map(
              (tool) => ({
                name: tool.name,
                description: tool.description,
                parametersJsonSchema:
                  tool.parameters,
              }),
            ),
          },
        ],
      },
    });

    const candidate =
      response.candidates?.[0];

    if (!candidate) {
      throw new Error(
        "Gemini returned no response",
      );
    }

    const parts =
      candidate.content?.parts ?? [];

    const functionCalls = parts.filter(
      (part) => part.functionCall,
    );

    /*
     * Gemini returned a normal text response.
     */
    if (functionCalls.length === 0) {
      const text = response.text?.trim();

      if (!text) {
        throw new Error(
          "Gemini returned an empty response",
        );
      }

      return {
        message: text,
      };
    }

    /*
     * Preserve Gemini's function-call response.
     */
    contents.push({
      role: "model",
      parts,
    });

    const functionResponses: Array<{
      functionResponse: {
        name: string;
        response: unknown;
      };
    }> = [];

    /*
     * Execute the tools requested by Gemini.
     */
    for (const part of functionCalls) {
      const functionCall =
        part.functionCall;

      if (!functionCall?.name) {
        continue;
      }

      try {
        const args =
          (functionCall.args as Record<
            string,
            unknown
          >) ?? {};

        const result =
          await executeAiTool(
            functionCall.name,
            args,
            context,
          );

        functionResponses.push({
          functionResponse: {
            name: functionCall.name,
            response: result,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "AI tool execution failed";

        functionResponses.push({
          functionResponse: {
            name: functionCall.name,
            response: {
              error: errorMessage,
            },
          },
        });
      }
    }

    if (functionResponses.length === 0) {
      throw new Error(
        "Gemini requested an invalid tool call",
      );
    }

    /*
     * Send tool results back to Gemini.
     */
    contents.push({
      role: "user",
      parts: functionResponses,
    });
  }

  throw new Error(
    "AI exceeded the maximum number of tool calls",
  );
};