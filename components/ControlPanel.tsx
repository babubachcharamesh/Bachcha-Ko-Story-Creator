import React, { useState, useEffect } from 'react';
import { ImageUploadSlot } from './ImageUploadSlot';
import { PromptInput } from './PromptInput';
import { Tooltip } from './Tooltip';
import { Character, AspectRatio, GenerationType } from '../types';

interface ControlPanelProps {
    characters: Character[];
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    prompts: string[];
    setPrompts: (prompts: string[]) => void;
    consistencyStrength: number;
    setConsistencyStrength: (strength: number) => void;
    imagesPerPrompt: number;
    setImagesPerPrompt: (num: number) => void;
    createTransitions: boolean;
    setCreateTransitions: (value: boolean) => void;
    generationType: GenerationType;
    setGenerationType: (type: GenerationType) => void;
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
    savedPromptPresets: string[];
    onSavePromptPreset: (name: string) => void;
    onLoadPromptPreset: (name: string) => void;
    onDeletePromptPreset: (name: string) => void;
}

const validateCharacterName = (name: string): string | null => {
    if (/^Character \d+$/.test(name)) {
        return null;
    }
    const regex = /[^a-zA-Z0-9]/;
    if (name.trim() !== '' && regex.test(name)) {
        return "For best results, use a single-word name without spaces or special characters.";
    }
    return null;
};

const examplePrompts = [
    "Character 1 smiling and waving.",
    "Character 1 and Character 2 playing in a park.",
    "A dramatic, cinematic shot of Character 1 looking at a sunset.",
    "A cute, cartoon-style drawing of Character 2 sleeping in a cozy bed.",
];

