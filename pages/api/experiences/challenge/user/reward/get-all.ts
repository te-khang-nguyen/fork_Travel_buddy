// Workaround to enable Swagger on production 
export const swaggerUserRewardGetAll = {
  index:48, 
  text:
    `"/api/v1/challenge/user/reward/": {
      "get": {
        "tags": ["challenge/user (mock interface)"],
        "summary": "Retrieve all rewards",
        "description": "Retrieve all challenges with the status ACTIVE.",
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
            "description": "A list of challenges",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
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