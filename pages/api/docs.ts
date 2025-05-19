import { baseUrl } from '@/app/constant';
import * as swaggerObjs from '.';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Buddy API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Travel Buddy application',
  },
  servers: [
    {
      url:"http://localhost:3001",//baseUrl, // Add your production URL
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
};

const unSortedSwaggerObjs = Object.values(swaggerObjs).map((obj) => obj);
const sortedSwaggerObjs = unSortedSwaggerObjs.sort((a,b) => a.index - b.index);

const paths = `{${sortedSwaggerObjs.map((obj) => obj.text).join(',')}}`;

const swaggerSpec = {
  ...swaggerDefinition,
  "paths": JSON.parse(paths),
}


export default function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}