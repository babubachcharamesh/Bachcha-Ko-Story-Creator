import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { generateStoryImage } from './services/geminiService';
import { fileToBase64, downloadImage, formatDateForFilename } from './utils/fileUtils';
import { Character, AspectRatio, GeneratedImage, GenerationProgress } from './types';

const initialCharacters = Array.from({ length: 2 }, (_, i) => ({
    id: i + 1,
    name: `Character ${i + 1}`,
    file: null,
    base64: null,
    isSelected: false,
}));

const LOCAL_STORAGE_KEY = 'bachchaStoryCreatorState';
const PRESETS_STORAGE_KEY = 'bachchaStoryCreatorPresets';


const getInitialState = () => {
    try {
        const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            // Ensure characters have the 'file' property, even if it's null
            const characters = savedState.characters.map((c: Omit<Character, 'file'>) => ({...c, file: null}));
            return {
                characters: characters || initialCharacters,
                aspectRatio: savedState.aspectRatio || '1:1',
                prompts: savedState.prompts || [''],
                consistencyStrength: savedState.consistencyStrength ?? 0.8,
            };
        }
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
    }
    return {
        characters: initialCharacters,
        aspectRatio: '1:1' as AspectRatio,
        prompts: [''],
        consistencyStrength: 0.8,
    };
};


