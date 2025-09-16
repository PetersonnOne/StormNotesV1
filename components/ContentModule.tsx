'use client'

import React, { useState, useEffect } from 'react';
import { generateText } from '@/services/geminiService';
import { SpinnerIcon, ChevronLeftIcon, SparklesIcon, ClipboardIcon, ClipboardCheckIcon, ShieldCheckIcon, DownloadIcon } from '@/components/icons';

interface ContentModuleProps {
    onBack: () => void;
}

const CONTENT_TYPES = ['Blog Post', 'Short Story', 'Meeting Points', 'Presentation'];

const ContentModule: React.FC<ContentModuleProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
    const [pages, setPages] = useState('1');
    const [generatedText, setGeneratedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [error, setError] = useState('');

    const pageOptions = contentType === 'Meeting Points' ? ['1'] : ['1', '2'];

    useEffect(() => {
        if (contentType === 'Meeting Points' && pages === '2') {
            setPages('1');
        }
    }, [contentType, pages]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt or topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedText('');
        try {
            const fullPrompt = `Generate a ${pages}-page ${contentType.toLowerCase()} about the following topic: "${prompt}"`;
            const result = await generateText(fullPrompt);
            setGeneratedText(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRefinePrompt = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt to refine.');
            return;
        }
        setIsRefining(true);
        setError('');
        try {
            const refineRequest = `Refine and improve the following prompt to be more descriptive and effective for a generative AI model. Return only the refined prompt. Prompt: "${prompt}"`;
            const refinedPrompt = await generateText(refineRequest);
            setPrompt(refinedPrompt);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`Failed to refine prompt: ${errorMessage}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            setError('Failed to copy text.');
            console.error('Clipboard error:', err);
        });
    };

    const handleEnhanceWithValidation = async () => {
        if (!generatedText) return;
        setIsEnhancing(true);
        setError('');
        try {
            const enhanceRequest = `Analyze the following text. If it contains code like an HTML form or a script, add relevant input validation to it. If it's not code, return the original text unchanged. Here is the text: "${generatedText}"`;
            const enhancedText = await generateText(enhanceRequest);
            setGeneratedText(enhancedText);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(`Failed to enhance text: ${errorMessage}`);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleDownload = () => {
        if (!generatedText) return;
        
        // Create a Blob directly from the raw text for better compatibility.
        const blob = new Blob([generatedText], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Sanitize the filename
        const safeFilename = contentType.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${safeFilename}_output.doc`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to menu
                </button>
            </div>

            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Content Generator</h1>
                <p className="mt-4 text-lg text-gray-300">Bring your ideas to life. Select your content type and let Gemini create for you.</p>
            </div>

            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="contentType" className="block text-sm font-medium text-gray-300 mb-1">Content Type</label>
                        <select
                            id="contentType"
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={isLoading || isRefining}
                        >
                            {CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pages" className="block text-sm font-medium text-gray-300 mb-1">Pages</label>
                        <select
                            id="pages"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            disabled={isLoading || isRefining}
                        >
                            {pageOptions.map(page => <option key={page} value={page}>{page}</option>)}
                        </select>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a topic, e.g., 'The future of artificial intelligence'..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-4 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow pr-36"
                        disabled={isLoading || isRefining}
                    />
                    <button
                        onClick={handleRefinePrompt}
                        disabled={isLoading || isRefining || !prompt.trim()}
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isRefining ? <SpinnerIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4" />}
                        Refine Prompt
                    </button>
                </div>
                <button
                    onClick={handleGenerate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
                    disabled={isLoading || isRefining}
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate'
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-md">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {generatedText && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                         <h2 className="text-2xl font-semibold">Generated Content</h2>
                         <div className="flex items-center gap-2">
                             <button onClick={handleCopyToClipboard} className="flex items-center gap-1.5 text-sm py-1.5 px-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                                {isCopied ? <><ClipboardCheckIcon className="w-4 h-4 text-green-400" /> Copied!</> : <><ClipboardIcon className="w-4 h-4" /> Copy</>}
                            </button>
                             <button onClick={handleEnhanceWithValidation} disabled={isEnhancing} className="flex items-center gap-1.5 text-sm py-1.5 px-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50">
                                {isEnhancing ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <ShieldCheckIcon className="w-4 h-4" />}
                                Add Input Validation
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-1.5 text-sm py-1.5 px-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                                <DownloadIcon className="w-4 h-4" /> Download
                            </button>
                         </div>
                    </div>
                    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 whitespace-pre-wrap">
                        {isEnhancing ? <div className="animate-pulse text-gray-500">Enhancing content...</div> : generatedText}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentModule;