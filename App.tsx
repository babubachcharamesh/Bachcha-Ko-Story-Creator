
import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { ThemeToggle } from './components/ThemeToggle';
import { generateStoryImage, generateStoryVideo } from './services/geminiService';
import { fileToBase64, downloadFile, generateVideoPoster, formatDateForFilename } from './utils/fileUtils';
import { Character, AspectRatio, GeneratedImage, GeneratedVideo, GenerationProgress, GenerationType, Theme } from './types';

// FIX: Define a global AIStudio interface and use it for window.aistudio to resolve conflicting global declarations.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio: AIStudio;
    }
}

const initialCharacters = Array.from({ length: 2 }, (_, i) => ({
    id: i + 1,
    name: `Character ${i + 1}`,
    file: null,
    base64: null,
    isSelected: false,
}));

const LOCAL_STORAGE_KEY = 'bachchaStoryCreatorState';
const PRESETS_STORAGE_KEY = 'bachchaStoryCreatorPresets';
const PROMPT_PRESETS_STORAGE_KEY = 'bachchaStoryCreatorPromptPresets';
const THEME_STORAGE_KEY = 'bachchaStoryCreatorTheme';


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
                imagesPerPrompt: savedState.imagesPerPrompt ?? 6,
                createTransitions: savedState.createTransitions ?? false,
                generationType: savedState.generationType || 'images',
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
        imagesPerPrompt: 6,
        createTransitions: false,
        generationType: 'images' as GenerationType,
    };
};


