import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config";

const openClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const generate_text = async (twitterContent: string) => {
  if (!twitterContent) {
    throw Error("generate_text: twitterContent does not exist");
  }

  const chatCompletion = await openClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `根据信息整理出关于代币的信息`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: twitterContent,
          },
        ],
      },
    ],
    temperature: 0.9,
    max_tokens: 280,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.3,
    response_format: { type: "text" },
  });
  return chatCompletion.choices[0].message.content;
};

export { generate_text };
