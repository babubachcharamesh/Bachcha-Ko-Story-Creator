import React, { useRef } from 'react';
import { Character } from '../types';

interface ImageUploadSlotProps {
    id: number;
    character: Character;
    onChange: (id: number, file: File | null) => void;
    onNameChange: (id: number, name: string) => void;
    onToggleSelection: (id: number) => void;
    onRemove: (id: number) => void;
    canRemove: boolean;
}

export const ImageUploadSlot: React.FC<ImageUploadSlotProps> = ({ id, character, onChange, onNameChange, onToggleSelection, onRemove, canRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onChange(id, file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative flex flex-col items-center gap-2">
             {canRemove && (
                <button 
                    onClick={() => onRemove(id)} 
                    className="absolute -top-2 -right-2 bg-gray-600 text-white hover:bg-red-500 rounded-full p-1 z-10 transition-colors"
                    aria-label="Remove character"
                >
                    <CloseIcon />
                </button>
            )}
            <input
                type="text"
                value={character.name}
                onChange={(e) => onNameChange(id, e.target.value)}
                placeholder={`Character ${id} Name`}
                className="w-full bg-gray-600 border border-gray-500 rounded-md p-1.5 text-center text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 transition"
                aria-label={`Character ${id} name`}
            />
            <div
                className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-500 hover:border-red-400 transition relative group"
                onClick={handleClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                {character.base64 ? (
                    <>
                        <img src={character.base64} alt={`Character ${id}`} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-bold">Change</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400">
                        <UploadIcon />
                        <span className="text-xs">Upload Image</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 mt-1">
                <input
                    type="checkbox"
                    checked={character.isSelected}
                    onChange={() => onToggleSelection(id)}
                    disabled={!character.file}
                    className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-red-500 focus:ring-red-500 disabled:opacity-50"
                />
                <span className={`text-sm ${!character.file ? 'text-gray-500' : ''}`}>Include</span>
            </div>
        </div>
    );
};

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);