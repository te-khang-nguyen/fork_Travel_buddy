import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { notes } = req.body;

            // Validate input
            if (!notes || notes.length === 0) {
                return res.status(400).json({ error: 'No location notes provided' });
            }

            // Convert notes to a JSON string for passing to Python
            const notesJson = JSON.stringify(notes);
            console.log('Sending notes to Python:', notesJson);

            // Spawn Python script
            const pythonProcess = spawn('python3', [
                path.join(process.cwd(), 'pages/api/python/generate_location_story.py'),
                notesJson
            ]);

            let outputData = '';
            let errorData = '';

            // Collect output
            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            // Collect errors
            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error('Python stderr:', data.toString());
            });

            // Handle process completion
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python script error:', errorData);
                    return res.status(500).json({ error: 'Story generation failed', details: errorData });
                }

                try {
                    // Remove markdown code block delimiters and whitespace
                    const cleanedOutput = outputData
                        .replace(/^```json\s*/, '')  // Remove leading ```json
                        .replace(/```\s*$/, '')      // Remove trailing ```
                        .trim();

                    console.log('Cleaned output:', cleanedOutput);

                    // Parse the cleaned output as JSON
                    const parsedOutput = JSON.parse(cleanedOutput);
                    
                    // Return the entire parsed output
                    res.status(200).json(parsedOutput);
                } catch (parseError) {
                    console.error('Failed to parse story:', parseError);
                    console.error('Raw output:', outputData);
                    res.status(500).json({ 
                        error: 'Failed to parse generated story', 
                        rawOutput: outputData,
                        parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
                    });
                }
            });

        } catch (error) {
            console.error('API route error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}