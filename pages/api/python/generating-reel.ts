/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';


const OUTPUT_VIDEO_PATH = '/output_video.mp4';
const PYTHON_SCRIPT_PATH = 'pages/api/python/generate_reel.py';
const MUSIC_DEFAULT = "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/music1.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvbXVzaWMxLm1wMyIsImlhdCI6MTczNTgwOTAzNCwiZXhwIjoxNzY3MzQ1MDM0fQ.dy76I0r31Gs7-bi1X8GQLwzsgpEqzcojGoN2xceu_1g&t=2025-01-02T09%3A10%3A34.145Z"

// Generate reel using Python script with URLs
const generateReel = async (imageUrls: string[]): Promise<{output: string, errorOutput: string}> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      PYTHON_SCRIPT_PATH, 
      ...imageUrls,
      MUSIC_DEFAULT
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      errorOutput += dataStr;
      console.error('STDERR:', dataStr);
    });

    pythonProcess.on('close', (code) => {
      code === 0 
        ? resolve({ output: output.trim(), errorOutput }) 
        : reject(new Error('Script execution failed'));
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add more comprehensive logging
  console.log('Received request:', {
    method: req.method,
    body: req.body,
    query: req.query
  });
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'POST': {
        const { images } = req.body;

        // Enhanced input validation
        if (!images || !Array.isArray(images) || images.length === 0) {
          console.error('Invalid images input:', images);
          return res.status(400).json({ 
            success: false,
            message: 'No images provided or invalid image array',
            receivedImages: images
          });
        }

        try {
          const reelResult = await generateReel(images);
          
          // Log the result before sending
          console.log('Reel generation result:', reelResult);

          return res.status(200).json({
            success: true,
            videoPath: OUTPUT_VIDEO_PATH,
            ...reelResult
          });
        } catch (reelGenerationError) {
          console.error('Detailed reel generation error:', reelGenerationError);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate reel',
            details: reelGenerationError instanceof Error 
              ? reelGenerationError.message 
              : 'Unknown reel generation error',
            images  // Include original images for debugging
          });
        }
      }
      case 'GET': {
        const { images } = req.query;

        // Validate input
        if (!images || (Array.isArray(images) && images.length === 0)) {
          return res.status(400).json({
            success: false,
            message: 'No image URLs provided',
            videoPath: null
          });
        }

        // Convert single image or array of images
        const imageUrls = Array.isArray(images) ? images : [images];

        const reelResult = await generateReel(imageUrls);
        
        return res.status(200).json({
          success: true,
          videoPath: OUTPUT_VIDEO_PATH,
          ...reelResult
        });
      }
      default: {
        return res.status(405).json({ 
          success: false,
          message: 'Method not allowed' 
        });
      }
    }
  } catch (error) {
    console.error('Reel generation error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to generate reel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}