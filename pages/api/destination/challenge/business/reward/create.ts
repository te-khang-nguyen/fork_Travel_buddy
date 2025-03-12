// Workaround to enable Swagger on production 
export const swaggerBussRewardCreate = {
    index: 50,
    text:
`"/api/v1/challenge/business/reward/": {
    "post": {
      "tags": ["challenge/business (mock interface)"],
      "summary": "Create a New Reward",
      "description": "Allows a business user to create a new travel challenge reward",
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
                "challenge_id": {
                  "type": "string"
                },
                "name": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "effective_from": {
                  "type": "string"
                },
                "expired_at": {
                  "type": "string"
                },
                "status": {
                  "type": "string"
                },
                "reward_type": {
                  "type": "string"
                },
                "amount": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Reward created successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "description": "Unique identifier of the created reward"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request or validation error",
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
          "description": "Unauthorized - Invalid or missing authentication token",
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