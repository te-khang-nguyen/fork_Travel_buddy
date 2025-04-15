import { join } from 'path';
import { createReadStream, createWriteStream, existsSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { IncomingForm } from 'formidable';
import { createApiClient } from "@/libs/supabase/supabaseApi";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token);
  const {
    data: { user },
  } = await supabase.auth.getUser(token!);

  const form = new IncomingForm();

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const { uploadId, partNumber } = fields;
    const chunk = files.chunk;

    if (!uploadId || !partNumber || !chunk) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uploadDir = join(process.cwd(), 'uploads', uploadId);
    const metaFile = join(uploadDir, 'metadata.json');

    if (!existsSync(uploadDir)) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    try {
      const metadata = JSON.parse(readFileSync(metaFile, 'utf8'));
      const partNum = parseInt(partNumber);

      if (metadata.receivedParts.includes(partNum)) {
        return res.status(200).json({ message: 'Part already uploaded' });
      }

      const chunkPath = join(uploadDir, `${partNum}.part`);
      const readStream = createReadStream(chunk.filepath);
      const writeStream = createWriteStream(chunkPath);

      readStream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve('Stream successfully!'));
        writeStream.on('error', reject);
      });

      metadata.receivedParts.push(partNum);
      writeFileSync(metaFile, JSON.stringify(metadata));

      if (metadata.receivedParts.length === metadata.totalParts) {
        const finalFileName = `${uploadId}_${metadata.fileName}`;
        const finalFilePath = join(process.cwd(), 'uploads', finalFileName);
        const writeStreamFinal = createWriteStream(finalFilePath);

        // Combine all parts
        for (let i = 1; i <= metadata.totalParts; i++) {
          const partPath = join(uploadDir, `${i}.part`);
          const readStreamPart = createReadStream(partPath);
          readStreamPart.pipe(writeStreamFinal, { end: false });
          await new Promise((resolve) => readStreamPart.on('end', () => resolve('Stream read!')));
          unlinkSync(partPath);
        }

        writeStreamFinal.end();

        // Wait for final file to be written
        await new Promise((resolve) => writeStreamFinal.on('finish', () => resolve('Final file written!')));

        // Upload to Supabase Storage
        const fileBuffer = readFileSync(finalFilePath);
        const { data: uploadTask, error: uploadError } = await supabase.storage
          .from("experience")
          .upload(`${user?.id}/${finalFileName}`, fileBuffer, {
            contentType: 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Supabase upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = await supabase.storage
          .from("experience")
          .createSignedUrl(uploadTask.path, 60 * 60 * 24 * 365);

        // Cleanup local files
        unlinkSync(finalFilePath);
        unlinkSync(metaFile);
        rmdirSync(uploadDir);

        res.status(200).json({ 
          message: 'Upload complete', 
          fileName: finalFileName,
          storageUrl: urlData?.signedUrl
        });
      } else {
        res.status(200).json({ message: 'Chunk uploaded successfully' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Cleanup on error
      if (existsSync(metaFile)) unlinkSync(metaFile);
      if (existsSync(uploadDir)) rmdirSync(uploadDir, { recursive: true });

      res.status(500).json({ 
        error: 'Internal server error',
        details: error
      });
    }
  });
}