import { NextRequest, NextResponse } from "next/server";
import { Chunk } from "@/src/types";
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';
import type { NextApiRequest, NextApiResponse } from 'next';
import {Message } from "@/src/types"
import OpenAI from "openai";

const openai = new OpenAI();

export const config = {
    runtime: "nodejs"
}

const getEmedQuestion = async (input: string, history: Message[]): Promise<string> => {
  const system_prompt = `You are a chatbot assistant that is designed to craft helpful queries for a RAG model.
  
  Here is the the conversation up until this point for context:
  
  ${history.map(message => {
    return `${message.role}: ${message.content}`
  }).join("\n\n")}
  
  Based on that conversation, craft a helpful query for a RAG model. 
  Embed all relevant context from the conversation to make the question into a query that stands alone and doesn't need the conversation to be understood.
`
  const prompt = `

  Question: ${input}

  Reply with only the query itself, and nothing else. Make the query concise, yet descriptive. The query should include everything the question implies and nothing more.
  `;

  const messages = [
    {role: "system", content: system_prompt},
    {role: "user", content: prompt}
  ].map(message => message as OpenAI.Chat.ChatCompletionMessageParam);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return completion.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error in getEmedQuestion:", error);
    throw error;
  }
}

const getClosestChunks = async (input: string): Promise<Chunk[]> => {
  try {

    const weaviateClusterUrl = process.env.WEAVIATE_CLUSTER_URL?.replace("https://", "")

    const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
      process.env.WEAVIATE_CLUSTER_URL || "",
      {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_READ_ONLY_API_KEY || ""),
        headers: {
          'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || "",  // Replace with your inference API key
        }
      } 
    )

    // Correct use of the GraphQL client to query Weaviate
    const questions = client.collections.get('Chunks');

    const result = await questions.query.nearText(input, {
      limit:10
    });

    if (result) {
      return result.objects.map(object => {
        return {
          end_time: Number(object.properties.end_time),
          start_time: Number(object.properties.start_time),
          text: object.properties.text,
          speaker: object.properties.speaker,
          title: object.properties.title,
          youtube_id: object.properties.youtube_id,
        } as Chunk
    });
    } else {
      throw new Error("Unexpected result format from Weaviate");
    }

  } catch (error) {
    // Catch any errors during the process and log them
    console.error("Error in getClosestChunks:", error);

    // Optionally re-throw the error to propagate it up the promise chain
    throw error;
  }
}

const getChatCompletion = async (input: string, history: Message[], chunks: Chunk[]): Promise<string> => {
  const prompt = `
  Based on zero to two of the following video segments, answer the question below. Only include a video segment if it directly supports your answer. If no video segments are relevant to the question, do not include any. 

  For each segment used in your response, indicate where the video should be embedded by using the format [Video Segment X], where X is the corresponding segment number.

  Video Segments:
  ${chunks.map((chunk, index) => `
    [Video Segment ${index}]
    Title: ${chunk.title}
    Speaker: ${chunk.speaker}
    Transcript: ${chunk.text}
  `).join("\n\n")}

  Question: ${input}

  Important:
  - Only use video segments that directly help to answer the question. 
  - If no video segments are relevant, provide an answer without embedding any video segments.
  - When referencing a segment, use the format [Video Segment X]. For example, if referring to Segment 1, write [Video Segment 1] in the text. If the user's question does not require a source, or the information is unrelated to the provided segments, do not embed any video clips.
  `;

  const messages = [...history, {role: "user", content: prompt}].map((message) => message as OpenAI.Chat.ChatCompletionMessageParam)
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return completion.choices[0].message.content || "";
  } catch (error: any) {
    console.error("Error in getChatCompletion:", error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Object>
) {
  try {
    const { method } = req;
    const { input, history } = req.body;

    switch (method) {

      case 'POST': {
        // TODO input = getChatCompletion(input, history); find a more cohesive and rich input to encode
        // would be cool to show all of this information on the sight for full transparency
        const question = await getEmedQuestion(input, history);
        
        const chunks = await getClosestChunks(question);

        const text_completion = await getChatCompletion(input, history, chunks);

        res.status(200).json({
          question: question,
          chunks: chunks,
          completion: text_completion
        });
        break;
      }
      default:
        res.status(400).send('Invalid request method');
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}