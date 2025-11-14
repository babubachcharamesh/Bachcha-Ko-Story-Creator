import React from 'react';
import { ImageUploadSlot } from './ImageUploadSlot';
import { Character, AspectRatio } from '../types';

interface ControlPanelProps {
    characters: Character[];
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    prompts: string[];
    setPrompts: (prompts: string[]) => void;
    onCharacterChange: (id: number, file: File | null) => void;
    onCharacterNameChange: (id: number, name: string) => void;
    onToggleCharacterSelection: (id: number) => void;
    onGenerateAll: () => void;
    onAddCharacter: () => void;
    onRemoveCharacter: (id: number) => void;
    isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    characters,
    aspectRatio,
    setAspectRatio,
    prompts,
    setPrompts,
    onCharacterChange,
    onCharacterNameChange,
    onToggleCharacterSelection,
    onGenerateAll,
    onAddCharacter,
    onRemoveCharacter,
    isLoading,
}) => {
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col gap-8 sticky top-8">
            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">1. Character Reference Images</h2>
                <div className="grid grid-cols-2 gap-4">
                    {characters.map(char => (
                        <ImageUploadSlot
                            key={char.id}
                            id={char.id}
                            character={char}
                            onChange={onCharacterChange}
                            onNameChange={onCharacterNameChange}
                            onToggleSelection={onToggleCharacterSelection}
                            onRemove={onRemoveCharacter}
                            canRemove={characters.length > 1}
                        />
                    ))}
                </div>
                 <div className="mt-4">
                    <button
                        onClick={onAddCharacter}
                        className="w-full border-2 border-dashed border-gray-600 hover:border-red-400 text-gray-400 hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                    >
                        <PlusIcon /> Add Character
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">2. Aspect Ratio</h2>
                <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3 (Standard)</option>
                </select>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">3. Prompt List</h2>
                <p className="text-sm text-gray-400 mb-3">
                    Enter each prompt on a new line or separated by commas. Use character names (e.g., "{characters[0]?.name || 'Character 1'}") for consistency.
                </p>
                <textarea
                    rows={10}
                    value={prompts.join('\n')}
                    onChange={(e) => setPrompts(e.target.value.split(/[\n,]/g))}
                    placeholder={`Character 1 running in the park
Character 2 and Character 1 eating ice cream,
Character 1 flying over the city`}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-sm leading-6"
                    aria-label="Prompt List"
                />
            </div>

            <button
                onClick={onGenerateAll}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-red-800 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon />
                        Generating...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate All Images
                    </>
                )}
            </button>
        </div>
    );
};


const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a9 9 0 011.666 5.333A9 9 0 0118 19m-1-12a9 9 0 00-5.333-1.667A9 9 0 002 11m16 8a9 9 0 01-5.333 1.667A9 9 0 012 11" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);