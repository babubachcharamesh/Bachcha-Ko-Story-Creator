import React, { useState, useEffect } from 'react';
import { ImageUploadSlot } from './ImageUploadSlot';
import { PromptInput } from './PromptInput';
import { Tooltip } from './Tooltip';
import { Character, AspectRatio } from '../types';

interface ControlPanelProps {
    characters: Character[];
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    prompts: string[];
    setPrompts: (prompts: string[]) => void;
    consistencyStrength: number;
    setConsistencyStrength: (strength: number) => void;
    onCharacterChange: (id: number, file: File | null) => void;
    onCharacterNameChange: (id: number, name: string) => void;
    onToggleCharacterSelection: (id: number) => void;
    onGenerateAll: () => void;
    onAddCharacter: () => void;
    onRemoveCharacter: (id: number) => void;
    onClearAll: () => void;
    onLoadState: () => void;
    isLoading: boolean;
    savedPresets: string[];
    onSavePreset: (name: string) => void;
    onLoadPreset: (name: string) => void;
    onDeletePreset: (name: string) => void;
}

const validateCharacterName = (name: string): string | null => {
    // Default names like "Character 1" are exempt from validation.
    if (/^Character \d+$/.test(name)) {
        return null;
    }
    // Regex to find any character that is not a letter or a number.
    const regex = /[^a-zA-Z0-9]/;
    if (name.trim() !== '' && regex.test(name)) {
        return "For best results, use a single-word name without spaces or special characters.";
    }
    return null;
};


