import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import OpenAI, { toFile } from 'openai';

// Disable default body parser to handle multipart/form-data
export const config = {
    api: {
        bodyParser: false,
    },
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({});

        // Parse the incoming form data
        const [fields, files] = await form.parse(req);

        // Formidable v3 returns arrays for files
        const fileArray = Array.isArray(files.file) ? files.file : (files.file ? [files.file] : []);
        const file = fileArray[0];

        if (!file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Determine the filename (preserving extension so OpenAI recognizes the format)
        const originalName = file.originalFilename || 'voicenote.webm';
        const ext = path.extname(originalName) || '.webm';

        // Read the file buffer and wrap with toFile so OpenAI gets the correct filename
        const buffer = fs.readFileSync(file.filepath);
        const audioFile = await toFile(buffer, `audio${ext}`);

        const transcript = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
        });

        // Cleanup the temporary file created by formidable
        fs.unlinkSync(file.filepath);

        return res.status(200).json({ text: transcript.text });
    } catch (error: any) {
        console.error('Transcription error:', error?.message || error);
        const msg = error?.message || 'Failed to transcribe audio';
        return res.status(500).json({ error: msg });
    }
}
