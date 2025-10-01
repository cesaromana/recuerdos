// This is a Vercel serverless function for bulk-importing memories.
// It uses a transaction to ensure all memories are imported or none are.

import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).end('Method Not Allowed');
    }

    const { memories } = request.body;

    if (!Array.isArray(memories)) {
        return response.status(400).json({ error: 'El cuerpo de la petición debe ser un array de recuerdos.' });
    }

    // Use a client for transaction support
    const client = await sql.connect();

    try {
        await client.query('BEGIN');

        for (const memory of memories) {
            // Basic validation for each memory object
            if (!memory.date || !memory.title || !memory.description || !memory.coverImageUrl || !memory.media) {
                // If any memory is invalid, we skip it or could throw an error to stop the whole process.
                // For robustness, we'll log and skip.
                console.warn('Skipping invalid memory object during import:', memory);
                continue;
            }

            const {
                date,
                title,
                description,
                coverImageUrl,
                media,
                location,
                spotifyTrackId,
                spotifyTrackName,
                spotifyArtistName,
                spotifyAlbumImageUrl,
                spotifyTrackPreviewUrl
            } = memory;
            
            const mediaJson = JSON.stringify(media);
            const finalLocation = location && location.trim() ? location.trim() : null;

            // Using ON CONFLICT DO NOTHING to prevent errors if a memory with the same date is imported.
            // This makes the import process idempotent for memories based on their date.
            // A more complex strategy could use ON CONFLICT DO UPDATE.
            await client.query(`
                INSERT INTO memories (date, title, description, "coverImageUrl", media, location, "spotifyTrackId", "spotifyTrackName", "spotifyArtistName", "spotifyAlbumImageUrl", "spotifyTrackPreviewUrl")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (date) DO NOTHING;
            `, [date, title, description, coverImageUrl, mediaJson, finalLocation, spotifyTrackId, spotifyTrackName, spotifyArtistName, spotifyAlbumImageUrl, spotifyTrackPreviewUrl]);
        }

        await client.query('COMMIT');

        return response.status(200).json({ message: 'Importación completada con éxito.', importedCount: memories.length });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('API Import Error:', error);
        return response.status(500).json({ error: `Error en el servidor durante la importación: ${error.message}` });
    } finally {
        client.release();
    }
}