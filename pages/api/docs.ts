// pages/api/docs.ts

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
    // Log environment and current working directory information
    safeLog('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      PWD: process.cwd(),
      __dirname: __dirname
    });

    // Log the full directory structure
    function logDirectoryContents(dirPath: string, indent: string = '') {
      try {
        const files = fs.readdirSync(dirPath);
        safeLog(`${indent}Contents of ${dirPath}:`);
        files.forEach(file => {
          const fullPath = path.join(dirPath, file);
          try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
              safeLog(`${indent}  [DIR] ${file}`);
              logDirectoryContents(fullPath, indent + '  ');
            } else {
              safeLog(`${indent}  [FILE] ${file}`);
            }
          } catch (statError) {
            safeLog(`${indent}  [ERROR] Could not stat ${file}: ${statError}`);
          }
        });
      } catch (dirError) {
        safeLog(`${indent}Error reading directory ${dirPath}: ${dirError}`);
      }
    }

    // Log contents of current working directory and its immediate parent
    safeLog('Logging directory structure:');
    logDirectoryContents(process.cwd());
    logDirectoryContents(path.dirname(process.cwd()));

    // Log Swagger API Paths with full resolution
    safeLog('Swagger API Paths:', swaggerOptions.apis);

    const resolvedPaths = swaggerOptions.apis.map(apiPath => {
      try {
        const fullPath = path.resolve(apiPath!);
        safeLog(`Resolving path: ${apiPath} -> ${fullPath}`);
        
        try {
          // Detailed file/directory checking
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            safeLog(`Path ${fullPath} exists. Is directory: ${stats.isDirectory()}, Is file: ${stats.isFile()}`);
            
            if (stats.isDirectory()) {
              const dirContents = fs.readdirSync(fullPath);
              safeLog(`Directory contents:`, dirContents);
            }
          } else {
            safeLog(`Path does not exist: ${fullPath}`);
          }
        } catch (fileError) {
          safeLog(`File/directory check error for ${fullPath}: ${fileError}`);
        }
        
        return fullPath;
      } catch (pathError) {
        safeLog(`Path resolution error for ${apiPath}: ${pathError}`);
        return null;
      }
    }).filter(Boolean);

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
      details: String(error)
    });
  }
}