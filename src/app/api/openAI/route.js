import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  console.log("AAAAAAAAAAA");
  const data = await request.json();
  // console.log(`got a request: ${JSON.stringify(data, null, 4)}`);
  const prompt = `Hello`;
  // const { prompt } = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020?" },
    ],
    model: "gpt-3.5-turbo-0125",
    response_format: { type: "json_object" },
  });
  console.log(completion.choices[0].message.content);
  return new Response(completion.choices[0].message.content);
}
