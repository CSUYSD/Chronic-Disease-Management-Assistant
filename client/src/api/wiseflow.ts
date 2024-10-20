import { NextApiRequest, NextApiResponse } from 'next';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { topics } = req.body;

            // Authenticate with PocketBase (use environment variables for credentials)
            await pb.admins.authWithPassword(
                process.env.POCKETBASE_ADMIN_EMAIL!,
                process.env.POCKETBASE_ADMIN_PASSWORD!
            );

            // Add each topic to the Wiseflow 'tags' collection
            for (const topic of topics) {
                await pb.collection('tags').create({
                    name: topic.name,
                    explanation: '',
                    activated: true
                });
            }

            res.status(200).json({ message: 'Topics saved successfully' });
        } catch (error) {
            console.error('Error saving topics:', error);
            res.status(500).json({ message: 'Error saving topics' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}