// import swaggerJsdoc from 'swagger-jsdoc';
// import { swaggerOptions } from '@/app/utils/swagger';

// const swaggerSpec = swaggerJsdoc(swaggerOptions);

// export default function handler(req, res) {
//   if (req.method === 'GET') {
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(swaggerSpec);
//   } else {
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "pages/api", // define api folder under app folder
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