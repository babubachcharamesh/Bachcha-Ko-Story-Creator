export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export function downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function generateVideoPoster(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = videoUrl;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        
        const onSeeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                video.remove();
                return reject('Could not get canvas context');
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.remove();
            resolve(canvas.toDataURL('image/jpeg'));
        };

        const onLoadedData = () => {
             // Seeking to a later time like 0.1s can help ensure a frame is rendered
            video.currentTime = 0.1;
        };

        const onError = (e: Event | string) => {
            console.error("Error loading video for poster generation:", e);
            video.remove();
            reject(new Error('Failed to load video data for poster generation.'));
        };

        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);

        video.load();
    });
}

export function formatDateForFilename(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${month}${year}`;
}
