import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const { playAudio, isPlaying } = useAudioPlayer();

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const audioBase64 = await generateSpeech(text);
      setGeneratedAudio(audioBase64);
    } catch (err) {
      setError('Failed to generate speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
        <header className="p-4 border-b border-[var(--bg-default)]">
            <h2 className="text-xl font-semibold">Text-to-Speech</h2>
        </header>

        <div className="flex-1 flex flex-col items-center p-4 md:p-6 space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              className="w-full max-w-3xl p-4 bg-[var(--bg-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text-primary)]"
              rows={8}
              disabled={isLoading}
            />
             <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="px-6 py-3 font-semibold text-white bg-[var(--accent)] rounded-lg hover:opacity-90 disabled:bg-[var(--text-secondary)] disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                    <>
                        <LoadingSpinner size="sm" />
                        <span>Generating...</span>
                    </>
                ) : (
                    'Generate Speech'
                )}
            </button>
        </div>
      
        <div className="p-4 md:p-6 flex justify-center">
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {generatedAudio && !isLoading && (
                <div className="w-full max-w-3xl p-4 bg-[var(--bg-default)] rounded-lg flex items-center gap-4">
                    <button onClick={() => playAudio(generatedAudio)} disabled={isPlaying} className="p-3 rounded-full bg-[var(--accent)] hover:opacity-90 disabled:bg-[var(--text-secondary)]">
                        <Icon name={isPlaying ? 'stop' : 'play'} className="w-6 h-6 text-white" />
                    </button>
                    <p className="text-[var(--text-secondary)]">Audio generated. Press play to listen.</p>
                </div>
            )}
        </div>
    </div>
  );
};
