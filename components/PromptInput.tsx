
import React from 'react';

interface PromptInputProps {
    index: number;
    value: string;
    onChange: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ index, value, onChange, onRemove, canRemove }) => {
    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={`Prompt ${index + 1}`}
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            />
            {canRemove && (
                <button
                    onClick={() => onRemove(index)}
                    className="p-2 bg-gray-600 hover:bg-red-500 rounded-full transition text-white"
                    aria-label="Remove prompt"
                >
                   <TrashIcon/>
                </button>
            )}
        </div>
    );
};

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)
