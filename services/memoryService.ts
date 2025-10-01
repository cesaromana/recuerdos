import type { Memory, MemoryMedia } from '../types';

// This service is now a pure API client. It fetches data from our secure server-side API routes.
// It no longer contains any database logic.

interface NewMemoryData {
    date: string;
    title: string;
    description: string;
    media: MemoryMedia[];
    coverImageUrl: string;
    location?: string;
    spotifyTrackId?: string;
    spotifyTrackName?: string;
    spotifyArtistName?: string;
    spotifyAlbumImageUrl?: string;
    spotifyTrackPreviewUrl?: string;
}

export interface UpdateMemoryData extends Partial<NewMemoryData> {
    id: string;
}

/**
 * A helper function to handle API requests and error handling.
 * @param url The API endpoint to call.
 * @param options The options for the fetch request (method, body, etc.).
 * @returns The JSON response from the API.
 */
async function fetchApi(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido en la API' }));
    throw new Error(errorData.error || `La petición a la API falló con estado ${response.status}`);
  }

  // Handle cases with no content in response, e.g., a 204 No Content status.
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return null;
}

export const getMemories = async (): Promise<Memory[]> => {
  return fetchApi('/api/memory');
};

export const getMemoryByDate = async (date: string): Promise<Memory | undefined> => {
   try {
    const memory = await fetchApi(`/api/memory?date=${date}`);
    return memory;
  } catch (error) {
    // If the API returns a 404, it will throw an error. We can treat this as "not found".
    console.warn(`Memory for date ${date} not found via API.`);
    return undefined;
  }
};

export const addMemory = async (data: NewMemoryData): Promise<Memory> => {
  return fetchApi('/api/memory', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMemory = async (data: UpdateMemoryData): Promise<Memory | undefined> => {
  return fetchApi('/api/memory', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const searchMemories = async (query: string): Promise<Memory[]> => {
  return fetchApi(`/api/memory?q=${encodeURIComponent(query)}`);
};