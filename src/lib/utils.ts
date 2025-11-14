import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes a filename to be safe for HTTP headers and file systems.
 * Replaces problematic characters with safe alternatives.
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace characters that cause issues in HTTP headers
  // Characters like: < > : " / \ | ? * and control characters
  // Also replace spaces and parentheses with underscores or hyphens
  
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/[()\[\]]/g, '_') // Replace parentheses and brackets
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .trim() || 'file'; // Fallback to 'file' if empty
}
