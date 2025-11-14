import React from 'react';
import { GeneratedImage, GenerationProgress } from '../types';
import { downloadImage, formatDateForFilename } from '../utils/fileUtils';

interface ResultsDisplayProps {
    images: GeneratedImage[];
    isLoading: boolean;
    error: string | null;
    onPreview: (base64: string) => void;
    onDownloadAll: () => void;
    generationProgress: GenerationProgress;
}

const ImageErrorCard = ({ prompt, error }: { prompt: string; error: string }) => (
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center aspect-square" role="alert">
        <ErrorIcon />
        <p className="text-sm font-semibold text-red-400 mt-2">{error}</p>
        <p className="text-xs text-gray-400 mt-1 italic truncate" title={prompt}>Prompt: "{prompt}"</p>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ images, isLoading, error, onPreview, onDownloadAll, generationProgress }) => {
    
    const handleDownloadSingle = (base64: string, index: number) => {
        const dateStr = formatDateForFilename();
        const filename = `${String(index + 1).padStart(3, '0')}_${dateStr}.png`;
        downloadImage(`data:image/png;base64,${base64}`, filename);
    };

    const hasSuccessfulImages = images.some(img => img.base64);

    return (
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-inner min-h-[calc(100vh-10rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-red-300">Results</h2>
                {hasSuccessfulImages && !isLoading && (
                    <button onClick={onDownloadAll} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2">
                        <DownloadIcon />
                        Download All
                    </button>
                )}
            </div>

            {isLoading && generationProgress.total > 0 && (
                <div className="w-full max-w-full mb-6">
                    <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-300">
                        <span>{`Generating Image ${generationProgress.current} of ${generationProgress.total}...`}</span>
                        <span>{Math.round((generationProgress.current / generationProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                            style={{ width: `${Math.round((generationProgress.current / generationProgress.total) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}
            
            <div className="flex-grow flex flex-col justify-center">
                {error && (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-red-900/20 border border-red-500/50 p-6 rounded-lg">
                        <ErrorIcon />
                        <h3 className="text-xl font-semibold text-red-400 mt-4">An Error Occurred</h3>
                        <p className="text-gray-300 mt-2">{error}</p>
                    </div>
                )}

                {!error && !isLoading && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-gray-700 rounded-lg p-6">
                        <ImageIcon />
                        <h3 className="text-2xl font-semibold mt-4">Your creations will appear here</h3>
                        <p className="text-gray-400 mt-2">Setup your characters and prompts on the left, then click "Generate All Images".</p>
                    </div>
                )}
                
                {images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {images.map((image, index) => 
                            image.error ? (
                                <ImageErrorCard key={image.id} prompt={image.prompt} error={image.error} />
                            ) : (
                                <div key={image.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden group relative">
                                    <img src={`data:image/png;base64,${image.base64}`} alt={image.prompt} className="w-full h-auto object-cover aspect-square" />
                                    <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-3">
                                        <button onClick={() => onPreview(image.base64!)} className="w-full bg-gray-200 text-gray-900 font-bold py-2 px-4 rounded-md text-sm hover:bg-white transition flex items-center justify-center gap-2">
                                            <EyeIcon/> Preview
                                        </button>
                                        <button onClick={() => handleDownloadSingle(image.base64!, index)} className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-red-700 transition flex items-center justify-center gap-2">
                                            <DownloadIcon/> Download
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);