import * as path from 'path';

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
    './pages/api/**/*.ts',
    path.join(process.cwd(), 'pages/api/**/*.js'),
    path.join(process.cwd(), 'pages/api/**/*.ts'), 
    path.join(__dirname, 'pages/api/**/*.js'), 
    path.join(__dirname, 'pages/api/**/*.ts'),
    path.join(process.cwd(), '**/*.js'),
    path.join(__dirname, '**/*.js'),
  ],
};
