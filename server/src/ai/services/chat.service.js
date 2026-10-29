import Anthropic from "@anthropic-ai/sdk";
import config from "../../config/config.js";
import { chatPrompt } from "../prompts/chat.prompt.js";

export const answerQuestion = async ({ message, history, sources }) => {
  if (!sources.length) {
    return {
      answer:
        "I could not find relevant code in this scan. Mention the file or function name.",
      sources: [],
    };
  }

  if (!config.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }

  const ai = new Anthropic({
    apiKey: config.ANTHROPIC_API_KEY,
    timeout: 60000,
    maxRetries: 0,
  });

  const response = await ai.messages.create({
    model: config.ANALYSIS_MODEL,
    max_tokens: 2048,
    thinking: { type: "disabled" },

    system: chatPrompt,

    messages: [
      {
        role: "user",
        content: JSON.stringify({
          question: message,
          history,
          sources,
        }),
      },
    ],

    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            sourceIds: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["answer", "sourceIds"],
          additionalProperties: false,
        },
      },
    },
  });

  console.log(
    `Chat usage: input=${response.usage.input_tokens}, ` +
      `output=${response.usage.output_tokens}`
  );

  if (response.stop_reason !== "end_turn") {
    throw new Error(`Chat response incomplete: ${response.stop_reason}`);
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  const data = JSON.parse(text);

  if (
    typeof data.answer !== "string" ||
    !data.answer.trim() ||
    !Array.isArray(data.sourceIds) ||
    data.sourceIds.some(
      (id) => !sources.some((source) => source.id === id)
    )
  ) {
    throw new Error("Invalid chat response or source reference.");
  }

  return {
    answer: data.answer.trim(),
    sources: sources
      .filter((source) => data.sourceIds.includes(source.id))
      .map(({ id, path, startLine, endLine }) => ({
        id,
        path,
        startLine,
        endLine,
      })),
  };
};