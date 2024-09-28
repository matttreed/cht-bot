import { NextRequest, NextResponse } from "next/server";
import { Doc } from "@/src/types";
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    runtime: "edge"
}

const getClosestDocs = async (input: string): Promise<Doc[]> => {

  const weaviateClusterUrl = process.env.WEAVIATE_CLUSTER_URL?.replace("https://", "")

  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_CLUSTER_URL || "",
    {
      authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ""),
      headers: {
        'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || "",
      }
    } 
  )

  const questions = client.collections.get('Question');

  const result = await questions.query.nearText('biology', {
    limit:2
  });

  return result.objects;
}

const getChatCompletion = async (input: string): Promise<string> => {
  return "Hey"
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Object>
) {
  try {
    const { method } = req;
    const { query } = req.body;

    switch (method) {

      case 'POST': {
        const docs = await getClosestDocs(query);

        const text_completion = await getChatCompletion(query);

        res.status(200).json({
          docs: docs,
          completion: text_completion
        });
        break;
      }
      default:
        res.status(400);
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}