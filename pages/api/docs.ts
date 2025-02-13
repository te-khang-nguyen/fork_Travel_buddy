// pages/api/docs.js


import swaggerJsdoc from 'swagger-jsdoc';

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
      url: 'https://fork-travel-buddy.vercel.app/', // Add your production URL
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
    './pages/api/**/*.js',
    './pages/api/**/*.ts',
  ],
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}