export const ControlPanel: React.FC<ControlPanelProps> = ({
    characters,
    aspectRatio,
    setAspectRatio,
    prompts,
    setPrompts,
    consistencyStrength,
    setConsistencyStrength,
    onCharacterChange,
    onCharacterNameChange,
    onToggleCharacterSelection,
    onGenerateAll,
    onAddCharacter,
    onRemoveCharacter,
    onClearAll,
    onLoadState,
    isLoading,
    savedPresets,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
}) => {
    const [selectedPreset, setSelectedPreset] = useState<string>('');

    useEffect(() => {
        if (savedPresets.length > 0 && !savedPresets.includes(selectedPreset)) {
            setSelectedPreset(savedPresets[0]);
        } else if (savedPresets.length === 0) {
            setSelectedPreset('');
        }
    }, [savedPresets, selectedPreset]);
    
    const handlePromptChange = (index: number, value: string) => {
        const newPrompts = [...prompts];
        newPrompts[index] = value;
        setPrompts(newPrompts);
    };

    const handleRemovePrompt = (index: number) => {
        if (prompts.length <= 1) return;
        const newPrompts = prompts.filter((_, i) => i !== index);
        setPrompts(newPrompts);
    };

    const handleAddPrompt = () => {
        setPrompts([...prompts, '']);
    };
    
    const handleSavePresetClick = () => {
        const name = prompt("Enter a name for the character preset:");
        if (name && name.trim() !== '') {
            const trimmedName = name.trim();
            if (savedPresets.includes(trimmedName)) {
                if (window.confirm(`A preset named "${trimmedName}" already exists. Do you want to overwrite it?`)) {
                    onSavePreset(trimmedName);
                }
            } else {
                onSavePreset(trimmedName);
            }
        }
    };

    const handleLoadPresetClick = () => {
        if (selectedPreset) {
            onLoadPreset(selectedPreset);
        }
    };

    const handleDeletePresetClick = () => {
        if (selectedPreset && window.confirm(`Are you sure you want to delete the preset "${selectedPreset}"? This cannot be undone.`)) {
            onDeletePreset(selectedPreset);
        }
    };

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
                            nameWarning={validateCharacterName(char.name)}
                        />
                    ))}
                </div>
                 <div className="mt-4">
                    <Tooltip text="Add another character slot for a new reference image.">
                        <button
                            onClick={onAddCharacter}
                            className="w-full border-2 border-dashed border-gray-600 hover:border-red-400 text-gray-400 hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                            <PlusIcon /> Add Character
                        </button>
                    </Tooltip>
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">Character Presets</h2>
                <div className="flex flex-col gap-3">
                    <Tooltip text="Save the current character names, images, and selections as a new preset.">
                        <button
                            onClick={handleSavePresetClick}
                            disabled={isLoading || characters.every(c => !c.base64)}
                            className="w-full border-2 border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <SaveIcon />
                            Save Current Characters
                        </button>
                    </Tooltip>
                    {savedPresets.length > 0 && (
                        <div className="flex items-center gap-2">
                             <Tooltip text="Select a previously saved character preset.">
                                <select
                                    value={selectedPreset}
                                    onChange={(e) => setSelectedPreset(e.target.value)}
                                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    aria-label="Select a character preset"
                                    disabled={isLoading}
                                >
                                    {savedPresets.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                             </Tooltip>
                            <Tooltip text="Load the characters and settings from the selected preset.">
                                <button
                                    onClick={handleLoadPresetClick}
                                    disabled={isLoading || !selectedPreset}
                                    className="p-2 bg-gray-600 hover:bg-green-600 rounded-md transition text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                    aria-label="Load selected preset"
                                >
                                    <LoadIcon className="h-4 w-4" />
                                </button>
                            </Tooltip>
                             <Tooltip text="Permanently delete the selected preset.">
                                <button
                                    onClick={handleDeletePresetClick}
                                    disabled={isLoading || !selectedPreset}
                                    className="p-2 bg-gray-600 hover:bg-red-500 rounded-md transition text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                    aria-label="Delete selected preset"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                             </Tooltip>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">2. Aspect Ratio</h2>
                 <Tooltip text="Choose the width-to-height ratio for the generated images.">
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
                </Tooltip>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">3. Consistency Strength</h2>
                <Tooltip text="Controls how closely the AI follows the reference images. 'Creative' allows more variation, while 'Strict' ensures higher fidelity.">
                    <label htmlFor="consistency-slider" className="block mb-2 text-sm text-gray-400 cursor-help">
                        How strictly to follow reference images. Higher is more strict.
                    </label>
                </Tooltip>
                <input
                    id="consistency-slider"
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    value={consistencyStrength}
                    onChange={(e) => setConsistencyStrength(Number(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>Creative</span>
                    <span>Balanced</span>
                    <span>Strict</span>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-300">4. Prompt List</h2>
                <p className="text-sm text-gray-400 mb-3">
                    Add one or more prompts. Use placeholders like "Character 1", which will be replaced by the names you provide.
                </p>
                <div className="flex flex-col gap-3">
                    {prompts.map((prompt, index) => (
                        <PromptInput
                            key={index}
                            index={index}
                            value={prompt}
                            onChange={handlePromptChange}
                            onRemove={handleRemovePrompt}
                            canRemove={prompts.length > 1}
                        />
                    ))}
                </div>
                <div className="mt-4">
                     <Tooltip text="Add another text prompt to generate an additional image.">
                        <button
                            onClick={handleAddPrompt}
                            className="w-full border-2 border-dashed border-gray-600 hover:border-red-400 text-gray-400 hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                            <PlusIcon /> Add Prompt
                        </button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Tooltip text="Reset all character images, names, prompts, and settings to their default state.">
                        <button
                            onClick={onClearAll}
                            disabled={isLoading}
                            className="w-full border-2 border-gray-600 hover:border-red-500 text-gray-400 hover:text-red-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <TrashIcon />
                            Clear All
                        </button>
                    </Tooltip>
                    <Tooltip text="Reload your last saved session from your browser's local storage.">
                        <button
                            onClick={onLoadState}
                            disabled={isLoading}
                            className="w-full border-2 border-gray-600 hover:border-green-500 text-gray-400 hover:text-green-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <LoadIcon />
                            Load Saved
                        </button>
                    </Tooltip>
                </div>
                <Tooltip text="Start the image generation process for all entered prompts.">
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
                </Tooltip>
            </div>
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

const TrashIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const LoadIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);