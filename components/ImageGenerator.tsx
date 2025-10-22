import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      setError('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
       <header className="p-4 border-b border-[var(--bg-default)]">
            <h2 className="text-xl font-semibold">Image Generator</h2>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
            <div className="w-full h-full max-w-2xl max-h-[512px] flex justify-center items-center bg-[var(--bg-default)] rounded-lg">
                {isLoading && <LoadingSpinner size="lg" />}
                {error && <p className="text-red-500">{error}</p>}
                {imageUrl && <img src={imageUrl} alt={prompt} className="max-h-full max-w-full object-contain rounded-lg" />}
                {!isLoading && !imageUrl && !error && (
                    <div className="text-center text-[var(--text-secondary)]">
                        <Icon name="image" className="w-16 h-16 mx-auto mb-4" />
                        <p>Generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--bg-default)]">
            <div className="flex items-center gap-2 bg-[var(--bg-default)] rounded-2xl p-2 max-w-3xl mx-auto">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="A futuristic city with flying cars..."
                  className="flex-1 p-2 bg-transparent focus:outline-none text-[var(--text-primary)]"
                  disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="p-2 font-semibold text-white bg-[var(--accent)] rounded-full hover:opacity-90 disabled:bg-[var(--text-secondary)] disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Icon name="send" className="w-5 h-5" />}
                </button>
            </div>
        </div>
    </div>
  );
};
