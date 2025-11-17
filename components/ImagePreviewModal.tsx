
import React from 'react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Full size preview" className="max-w-full max-h-[85vh] object-contain rounded-md" />
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition"
                    aria-label="Close preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};