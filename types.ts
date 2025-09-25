
export interface MemoryMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
}

export interface Memory {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  media: MemoryMedia[];
  coverImageUrl: string;
  location?: string;
  tags?: string[];
}
