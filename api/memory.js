// This is the new, secure, centralized Vercel serverless function for all database operations.
// It runs on the server, where it has secure access to the POSTGRES_URL environment variable.

import { sql } from '@vercel/postgres';

// Helper to format date consistently from the database result
const formatMemoryFromRow = (row) => {
    if (!row) return null;
    return {
        ...row,
        date: new Date(row.date).toISOString().split('T')[0]
    };
};

export default async function handler(request, response) {
    try {
        // Handle GET requests (fetching all, one by date, or searching)
        if (request.method === 'GET') {
            const { date, q } = request.query;

            // Get a single memory by date
            if (date) {
                const { rows } = await sql`SELECT id, date, title, description, "coverImageUrl", media, location FROM memories WHERE date = ${date};`;
                if (rows.length === 0) {
                    return response.status(404).json({ error: 'Recuerdo no encontrado' });
                }
                return response.status(200).json(formatMemoryFromRow(rows[0]));
            }
            // Search for memories
            else if (q) {
                const searchQuery = `%${q}%`;
                const { rows } = await sql`
                    SELECT id, date, title, description, "coverImageUrl", media, location
                    FROM memories 
                    WHERE title ILIKE ${searchQuery} OR description ILIKE ${searchQuery} OR location ILIKE ${searchQuery}
                    ORDER BY date DESC;
                `;
                return response.status(200).json(rows.map(formatMemoryFromRow));
            }
            // Get all memories
            else {
                const { rows } = await sql`SELECT id, date, title, description, "coverImageUrl", media, location FROM memories ORDER BY date DESC;`;
                return response.status(200).json(rows.map(formatMemoryFromRow));
            }
        }
        // Handle POST requests (adding a new memory)
        else if (request.method === 'POST') {
            const { date, title, description, media, coverImageUrl, location } = JSON.parse(request.body);
            const mediaJson = JSON.stringify(media);
            const finalLocation = location && location.trim() ? location.trim() : null;

            const { rows } = await sql`
                INSERT INTO memories (date, title, description, "coverImageUrl", media, location)
                VALUES (${date}, ${title}, ${description}, ${coverImageUrl}, ${mediaJson}::jsonb, ${finalLocation})
                RETURNING id, date, title, description, "coverImageUrl", media, location;
            `;
            return response.status(201).json(formatMemoryFromRow(rows[0]));
        }
        // Handle PUT requests (updating an existing memory)
        else if (request.method === 'PUT') {
            const { id, date, title, description, coverImageUrl, media, location } = JSON.parse(request.body);
            const mediaJson = media !== undefined ? JSON.stringify(media) : undefined;
            const finalLocation = location !== undefined ? (location.trim() ? location.trim() : null) : undefined;

            const { rows } = await sql`
                UPDATE memories
                SET 
                    date = COALESCE(${date}, date), 
                    title = COALESCE(${title}, title), 
                    description = COALESCE(${description}, description), 
                    "coverImageUrl" = COALESCE(${coverImageUrl}, "coverImageUrl"), 
                    media = COALESCE(${mediaJson}::jsonb, media),
                    location = COALESCE(${finalLocation}, location)
                WHERE id = ${id}
                RETURNING id, date, title, description, "coverImageUrl", media, location;
            `;

            if (rows.length === 0) {
                return response.status(404).json({ error: 'Recuerdo no encontrado para actualizar' });
            }
            return response.status(200).json(formatMemoryFromRow(rows[0]));
        }
        // Handle other methods
        else {
            response.setHeader('Allow', ['GET', 'POST', 'PUT']);
            return response.status(405).end('Method Not Allowed');
        }
    } catch (error) {
        console.error('API Memory Route Error:', error);
        return response.status(500).json({ error: `Error en el servidor de la API: ${error.message}` });
    }
}
