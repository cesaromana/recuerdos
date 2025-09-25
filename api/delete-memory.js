// This is a Vercel serverless function.
// It handles the complete deletion of a memory: first its files from Blob, then its record from the database.

import { del } from '@vercel/blob';
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'DELETE') {
    return response.status(405).json({ message: 'Method not allowed' });
  }
  
  // The memory ID is passed as a query parameter, e.g., /api/delete-memory?id=...
  const { id } = request.query;

  if (!id) {
    return response.status(400).json({ message: 'Memory ID is required' });
  }

  try {
    // Step 1: Fetch the memory from the database to get the URLs of the files to delete.
    const { rows } = await sql`SELECT media FROM memories WHERE id = ${id};`;
    
    if (rows.length === 0) {
      // If the memory doesn't exist, we can consider the deletion successful.
      return response.status(200).json({ message: 'Memory not found, nothing to delete' });
    }
    
    const media = rows[0].media || []; // media is a JSONB array of objects like { url: '...' }
    const urlsToDelete = media.map(item => item.url).filter(Boolean); // Get all non-empty URLs

    // Step 2: Delete the files from Vercel Blob.
    // The `del` function can take an array of URLs.
    if (urlsToDelete.length > 0) {
        await del(urlsToDelete);
    }

    // Step 3: Delete the memory record from the Postgres database.
    await sql`DELETE FROM memories WHERE id = ${id};`;

    return response.status(200).json({ message: 'Memory and associated files deleted successfully' });

  } catch (error) {
    console.error('Error during deletion:', error);
    return response.status(500).json({ error: error.message });
  }
}