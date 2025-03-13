// Workaround to enable Swagger on production 
export const swaggerBussRewardGetAll = {
    index: 51,
    text:
        `"/api/v1/challenge/business/reward/  ": {
      "get": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Retrieve all rewards by challenge ID",
        "description": "Allows a business user to create a new travel challenge",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "challenge-id",
            "schema": {
              "type": "string"
            },
            "required": false,
            "description": "The ID of the challenge to retrieve"
          }
        ],
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
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "challenge_id": {
                            "type": "string"
                          },
                          "created_by": {
                            "type": "string"
                          },
                          "name": {
                            "type": "string"
                          },
                          "description": {
                            "type": "string"
                          },
                          "created_at": {
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