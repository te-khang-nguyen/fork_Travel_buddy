// pages/api/docs.js

import { swaggerOptions } from '@/app/utils/swagger';
import swaggerJsdoc from 'swagger-jsdoc';


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