const App: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>(getInitialState().characters);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(getInitialState().aspectRatio);
    const [prompts, setPrompts] = useState<string[]>(getInitialState().prompts);
    const [consistencyStrength, setConsistencyStrength] = useState<number>(getInitialState().consistencyStrength);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [savedPresets, setSavedPresets] = useState<{[key: string]: Omit<Character, 'file'>[]}>({});

    useEffect(() => {
        try {
            const savedPresetsJSON = localStorage.getItem(PRESETS_STORAGE_KEY);
            if (savedPresetsJSON) {
                setSavedPresets(JSON.parse(savedPresetsJSON));
            }
        } catch (error) {
            console.error("Failed to load presets from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            const charactersToSave = characters.map(({ id, name, base64, isSelected }) => ({
                id,
                name,
                base64,
                isSelected,
            }));
    
            const stateToSave = {
                characters: charactersToSave,
                aspectRatio,
                prompts,
                consistencyStrength,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [characters, aspectRatio, prompts, consistencyStrength]);

    const handleLoadState = useCallback(() => {
        const loadedState = getInitialState();
        setCharacters(loadedState.characters);
        setAspectRatio(loadedState.aspectRatio);
        setPrompts(loadedState.prompts);
        setConsistencyStrength(loadedState.consistencyStrength);
    }, []);

    const handleCharacterChange = useCallback(async (id: number, file: File | null) => {
        if (!file) {
            setCharacters(prev => prev.map(c => c.id === id ? { ...c, file: null, base64: null } : c));
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            setCharacters(prev => prev.map(c => c.id === id ? { ...c, file, base64 } : c));
        } catch (err) {
            setError('Failed to read image file.');
            console.error(err);
        }
    }, []);

    const handleCharacterNameChange = useCallback((id: number, name: string) => {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    }, []);

    const toggleCharacterSelection = useCallback((id: number) => {
        setCharacters(prev => prev.map(c => c.id === id ? { ...c, isSelected: !c.isSelected } : c));
    }, []);
    
    const addCharacterSlot = useCallback(() => {
        setCharacters(prev => {
            const newId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1;
            return [
                ...prev,
                {
                    id: newId,
                    name: `Character ${newId}`,
                    file: null,
                    base64: null,
                    isSelected: false,
                }
            ];
        });
    }, []);

    const removeCharacterSlot = useCallback((id: number) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
    }, []);

    const handleClearAll = useCallback(() => {
        setCharacters(initialCharacters);
        setAspectRatio('1:1');
        setPrompts(['']);
        setConsistencyStrength(0.8);
        setGeneratedImages([]);
        setIsLoading(false);
        setGenerationProgress({ current: 0, total: 0 });
        setError(null);
        setPreviewImage(null);
    }, []);

    const handleSavePreset = useCallback((name: string) => {
        const charactersToSave = characters.map(({ id, name, base64, isSelected }) => ({
            id,
            name,
            base64,
            isSelected,
        }));

        const newPresets = { ...savedPresets, [name]: charactersToSave };
        setSavedPresets(newPresets);
        try {
            localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
            alert(`Preset "${name}" saved!`);
        } catch (error) {
            console.error("Failed to save presets to localStorage", error);
            setError("Failed to save preset.");
        }
    }, [characters, savedPresets]);

    const handleLoadPreset = useCallback((name: string) => {
        const presetCharacters = savedPresets[name];
        if (presetCharacters) {
            const loadedCharacters = presetCharacters.map(c => ({
                ...c,
                file: null,
            }));
            setCharacters(loadedCharacters);
        }
    }, [savedPresets]);

    const handleDeletePreset = useCallback((name: string) => {
        const newPresets = { ...savedPresets };
        delete newPresets[name];
        setSavedPresets(newPresets);
        try {
            localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
        } catch (error) {
            console.error("Failed to delete preset from localStorage", error);
        }
    }, [savedPresets]);

    const handleGenerateAll = useCallback(async () => {
        const selectedCharacters = characters.filter(c => c.isSelected && c.base64);
        const validPrompts = prompts.filter(p => p.trim() !== '');

        if (selectedCharacters.length === 0) {
            setError('Please select at least one character reference image.');
            return;
        }
        if (validPrompts.length === 0) {
            setError('Please enter at least one prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGenerationProgress({ current: 0, total: validPrompts.length });

        const getConsistencyInstruction = (strength: number): string => {
            if (strength <= 0.4) {
                return "Use the provided images as loose inspiration for the characters' appearance.";
            }
            if (strength <= 0.7) {
                return "Maintain the general appearance and style of the characters from the provided images, but allow for some creative interpretation.";
            }
            return "Recreate the characters from the provided images with high fidelity. Pay close attention to specific details like clothing, hairstyle, facial features, and color palette to ensure strict consistency.";
        };

        const consistencyInstruction = getConsistencyInstruction(consistencyStrength);
        
        const characterReferenceClauses = selectedCharacters.map((c, index) => {
            const ordinals = ["first", "second", "third", "fourth", "fifth"]; // Extend if more are needed
            const ordinal = ordinals[index] || `next`;
            return `The ${ordinal} provided image is a reference for the character named '${c.name}'.`;
        }).join(' ');

        const imageParts = selectedCharacters.map(c => ({
            inlineData: {
                data: c.base64!.split(',')[1],
                mimeType: c.file?.type || 'image/png',
            },
        }));

        const newImages: GeneratedImage[] = [];
        for (let i = 0; i < validPrompts.length; i++) {
            const originalPrompt = validPrompts[i];
            
            let modifiedPrompt = originalPrompt;
            characters.forEach(char => {
                const placeholder = new RegExp(`\\bCharacter ${char.id}\\b`, 'gi');
                if (char.name.trim() !== '') {
                    modifiedPrompt = modifiedPrompt.replace(placeholder, char.name);
                }
            });

            const fullPrompt = `${modifiedPrompt}. ${characterReferenceClauses} ${consistencyInstruction} Generate the image in a style consistent with the reference images and a ${aspectRatio} aspect ratio.`;
            
            try {
                const textPart = { text: fullPrompt };
                const resultBase64 = await generateStoryImage([...imageParts, textPart]);
                newImages.push({
                    id: Date.now() + i,
                    prompt: originalPrompt,
                    base64: resultBase64,
                });
            } catch (err) {
                console.error(`Error generating image for prompt: "${originalPrompt}"`, err);
                newImages.push({
                    id: Date.now() + i,
                    prompt: originalPrompt,
                    base64: null,
                    error: 'Image generation failed.',
                });
            }
            setGeneratedImages([...newImages]);
            setGenerationProgress({ current: i + 1, total: validPrompts.length });
        }

        setIsLoading(false);
    }, [characters, prompts, aspectRatio, consistencyStrength]);

    const handleDownloadAll = useCallback(() => {
        const dateStr = formatDateForFilename();
        const imagesToDownload = generatedImages.filter(img => img.base64);
        let i = 0;

        const downloadNext = () => {
            if (i < imagesToDownload.length) {
                const image = imagesToDownload[i];
                const originalIndex = generatedImages.findIndex(img => img.id === image.id);
                const filename = `${String(originalIndex + 1).padStart(3, '0')}_${dateStr}.png`;
                if(image.base64) {
                    downloadImage(`data:image/png;base64,${image.base64}`, filename);
                }
                i++;
                setTimeout(downloadNext, 250); // 250ms delay between downloads
            }
        };

        downloadNext();
    }, [generatedImages]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800 p-4 shadow-lg">
                <h1 className="text-3xl font-bold text-center text-red-400 tracking-wider">
                    Bachcha's Story Creator
                </h1>
            </header>
            <main className="flex flex-col md:flex-row gap-8 p-4 md:p-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <ControlPanel
                        characters={characters}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        prompts={prompts}
                        setPrompts={setPrompts}
                        consistencyStrength={consistencyStrength}
                        setConsistencyStrength={setConsistencyStrength}
                        onCharacterChange={handleCharacterChange}
                        onCharacterNameChange={handleCharacterNameChange}
                        onToggleCharacterSelection={toggleCharacterSelection}
                        onGenerateAll={handleGenerateAll}
                        onAddCharacter={addCharacterSlot}
                        onRemoveCharacter={removeCharacterSlot}
                        onClearAll={handleClearAll}
                        onLoadState={handleLoadState}
                        isLoading={isLoading}
                        savedPresets={Object.keys(savedPresets)}
                        onSavePreset={handleSavePreset}
                        onLoadPreset={handleLoadPreset}
                        onDeletePreset={handleDeletePreset}
                    />
                </div>
                <div className="flex-1">
                    <ResultsDisplay
                        images={generatedImages}
                        isLoading={isLoading}
                        error={error}
                        onPreview={setPreviewImage}
                        onDownloadAll={handleDownloadAll}
                        generationProgress={generationProgress}
                    />
                </div>
            </main>
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={`data:image/png;base64,${previewImage}`}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
};

export default App;
