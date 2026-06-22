/**
 * Utility to optimize Cloudinary URLs dynamically for performance.
 * Bypasses Next.js image optimization limits by using Cloudinary CDN transformations directly.
 */
export function getOptimizedImageUrl(url: string | undefined, width = 600, height?: number): string {
    if (!url) return '';
    
    // Check if it's a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
        const parts = url.split('/upload/');
        if (parts.length === 2) {
            const baseUrl = parts[0];
            const imagePath = parts[1];
            
            // Build transformation string
            const transforms = ['f_auto', 'q_auto'];
            
            if (width > 0) {
                transforms.push(`w_${width}`);
            }
            if (height && height > 0) {
                transforms.push(`h_${height}`);
            }
            
            // If both width and height are provided, use crop fill to maintain aspect ratio
            if (width > 0 && height && height > 0) {
                transforms.push('c_fill', 'g_auto');
            } else if (width > 0) {
                transforms.push('c_scale');
            }
            
            return `${baseUrl}/upload/${transforms.join(',')}/${imagePath}`;
        }
    }
    
    return url;
}
