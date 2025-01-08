/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

const PYTHON_SCRIPT_PATH = 'pages/api/python/generate_story.py';

const generateStory = async (notes: string[]): Promise<{ story: string, errorOutput: string }> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      PYTHON_SCRIPT_PATH,
      ...notes
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let story = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      story += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      errorOutput += dataStr;
      console.error('STDERR:', dataStr);
    });

    pythonProcess.on('close', (code) => {
      code === 0
        ? resolve({ 
            story: story.trim(), 
            errorOutput 
          })
        : reject(new Error('Script execution failed'));
    });
  });
};

const handlePostRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { notes } = req.body;

  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    console.error('Invalid notes input:', notes);
    return res.status(400).json({
      success: false,
      message: 'No notes provided or invalid notes array',
      receivedNotes: notes
    });
  }

  try {
    const storyResult = await generateStory(notes);
    console.log('Story generation result:', storyResult);

    return res.status(200).json({
      success: true,
      ...storyResult
    });
  } catch (storyGenerationError) {
    console.error('Detailed story generation error:', storyGenerationError);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate story',
      details: storyGenerationError instanceof Error
        ? storyGenerationError.message
        : 'Unknown story generation error',
      notes
    });
  }
};

const handleGetRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { notes } = req.query;

  if (!notes || (Array.isArray(notes) && notes.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'No notes provided',
      story: null
    });
  }

  const notesArray = Array.isArray(notes) ? notes : [notes];

  try {
    const storyResult = await generateStory(notesArray);
    return res.status(200).json({
      success: true,
      ...storyResult
    });
  } catch (error) {
    console.error('Story generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate story',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', {
    method: req.method,
    body: req.body,
    query: req.query
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'POST':
        await handlePostRequest(req, res);
        break;
      case 'GET':
        await handleGetRequest(req, res);
        break;
      default:
        res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
        break;
    }
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate story',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}