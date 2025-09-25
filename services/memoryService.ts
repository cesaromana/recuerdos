import { sql } from '@vercel/postgres';
import type { Memory, MemoryMedia } from '../types';

// NOTE: This service now connects to a real Vercel Postgres database.

export const getMemories = async (): Promise<Memory[]> => {
  const { rows } = await sql`SELECT id, date, title, description, "coverImageUrl", media, location FROM memories ORDER BY date DESC;`;
  return rows.map(row => ({
    ...row,
    date: new Date(row.date).toISOString().split('T')[0] // Ensure date format is correct
  })) as Memory[];
};

export const getMemoryByDate = async (date: string): Promise<Memory | undefined> => {
  const { rows } = await sql`SELECT id, date, title, description, "coverImageUrl", media, location FROM memories WHERE date = ${date};`;
  if (rows.length === 0) return undefined;
  
  const row = rows[0];
  return {
     ...row,
    date: new Date(row.date).toISOString().split('T')[0]
  } as Memory;
};

interface NewMemoryData {
    date: string;
    title: string;
    description: string;
    media: MemoryMedia[];
    coverImageUrl: string;
    location?: string;
}

export const addMemory = async (data: NewMemoryData): Promise<Memory> => {
  const { date, title, description, media, coverImageUrl, location } = data;
  
  const mediaJson = JSON.stringify(media);
  
  const { rows } = await sql`
    INSERT INTO memories (date, title, description, "coverImageUrl", media, location)
    VALUES (${date}, ${title}, ${description}, ${coverImageUrl}, ${mediaJson}, ${location})
    RETURNING id, date, title, description, "coverImageUrl", media, location;
  `;
  
  const row = rows[0];
  return {
    ...row,
    date: new Date(row.date).toISOString().split('T')[0]
  } as Memory;
};

// The data type for update can include the ID and be partial
export interface UpdateMemoryData extends Partial<NewMemoryData> {
    id: string;
}

export const updateMemory = async (data: UpdateMemoryData): Promise<Memory | undefined> => {
  const { id, date, title, description, coverImageUrl, media, location } = data;

  const mediaJson = media !== undefined ? JSON.stringify(media) : undefined;

  const { rows } = await sql`
    UPDATE memories
    SET 
      date = COALESCE(${date}, date), 
      title = COALESCE(${title}, title), 
      description = COALESCE(${description}, description), 
      "coverImageUrl" = COALESCE(${coverImageUrl}, "coverImageUrl"), 
      media = COALESCE(${mediaJson}::jsonb, media),
      location = COALESCE(${location}, location)
    WHERE id = ${id}
    RETURNING id, date, title, description, "coverImageUrl", media, location;
  `;

  if (rows.length === 0) return undefined;

  const row = rows[0];
  return {
     ...row,
    date: new Date(row.date).toISOString().split('T')[0]
  } as Memory;
};

// Deletion is now handled by a secure server-side API route (/api/delete-memory.js)

export const searchMemories = async (query: string): Promise<Memory[]> => {
    const searchQuery = `%${query}%`;
    const { rows } = await sql`
        SELECT id, date, title, description, "coverImageUrl", media, location
        FROM memories 
        WHERE 
            title ILIKE ${searchQuery} OR 
            description ILIKE ${searchQuery} OR
            location ILIKE ${searchQuery}
        ORDER BY date DESC;
    `;
    return rows.map(row => ({
        ...row,
        date: new Date(row.date).toISOString().split('T')[0]
    })) as Memory[];
};
