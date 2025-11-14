import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { generateStoryImage } from './services/geminiService';
import { fileToBase64, downloadImage, formatDateForFilename } from './utils/fileUtils';
import { Character, AspectRatio, GeneratedImage, GenerationProgress } from './types';

const App: React.FC = () => {
    const initialCharacters = Array.from({ length: 2 }, (_, i) => ({
        id: i + 1,
        name: `Character ${i + 1}`,
        file: null,
        base64: null,
        isSelected: false,
    }));

    const [characters, setCharacters] = useState<Character[]>(initialCharacters);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [prompts, setPrompts] = useState<string[]>(['']);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

        const imageParts = selectedCharacters.map(c => ({
            inlineData: {
                data: c.base64!.split(',')[1],
                mimeType: c.file!.type,
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

            const fullPrompt = `${modifiedPrompt}. Maintain character consistency from the provided images. Generate in 4k resolution with a ${aspectRatio} aspect ratio.`;
            
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
            // Update state after each attempt to show progress in real-time
            setGeneratedImages([...newImages]);
            setGenerationProgress({ current: i + 1, total: validPrompts.length });
        }

        setIsLoading(false);
    }, [characters, prompts, aspectRatio]);

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
                        onCharacterChange={handleCharacterChange}
                        onCharacterNameChange={handleCharacterNameChange}
                        onToggleCharacterSelection={toggleCharacterSelection}
                        onGenerateAll={handleGenerateAll}
                        onAddCharacter={addCharacterSlot}
                        onRemoveCharacter={removeCharacterSlot}
                        isLoading={isLoading}
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