// pages/api/docs.js

import { swaggerOptions } from '@/app/utils/swagger';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Logging function that works in both client and server environments
function safeLog(...args: any[]) {
  if (typeof console !== 'undefined' && console.log) {
    console.log(...args);
  }
  // Optionally, you could add file logging or external logging here
}

export default function handler(req, res) {
  try {
    // Log environment information
    safeLog('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      PWD: process.cwd()
    });

    // Log the actual paths being used
    safeLog('Swagger API Paths:', swaggerOptions.apis);

    // Detailed path resolution and file logging
    const resolvedPaths = swaggerOptions.apis.map(apiPath => {
      try {
        const fullPath = path.resolve(apiPath!);
        safeLog(`Resolving path: ${apiPath} -> ${fullPath}`);
        
        try {
          const fullPath = path.resolve(apiPath);
          safeLog(`Resolving path: ${apiPath} -> ${fullPath}`);
          
          try {
            const files = fs.readdirSync(fullPath);
            safeLog(`Files in ${fullPath}:`, files);
          } catch (dirError) {
            safeLog(`Error reading directory ${fullPath}:`);
          }
          
          return fullPath;
        } catch (pathError) {
          safeLog(`Error resolving path: ${apiPath}`, pathError);
          return null;
        }
      })
      .filter(path => path != null); // Remove any paths that failed to resolve

    // Generate Swagger spec with more detailed error tracking
    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    
    safeLog('Generated Swagger Spec:', {
      hasSpec: !!swaggerSpec,
      pathsCount: swaggerSpec?.paths ? Object.keys(swaggerSpec.paths).length : 0
    });

    if (!swaggerSpec || !swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
      safeLog('No Swagger paths found');
      return res.status(404).json({ 
        error: 'No API operations defined',
        details: {
          resolvedPaths,
          pathsCount: swaggerSpec?.paths ? Object.keys(swaggerSpec.paths).length : 0
        }
      });
    }

    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(swaggerSpec);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    safeLog('Swagger spec generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate Swagger specification',
    });
  }
}
