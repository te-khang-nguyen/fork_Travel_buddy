import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

const OUTPUT_VIDEO_PATH = '/output_video.mp4';
const PYTHON_SCRIPT_PATH = '././scripts/generate_reel.py';

// Generate reel using Python script with URLs
const generateReel = async (imageUrls: string[]): Promise<{output: string, errorOutput: string}> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      PYTHON_SCRIPT_PATH, 
      ...imageUrls
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

        // Validate input
        if (!images || !Array.isArray(images) || images.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: 'No images provided or invalid image array' 
          });
        }

        const reelResult = await generateReel(images);
        
        return res.status(200).json({
          success: true,
          videoPath: OUTPUT_VIDEO_PATH,
          ...reelResult
        });
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