const App: React.FC = () => {
    const [characters, setCharacters] = useState<Character[]>(getInitialState().characters);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(getInitialState().aspectRatio);
    const [prompts, setPrompts] = useState<string[]>(getInitialState().prompts);
    const [consistencyStrength, setConsistencyStrength] = useState<number>(getInitialState().consistencyStrength);
    const [imagesPerPrompt, setImagesPerPrompt] = useState<number>(getInitialState().imagesPerPrompt);
    const [createTransitions, setCreateTransitions] = useState<boolean>(getInitialState().createTransitions);
    const [generationType, setGenerationType] = useState<GenerationType>(getInitialState().generationType);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ current: 0, total: 0, message: '' });
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [savedPresets, setSavedPresets] = useState<{[key: string]: Omit<Character, 'file'>[]}>({});
    const [savedPromptPresets, setSavedPromptPresets] = useState<{[key: string]: string[]}>({});
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
        if (savedTheme) return savedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });
    
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        try {
            const savedPresetsJSON = localStorage.getItem(PRESETS_STORAGE_KEY);
            if (savedPresetsJSON) {
                setSavedPresets(JSON.parse(savedPresetsJSON));
            }
             const savedPromptPresetsJSON = localStorage.getItem(PROMPT_PRESETS_STORAGE_KEY);
            if (savedPromptPresetsJSON) {
                setSavedPromptPresets(JSON.parse(savedPromptPresetsJSON));
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
                imagesPerPrompt,
                createTransitions,
                generationType,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [characters, aspectRatio, prompts, consistencyStrength, imagesPerPrompt, createTransitions, generationType]);

    useEffect(() => {
        try {
            localStorage.setItem(PROMPT_PRESETS_STORAGE_KEY, JSON.stringify(savedPromptPresets));
        } catch (error) {
            console.error("Failed to save prompt presets to localStorage", error);
        }
    }, [savedPromptPresets]);

    const handleLoadState = useCallback(() => {
        const loadedState = getInitialState();
        setCharacters(loadedState.characters);
        setAspectRatio(loadedState.aspectRatio);
        setPrompts(loadedState.prompts);
        setConsistencyStrength(loadedState.consistencyStrength);
        setImagesPerPrompt(loadedState.imagesPerPrompt);
        setCreateTransitions(loadedState.createTransitions);
        setGenerationType(loadedState.generationType);
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
        setImagesPerPrompt(6);
        setCreateTransitions(false);
        setGenerationType('images');
        setGeneratedImages([]);
        setGeneratedVideos([]);
        setIsLoading(false);
        setGenerationProgress({ current: 0, total: 0, message: '' });
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

    const handleSavePromptPreset = useCallback((name: string) => {
        const newPresets = { ...savedPromptPresets, [name]: prompts.filter(p => p.trim() !== '') };
        setSavedPromptPresets(newPresets);
        alert(`Prompt preset "${name}" saved!`);
    }, [prompts, savedPromptPresets]);

    const handleLoadPromptPreset = useCallback((name: string) => {
        const presetPrompts = savedPromptPresets[name];
        if (presetPrompts) {
            setPrompts(presetPrompts.length > 0 ? presetPrompts : ['']);
        }
    }, [savedPromptPresets]);

    const handleDeletePromptPreset = useCallback((name: string) => {
        const newPresets = { ...savedPromptPresets };
        delete newPresets[name];
        setSavedPromptPresets(newPresets);
    }, [savedPromptPresets]);

    const handleGenerate = useCallback(async () => {
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

        if (generationType === 'videos' && window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            } catch (e) {
                setError("Could not verify API key. Please ensure you have selected a project with billing enabled for video generation.");
                return;
            }
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedVideos([]);

        if (generationType === 'images') {
            await handleGenerateImages(selectedCharacters, validPrompts);
        } else {
            await handleGenerateVideos(selectedCharacters, validPrompts);
        }

        setIsLoading(false);
    }, [characters, prompts, aspectRatio, consistencyStrength, imagesPerPrompt, createTransitions, generationType]);

    const handleGenerateImages = useCallback(async (selectedCharacters: Character[], validPrompts: string[]) => {
        const totalItems = validPrompts.length * imagesPerPrompt;
        setGenerationProgress({ current: 0, total: totalItems, message: 'Starting image generation...' });

        const consistencyInstruction = "Recreate the characters from the provided images with high fidelity. Pay close attention to specific details like clothing, hairstyle, facial features, and color palette to ensure strict consistency.";
        
        const characterReferenceClauses = selectedCharacters.map((c, index) => {
            const ordinals = ["first", "second", "third", "fourth", "fifth"];
            const ordinal = ordinals[index] || `next`;
            return `The ${ordinal} provided image is a reference for the character named '${c.name}'.`;
        }).join(' ');

        const imageParts = selectedCharacters.map(c => ({
            inlineData: { data: c.base64!.split(',')[1], mimeType: c.file?.type || 'image/png' },
        }));

        const newImages: GeneratedImage[] = [];
        let counter = 0;

        for (let i = 0; i < validPrompts.length; i++) {
            const originalPrompt = validPrompts[i];
            
            for (let j = 0; j < imagesPerPrompt; j++) {
                setGenerationProgress({ current: counter + 1, total: totalItems, message: `Generating image ${j + 1} for prompt ${i + 1}...` });
                 try {
                    let finalPromptText = `${originalPrompt}. This is frame ${j + 1} of ${imagesPerPrompt} in a continuous action sequence.`;
                    const fullPrompt = `${finalPromptText} ${characterReferenceClauses} ${consistencyInstruction} Generate the image in a style consistent with the reference images and a ${aspectRatio} aspect ratio.`;
                    
                    const textPart = { text: fullPrompt };
                    const resultBase64 = await generateStoryImage([...imageParts, textPart]);
                    newImages.push({ id: Date.now() + counter, prompt: originalPrompt, base64: resultBase64 });
                } catch (err) {
                    console.error(`Error generating image ${j + 1} for prompt: "${originalPrompt}"`, err);
                    const errorMessage = err instanceof Error ? err.message : `Image generation failed unexpectedly.`;
                    newImages.push({ id: Date.now() + counter, prompt: originalPrompt, base64: null, error: errorMessage });
                }
                counter++;
                setGeneratedImages([...newImages]);
            }
        }
    }, [aspectRatio, imagesPerPrompt]);
    
    const handleGenerateVideos = useCallback(async (selectedCharacters: Character[], validPrompts: string[]) => {
        const totalItems = validPrompts.length;
        setGenerationProgress({ current: 0, total: totalItems, message: 'Starting video generation...' });

        const firstCharacter = selectedCharacters[0];
        const newVideos: GeneratedVideo[] = [];

        for (let i = 0; i < validPrompts.length; i++) {
            const prompt = validPrompts[i];
            setGenerationProgress(prev => ({ ...prev, current: i + 1, message: `Generating video for prompt ${i + 1}... This may take a few minutes.` }));

            try {
                const videoUrl = await generateStoryVideo(prompt, firstCharacter, aspectRatio as '16:9' | '9:16');
                const posterUrl = await generateVideoPoster(videoUrl);
                newVideos.push({ id: Date.now() + i, prompt, videoUrl, posterUrl });
            } catch (err) {
                 console.error(`Error generating video for prompt: "${prompt}"`, err);
                const errorMessage = err instanceof Error ? err.message : `Video generation failed unexpectedly.`;
                if (errorMessage.includes("Requested entity was not found")) {
                     setError("API Key error. Please click 'Generate Videos' again to select a project with billing enabled.");
                     setIsLoading(false);
                     return;
                }
                newVideos.push({ id: Date.now() + i, prompt, videoUrl: null, error: errorMessage });
            }
            setGeneratedVideos([...newVideos]);
        }
    }, [aspectRatio]);

    const handleDownloadAll = useCallback(async () => {
        const dateStr = formatDateForFilename();
        if (generationType === 'images') {
            const itemsToDownload = generatedImages.filter(img => img.base64);
            for (let i = 0; i < itemsToDownload.length; i++) {
                const image = itemsToDownload[i];
                const filename = `${String(i + 1).padStart(3, '0')}_${dateStr}.png`;
                if (image.base64) {
                    downloadFile(`data:image/png;base64,${image.base64}`, filename);
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
            }
        } else {
            const itemsToDownload = generatedVideos.filter(vid => vid.videoUrl);
            for (let i = 0; i < itemsToDownload.length; i++) {
                const video = itemsToDownload[i];
                const filename = `${String(i + 1).padStart(3, '0')}_${dateStr}.mp4`;
                if(video.videoUrl) {
                    downloadFile(video.videoUrl, filename);
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
            }
        }
    }, [generatedImages, generatedVideos, generationType]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            <header className="bg-white dark:bg-gray-800 p-4 shadow-lg flex justify-between items-center sticky top-0 z-30">
                <div className="w-1/3"></div>
                <h1 className="w-1/3 text-3xl font-bold text-center text-red-500 dark:text-red-400 tracking-wider">
                    Bachcha's Story Creator
                </h1>
                <div className="w-1/3 flex justify-end">
                     <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
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
                        imagesPerPrompt={imagesPerPrompt}
                        setImagesPerPrompt={setImagesPerPrompt}
                        createTransitions={createTransitions}
                        setCreateTransitions={setCreateTransitions}
                        generationType={generationType}
                        setGenerationType={setGenerationType}
                        onCharacterChange={handleCharacterChange}
                        onCharacterNameChange={handleCharacterNameChange}
                        onToggleCharacterSelection={toggleCharacterSelection}
                        onGenerateAll={handleGenerate}
                        onAddCharacter={addCharacterSlot}
                        onRemoveCharacter={removeCharacterSlot}
                        onClearAll={handleClearAll}
                        onLoadState={handleLoadState}
                        isLoading={isLoading}
                        savedPresets={Object.keys(savedPresets)}
                        onSavePreset={handleSavePreset}
                        onLoadPreset={handleLoadPreset}
                        onDeletePreset={handleDeletePreset}
                        savedPromptPresets={Object.keys(savedPromptPresets)}
                        onSavePromptPreset={handleSavePromptPreset}
                        onLoadPromptPreset={handleLoadPromptPreset}
                        onDeletePromptPreset={handleDeletePromptPreset}
                    />
                </div>
                <div className="flex-1">
                    <ResultsDisplay
                        generationType={generationType}
                        images={generatedImages}
                        videos={generatedVideos}
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