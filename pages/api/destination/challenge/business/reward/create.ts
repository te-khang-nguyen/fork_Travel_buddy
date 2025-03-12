// Workaround to enable Swagger on production 
export const swaggerBussRewardCreate = {
    index: 50,
    text:
`"/api/v1/challenge/business/reward/ ": {
      "post": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Create a New Reward",
        "description": "Allows a business user to create a new travel challenge",
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
            "description": "Challenge created successfully",
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
                          "description": "Unique identifier of the created challenge",
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request or validation error"
          },
          "401": {
            "description": "Unauthorized - Invalid or missing authentication token"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    }`
}