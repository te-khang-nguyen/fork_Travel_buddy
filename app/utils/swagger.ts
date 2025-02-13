import * as path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Buddy API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Travel Buddy application',
  },
  // servers: [
  //   {
  //     url: 'https://fork-travel-buddy.vercel.app', // Add your production URL
  //     description: 'Production server'
  //   }
  // ],
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
    // Use multiple potential paths
    path.join(process.cwd(), 'swagger.yaml'),
    path.join(process.cwd(), 'pages', 'swagger.yaml'),
    path.join(process.cwd(), 'pages', 'api', 'swagger.yaml'),

    path.join(__dirname, 'swagger.yaml'),
    path.join(__dirname, 'pages', 'swagger.yaml'),
    path.join(__dirname, 'pages', 'api', 'swagger.yaml'),
    // Absolute paths for Vercel
    '/var/task/swagger.yaml',
    '/var/task/pages/swagger.yaml',
    '/var/task/pages/api/swagger.yaml',
    // Fallback to wildcard pattern for API routes
    './pages/api/**/*.ts',
  ].filter(Boolean), // Remove any null values
  failOnErrors: false,
  verbose: true
};
