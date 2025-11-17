export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';

export type GenerationType = 'images' | 'videos';

export interface Character {
    id: number;
    name: string;
    file: File | null;
    base64: string | null;
    isSelected: boolean;
}

export interface GeneratedImage {
    id: number;
    prompt: string;
    base64: string | null;
    error?: string;
}

export interface GeneratedVideo {
    id: number;
    prompt: string;
    videoUrl: string | null;
    posterUrl?: string | null;
    error?: string;
}

export interface GenerationProgress {
    current: number;
    total: number;
    message?: string;
}

export type Theme = 'light' | 'dark';