const videoAspectRatios: AspectRatio[] = ['16:9', '9:16'];
const imageAspectRatios: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
    characters,
    aspectRatio,
    setAspectRatio,
    prompts,
    setPrompts,
    consistencyStrength,
    setConsistencyStrength,
    imagesPerPrompt,
    setImagesPerPrompt,
    createTransitions,
    setCreateTransitions,
    generationType,
    setGenerationType,
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
    savedPromptPresets,
    onSavePromptPreset,
    onLoadPromptPreset,
    onDeletePromptPreset,
}) => {
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const [selectedPromptPreset, setSelectedPromptPreset] = useState<string>('');
    
    useEffect(() => {
        if (generationType === 'videos' && !videoAspectRatios.includes(aspectRatio)) {
            setAspectRatio('16:9');
        }
    }, [generationType, aspectRatio, setAspectRatio]);

    useEffect(() => {
        if (savedPresets.length > 0 && !savedPresets.includes(selectedPreset)) {
            setSelectedPreset(savedPresets[0]);
        } else if (savedPresets.length === 0) {
            setSelectedPreset('');
        }
    }, [savedPresets, selectedPreset]);

    useEffect(() => {
        if (savedPromptPresets.length > 0 && !savedPromptPresets.includes(selectedPromptPreset)) {
            setSelectedPromptPreset(savedPromptPresets[0]);
        } else if (savedPromptPresets.length === 0) {
            setSelectedPromptPreset('');
        }
    }, [savedPromptPresets, selectedPromptPreset]);
    
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

    const handleExampleClick = (example: string) => {
        const newPrompts = [...prompts];
        const firstEmptyIndex = newPrompts.findIndex(p => p.trim() === '');
        
        if (firstEmptyIndex !== -1) {
            newPrompts[firstEmptyIndex] = example;
            setPrompts(newPrompts);
        } else {
            setPrompts([...newPrompts, example]);
        }
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

    const handleSavePromptPresetClick = () => {
        const name = prompt("Enter a name for the scene preset:");
        if (name && name.trim() !== '') {
            const trimmedName = name.trim();
            if (savedPromptPresets.includes(trimmedName)) {
                if (window.confirm(`A preset named "${trimmedName}" already exists. Do you want to overwrite it?`)) {
                    onSavePromptPreset(trimmedName);
                }
            } else {
                onSavePromptPreset(trimmedName);
            }
        }
    };

    const handleLoadPromptPresetClick = () => {
        if (selectedPromptPreset) {
            onLoadPromptPreset(selectedPromptPreset);
        }
    };

    const handleDeletePromptPresetClick = () => {
        if (selectedPromptPreset && window.confirm(`Are you sure you want to delete the scene preset "${selectedPromptPreset}"? This cannot be undone.`)) {
            onDeletePromptPreset(selectedPromptPreset);
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col gap-8 sticky top-28">
            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">1. Generation Mode</h2>
                <div className="flex w-full bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button onClick={() => setGenerationType('images')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${generationType === 'images' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        Images
                    </button>
                    <button onClick={() => setGenerationType('videos')} className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${generationType === 'videos' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        Videos
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">2. Character References</h2>
                <div className="grid grid-cols-2 gap-4">
                    {characters.map(char => (
                        <ImageUploadSlot
                            key={char.id}
                            id={char.id}
                            character={char}
                            onChange={onCharacterChange}
                            onCharacterNameChange={onCharacterNameChange}
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
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                            <PlusIcon /> Add Character
                        </button>
                    </Tooltip>
                </div>
            </div>

             <div>
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">Character Presets</h2>
                <div className="flex flex-col gap-3">
                    <Tooltip text="Save the current character names, images, and selections as a new preset.">
                        <button
                            onClick={handleSavePresetClick}
                            disabled={isLoading || characters.every(c => !c.base64)}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-400 dark:disabled:border-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                    className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
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
                                    className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-green-600 rounded-md transition text-gray-800 dark:text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                    aria-label="Load selected preset"
                                >
                                    <LoadIcon className="h-4 w-4" />
                                </button>
                            </Tooltip>
                             <Tooltip text="Permanently delete the selected preset.">
                                <button
                                    onClick={handleDeletePresetClick}
                                    disabled={isLoading || !selectedPreset}
                                    className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-red-500 rounded-md transition text-gray-800 dark:text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
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
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">3. Generation Options</h2>
                 <Tooltip text="Choose the width-to-height ratio for the output.">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aspect Ratio</label>
                    <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    >
                        {(generationType === 'images' ? imageAspectRatios : videoAspectRatios).map(ratio => (
                            <option key={ratio} value={ratio}>
                                {ratio} ({ratio === '16:9' ? 'Landscape' : ratio === '9:16' ? 'Portrait' : ratio === '1:1' ? 'Square' : 'Standard'})
                            </option>
                        ))}
                    </select>
                </Tooltip>
            </div>

            {generationType === 'images' && (
                <>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">4. Consistency Strength</h2>
                        <Tooltip text="Controls how closely the AI follows the reference images. 'Creative' allows more variation, while 'Strict' ensures higher fidelity.">
                            <label htmlFor="consistency-slider" className="block mb-2 text-sm text-gray-600 dark:text-gray-400 cursor-help">
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
                            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                            <span>Creative</span>
                            <span>Balanced</span>
                            <span>Strict</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">5. Images per Scene</h2>
                         <Tooltip text="Each prompt represents a ~6-second scene. Choose how many images (frames) to create for each scene. More images create smoother motion but take longer.">
                            <label htmlFor="images-per-prompt-slider" className="block mb-2 text-sm text-gray-600 dark:text-gray-400 cursor-help">
                                Number of images (frames) to generate for each scene.
                            </label>
                        </Tooltip>
                        <div className="flex items-center gap-4">
                            <input
                                id="images-per-prompt-slider"
                                type="range"
                                min="1"
                                max="12"
                                step="1"
                                value={imagesPerPrompt}
                                onChange={(e) => setImagesPerPrompt(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                disabled={isLoading}
                            />
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold text-sm py-1 px-3 rounded-md min-w-[40px] text-center">
                                {imagesPerPrompt}
                            </span>
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">6. Storyboard Options</h2>
                        <div className="bg-gray-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <Tooltip text="Generates a special transition frame between scenes to create a smoother video flow. Requires at least two prompts.">
                                <label className="flex items-center gap-3 cursor-pointer text-gray-700 dark:text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={createTransitions}
                                        onChange={(e) => setCreateTransitions(e.target.checked)}
                                        disabled={prompts.filter(p => p.trim() !== '').length <= 1 || isLoading}
                                        className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 text-red-500 focus:ring-red-500 disabled:opacity-50"
                                    />
                                    <span>Create smooth transitions between scenes</span>
                                </label>
                            </Tooltip>
                        </div>
                    </div>
                </>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-300">{generationType === 'images' ? '7' : '4'}. Prompt List (Scenes)</h2>
                 <div className="bg-gray-100/50 dark:bg-gray-700/50 p-3 rounded-lg mb-4">
                    <h3 className="text-md font-semibold mb-3 text-red-500 dark:text-red-200">Scene Presets</h3>
                    <div className="flex flex-col gap-3">
                        <Tooltip text="Save the current list of prompts as a new preset.">
                            <button
                                onClick={handleSavePromptPresetClick}
                                disabled={isLoading || prompts.every(p => p.trim() === '')}
                                className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-400 dark:disabled:border-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <SaveIcon />
                                Save Current Scenes
                            </button>
                        </Tooltip>
                        {savedPromptPresets.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Tooltip text="Select a previously saved scene preset.">
                                    <select
                                        value={selectedPromptPreset}
                                        onChange={(e) => setSelectedPromptPreset(e.target.value)}
                                        className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                        aria-label="Select a scene preset"
                                        disabled={isLoading}
                                    >
                                        {savedPromptPresets.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </Tooltip>
                                <Tooltip text="Load the scenes from the selected preset.">
                                    <button
                                        onClick={handleLoadPromptPresetClick}
                                        disabled={isLoading || !selectedPromptPreset}
                                        className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-green-600 rounded-md transition text-gray-800 dark:text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                        aria-label="Load selected scene preset"
                                    >
                                        <LoadIcon className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip text="Permanently delete the selected scene preset.">
                                    <button
                                        onClick={handleDeletePromptPresetClick}
                                        disabled={isLoading || !selectedPromptPreset}
                                        className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-red-500 rounded-md transition text-gray-800 dark:text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                                        aria-label="Delete selected scene preset"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Each prompt describes a scene in your story. Use "Character 1", etc. which will be replaced by their names.
                </p>
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Examples:</p>
                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => handleExampleClick(example)}
                                className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md transition cursor-pointer"
                                title="Click to use this prompt"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
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
                     <Tooltip text="Add another text prompt to generate an additional scene.">
                        <button
                            onClick={handleAddPrompt}
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-400 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                            <PlusIcon /> Add Scene (Prompt)
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
                            className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-400 dark:disabled:border-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <TrashIcon />
                            Clear All
                        </button>
                    </Tooltip>
                    <Tooltip text="Reload your last saved session from your browser's local storage.">
                        <button
                            onClick={onLoadState}
                            disabled={isLoading}
                            className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:border-gray-400 dark:disabled:border-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <LoadIcon />
                            Load Saved
                        </button>
                    </Tooltip>
                </div>
                <Tooltip text={generationType === 'videos' ? 'Video generation requires a project with billing enabled. See ai.google.dev/gemini-api/docs/billing for details.' : 'Start the image generation process for all entered prompts.'}>
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
                                {generationType === 'images' ? <SparklesIcon /> : <VideoIcon />}
                                Generate All {generationType === 'images' ? 'Images' : 'Videos'}
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

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
