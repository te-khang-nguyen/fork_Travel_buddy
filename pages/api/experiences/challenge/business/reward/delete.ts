// Workaround to enable Swagger on production 
export const swaggerBussRewardDel = {
    index: 53,
    text:
        `"/api/v1/challenge/business/reward": {
      "delete": {
        "tags": ["challenge/business (mock interface)"],
        "summary": "Delete a reward",
        "description": "Move a challenge into 'Archived' and will be deleted",
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
        "responses": {
          "200": {
            "description": "Challenge deleted successfully",
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
                        "status": {
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