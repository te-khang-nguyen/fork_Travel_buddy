// Workaround to enable Swagger on production 
export const swaggerBussRewardUpdate = {
    index: 52,
    text:
        `"/api/v1/challenge/business/reward/": {
      "put": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Update a reward",
        "description": "Update the details of an existing challenge.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "in": "query",
            "name": "reward-id",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "The ID of the challenge to update"
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
            "description": "Challenge updated successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string"
                        },
                        "business_id": {
                          "type": "string"
                        },
                        "description": {
                          "type": "string"
                        },
                        "thumbnailUrl": {
                          "type": "string"
                        },
                        "backgroundUrl": {
                          "type": "string"
                        },
                        "created": {
                          "type": "string"
                        },
                        "title": {
                          "type": "string"
                        },
                        "tourSchedule": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Bad request"
          },
          "405": {
            "description": "Method not allowed"
          },
          "500": {
            "description": "Internal server error"
          }
        }
      }
    }`
}