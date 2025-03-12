import { NextApiRequest, NextApiResponse } from "next";
import { generateLocationStories } from "@/libs/services/storyGen";

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
      destination, 
      attractions, 
      notes, 
      media_urls, 
      brand_voice, 
      story_length, 
      channel_type 
    } = req.body;

    try {
        // Insert story into database
        const { data: storyData, error } = await generateLocationStories(
                destination,
                attractions.join("\n"), 
                notes,
                media_urls,
                brand_voice,
                channel_type,
                story_length,
        );

        if (error) {
            console.error("Story insertion error:", error);
            return res.status(400).json({ error: error.message });
        }

        // Successful response
        return res.status(201).json({ 
            data: storyData
        });

    } catch (catchError) {
        console.error("Unexpected error:", catchError);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// // long_tail_keyword: [Long tail keyword],
// seo_title_tag: [Title],
//   seo_excerpt: [Excerpt],
//     seo_meta_desc: [Meta description],
//       seo_slug: [URL slug],
//         hashtags: [Hashtags]

// Workaround to enable Swagger on production 
export const swaggerStoryGenerate = {
    index:18, 
    text:
`"/api/v1/story/generate": {
    "post": {
      "tags": ["story"],
      "summary": "Generate a new story",
      "description": "Generate a new story based on the provided schedule, attractions, notes, and story length.",
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
                "destination": {
                  "type": "string",
                  "description": "The name of the selected destination."
                },
                "attractions": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "A list of attraction titles belongs to the selected destination."
                },
                "notes": {
                  "type": "string",
                  "description": "User's prompt to generate the story."
                },
                "media_urls": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "description": "An array of URLs for user submitted media."
                },
                "brand_voice": {
                  "type": "string",
                  "description": "User's writing style belongs to the selected channel."
                },
                "channel_type": {
                  "type": "string",
                  "description": "The type of the selected channel."
                },
                "story_length": {
                  "type": "number",
                  "description": "The length of each paragraph specific to each attraction."
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Story generated successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "data": {
                    "type": "object",
                    "properties": {
                      "long_tail_keyword": {
                        "type": "string",
                        "description": "The SEO long-tail keyword relevant to the requested story post."
                      },
                      "seo_title_tag": {
                        "type": "string",
                        "description": "A SEO title containing the long-tail keyword."
                      },
                      "seo_excerpt": {
                        "type": "string",
                        "description": "A short summary of the story content (less than 140 characters)."
                      },
                      "seo_meta_desc": {
                        "type": "string",
                        "description": "SEO meta description for the story post."
                      },
                      "seo_slug": {
                        "type": "string",
                        "description": "SEO slug for story post URL in the Travel Buddy website."
                      },
                      "hashtags": {
                        "type": "string",
                        "description": "SEO-focused hashtags for the SEO title tag."
                      },
                      "story_content": {
                        "type": "string",
                        "description": "The main content of the story post."
                      }
                    }
                  }
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
        "401": {
          "description": "Unauthorized - Authorization token is required",
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