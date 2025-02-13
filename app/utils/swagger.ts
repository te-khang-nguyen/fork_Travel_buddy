import { version } from "os";

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Buddy API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Travel Buddy application',
  },
  servers: [
    {
      url: 'https://fork-travel-buddy.vercel.app', // Add your production URL
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your bearer token in the format "Bearer <token>"'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: [
    // Multiple paths to ensure Swagger works in different environments
    './pages/api/**/*.ts',
    process.env.VERCEL ? '/vercel/path/pages/api/**/*.ts' : null,
    process.cwd() + '/pages/api/**/*.ts',
  ].filter(Boolean), // Remove any null values
  // Additional options for more robust spec generation
  failOnErrors: false, // Continue even if some routes can't be parsed
  verbose: true // Provide more detailed logging
};
