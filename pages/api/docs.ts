import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Travel Buddy API",
        version: "1.0.0",
        description: "API documentation for the Travel Buddy project",
      },
      servers: [
        {
          url: 'https://fork-travel-buddy.vercel.app', // Add your production URL
          description: 'Production server'
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });
  return spec;
};

export default async (req, res) => {
  const spec = await getApiDocs();
  res.json(spec);
};