import { NextApiRequest, NextApiResponse } from "next";
import searchAgent, { createPromptFromTemplate } from "@/libs/agents/webSearchAgent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate request method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed!" });
  }

  // Extract body
  const { 
    query, 
    word_limit,
    custom_system_prompt,
    topic,
 } = req.body;

  const messages = createPromptFromTemplate({
      userInputs: query,
      numerOfWords: word_limit,
      customSystemPrompt: custom_system_prompt,
      searchTopic: topic
  });

  try {
      const agent = searchAgent({});
      const response = await agent.invoke(await messages.invoke({}))

    // Successful response
    return res.status(201).json({ 
        answer: response.messages[response.messages.length - 1].content
    });

  } catch (catchError) {
    console.error("Unexpected error:", catchError);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Workaround to enable Swagger on production 
export const swaggerSearchAgent = {
  index:18, 
  text:
`"/api/v1/agents/search/": {
      "post": {
        "tags": ["agents"],
        "summary": "Invoke the search agent",
        "description": "Invoke the search agent with the provided query and parameters.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "query": { "type": "string" },
                  "word_limit": { "type": "number" },
                  "custom_system_prompt": { "type": "string" },
                  "topic": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Search agent invoked successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "answer": { "type": "string" }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": { "type": "string" }
                  }
                }
              }
            }
          },
          "405": {
            "description": "Method not allowed",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string" }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Internal server error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }`
}