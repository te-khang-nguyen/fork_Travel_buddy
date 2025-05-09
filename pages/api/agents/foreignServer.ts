const agentServeOrigin = 'https://travelbuddy-agents-server-797173526974.us-central1.run.app'
const swaggerAgentChatAgent = {
    index:40, 
    text: 
`"/api/v1/chat": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["buddy-agent"],
    "summary": "Chat with the agent",
    "description": "Send a query and optional images to the chat agent. Requires authentication.",
    "security": [
      { "bearerAuth": [] }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "query": { "type": "string", "description": "User's message" },
              "images": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Optional list of image URLs or IDs"
              },
              "filters": {
                "type": "object",
                "additionalProperties": { "type": "string" }
              }
            },
            "required": ["query"]
          },
          "examples": {
            "text_query": {
              "value": { "query": "Hello, how are you?" }
            },
            "with image_query": {
              "value": { "query": "What is in these images?", "images": ["image1.png", "image2.jpg"] }
            },
            "with filters": {
              "value": { 
                "query": "What is in these images?", 
                "images": ["image1.png", "image2.jpg"],
                "filters": {
                    "title": "foods, travelling, cuisine", 
                    "experience_id": "1111-1111-1111-1111" 
                }   
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Chat response",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "object" }
              }
            }
          }
        }
      },
      "401": {
        "description": "Unauthorized - missing or invalid bearer token",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "detail": { "type": "string", "example": "Invalid token" }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentChatAgentSwitchModel = {
    index:40, 
    text: 
`"/api/v1/switch-model": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "put": {
    "tags": ["buddy-agent"],
    "summary": "Switch the chat model",
    "description": "Switches the underlying model for the chat agent. Requires authentication.",
    "security": [
      { "bearerAuth": [] }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "model": { "type": "string", "description": "Model name to switch to" }
            },
            "required": ["model"]
          },
          "examples": {
            "switch_gpt": {
              "value": { "model": "openai" }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Model switched successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "string", "example": "Model switched to gpt-4 successfully" }
              }
            }
          }
        }
      },
      "401": {
        "description": "Unauthorized - missing or invalid bearer token",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "detail": { "type": "string", "example": "Invalid token" }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentChatAgentResetMemory = {
    index:40, 
    text: 
`"/api/v1/reset-memory": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "get": {
    "tags": ["buddy-agent"],
    "summary": "Reset chat memory",
    "description": "Resets the memory for the current user's chat session. Requires authentication.",
    "security": [
      { "bearerAuth": [] }
    ],
    "responses": {
      "200": {
        "description": "Memory reset successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "string", "example": "Memory reset successfully" }
              }
            }
          }
        }
      },
      "401": {
        "description": "Unauthorized - missing or invalid bearer token",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "detail": { "type": "string", "example": "Invalid token" }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentResearchAgent = {
    index:40, 
    text: 
`"/api/v1/research": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["research"],
    "summary": "Research a topic",
    "description": "Performs research using the provided parameters.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "with_summary_model": { "type": "boolean" },
              "num_queries": { "type": "integer" },
              "num_retrieved_docs": { "type": "integer" },
              "num_keywords": { "type": "integer" },
              "with_neural_search": { "type": "boolean" },
              "with_keyword_search": { "type": "boolean" },
              "query": { "type": "string" },
              "image_query": {
                "type": "array",
                "items": { "type": "string" }
              },
              "num_results": { "type": "integer" },
              "filters": {
                "type": "object",
                "additionalProperties": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Research results",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "array", "items": { "type": "object" } }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentResearchAgentFromRequest = {
    index:40, 
    text: 
`"/api/v1/vector-doc/query": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["research"],
    "summary": "Process query",
    "description": "Processes a research query and returns vectorized results.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "query": { "type": "string" },
              "num_queries": { "type": "integer" },
              "num_results": { "type": "integer" }
            },
            "required": ["query"]
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Processed query",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "array", "items": { "type": "object" } }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentVectorDbInspect = {
    index:40, 
    text: 
`"/api/v1/inspections": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["research"],
    "summary": "Get research results",
    "description": "Returns research results for a query or image query.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
                "query": { "type": "string", "description": "User's message" },
                "image_query": {
                    "type": "array",
                    "items": { "type": "string" },
                    "description": "Optional list of image URLs or IDs"
                },
                "num_results": { "type": "integer", "description": "Number of returned results" },
                "filters": {
                    "type": "object",
                    "additionalProperties": { "type": "string" }
                },
                "with_image_retrieval": { 
                    "type": "boolean", 
                    "description": "Toggle retrieving images from knowledge base" 
                }
            },
            "required": ["query"]
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Research results",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": { "type": "array", "items": { "type": "object" } }
              }
            }
          }
        }
      },
      "400": {
        "description": "Bad request - missing query or image query",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "detail": { "type": "string", "example": "Missing query or image query" }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentTextToVectorDb = {
    index:40, 
    text: 
`"/api/v1/vector-doc/text": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["vector-database"],
    "summary": "Process raw text",
    "description": "Processes raw text and returns vectorized document data.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "type": "object",
            "properties": {
              "text": { "type": "string" },
              "metadata": {
                "type": "object",
                "additionalProperties": { "type": "string" }
              }
            },
            "required": ["text"]
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Processed text",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "content": { "type": "string" },
                      "metadata": { "type": "object" }
                    }
                  }
                }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentLocalDocumentsToVectorDb = {
    index:40, 
    text: 
`"/api/v1/vector-doc/file": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["vector-database"],
    "summary": "Convert Blob to Document",
    "description": "Uploads a file and converts its content into a document.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "multipart/form-data": {
          "schema": {
            "type": "object",
            "properties": {
              "file": { "type": "string", "format": "binary" }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Document",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "content": { "type": ["string", "null"] },
                      "metadata": { "type": ["object", "null"] }
                    }
                  }
                }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

const swaggerAgentMediaToVectorDb = {
    index:40, 
    text: 
`"/api/v1/vector-doc/media": {
  "servers": [
        {
          "url": "${agentServeOrigin}"
        }
  ],
  "post": {
    "tags": ["vector-database"],
    "summary": "Convert Media Blob to Document",
    "description": "Uploads media files and converts them into documents with metadata.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "multipart/form-data": {
          "schema": {
            "type": "object",
            "properties": {
              "media": { "type": "string", "format": "binary" },
              "metadata": { "type": "string" }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Document",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "string", "example": "success" },
                "data": {
                  "type": "object",
                  "properties": {
                    "document": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "content": { "type": "string" },
                          "metadata": { "type": "object" }
                        }
                      }
                    },
                    "message": { "type": "string", "example": "Documents added successfully" }
                  }
                }
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
                "detail": { "type": "string", "example": "Internal server error" }
              }
            }
          }
        }
      }
    }
  }
}`
}

export {
    swaggerAgentChatAgent,
    swaggerAgentChatAgentSwitchModel,
    swaggerAgentChatAgentResetMemory,
    swaggerAgentResearchAgent,
    swaggerAgentResearchAgentFromRequest,
    swaggerAgentVectorDbInspect,
    swaggerAgentTextToVectorDb,
    swaggerAgentLocalDocumentsToVectorDb,
    swaggerAgentMediaToVectorDb
}