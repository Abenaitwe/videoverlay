'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [overlayText, setOverlayText] = useState('');
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStack, setErrorStack] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize FFmpeg only on client side
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg();
    }
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      setLoadingMessage('Loading FFmpeg...');
      const ffmpeg = ffmpegRef.current;
      
      if (!ffmpeg) return;
      
      // Load ffmpeg with logging
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });

      // Load from local public directory and convert to blob URLs
      // This is necessary for the ES module to work with strict COEP headers
      const baseURL = window.location.origin;
      
      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript'
      );
      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm'
      );
      
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      setFfmpegLoaded(true);
      setLoadingMessage('');
      console.log('FFmpeg loaded successfully');
    } catch (err: any) {
      console.error('Failed to load FFmpeg:', err);
      setError('Failed to load FFmpeg. Please refresh the page and try again.');
      setErrorStack(err?.stack || String(err));
      setLoadingMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setError(null);
        setErrorStack(null);
        setProcessedVideoUrl(null);
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setError(null);
        setErrorStack(null);
        setProcessedVideoUrl(null);
      } else {
        setError('Please upload a valid video file');
      }
    }
  };

  const processVideo = async () => {
    if (!videoFile || !overlayText.trim()) {
      setError('Please upload a video and enter overlay text');
      return;
    }

    if (!ffmpegLoaded) {
      setError('FFmpeg is still loading, please wait...');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setErrorStack(null);
    setLoadingMessage('Processing video...');

    try {
      const ffmpeg = ffmpegRef.current;
      
      if (!ffmpeg) {
        throw new Error('FFmpeg not initialized');
      }

      // Write input file to FFmpeg's virtual file system
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile('input.mp4', inputData);

      // Escape special characters in overlay text for FFmpeg
      const escapedText = overlayText
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "'\\\\\\''")
        .replace(/:/g, '\\:');

      // Run FFmpeg command to add text overlay
      // Using drawtext filter with retro styling
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `drawtext=text='${escapedText}':fontsize=48:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)-50`,
        '-codec:a', 'copy',
        '-y',
        'output.mp4'
      ]);

      // Read the output file
      const outputData = await ffmpeg.readFile('output.mp4');
      const uint8Array = outputData instanceof Uint8Array ? outputData : new Uint8Array(outputData as any);
      const blob = new Blob([uint8Array], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      setProcessedVideoUrl(url);
      setLoadingMessage('');
    } catch (err: any) {
      console.error('Error processing video:', err);
      setError('Failed to process video');
      setErrorStack(err?.stack || String(err));
      setLoadingMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-cream border-8 border-navy rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-6 text-center">
          Video Text Overlay
        </h1>
        
        {/* Loading FFmpeg message */}
        {!ffmpegLoaded && loadingMessage && (
          <div className="bg-yellow-100 border-4 border-navy rounded-xl p-4 mb-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-navy border-t-coral mb-2"></div>
            <p className="text-navy font-semibold">{loadingMessage}</p>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          className={`border-4 ${isDragging ? 'border-coral bg-coral/10' : 'border-navy'} rounded-2xl p-8 mb-6 text-center cursor-pointer transition-all ${videoFile ? 'bg-white' : 'bg-white/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => videoInputRef.current?.click()}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {videoFile ? (
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-coral" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <p className="text-navy font-bold text-lg mb-2">{videoFile.name}</p>
              <p className="text-navy/70 text-sm">Click or drag to change video</p>
            </div>
          ) : (
            <div>
              <svg className="w-16 h-16 mx-auto mb-4 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-navy font-bold text-lg mb-2">Drag & Drop Video</p>
              <p className="text-navy/70 text-sm">or click to browse (max ~10 seconds)</p>
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <label htmlFor="overlayText" className="block text-navy font-bold text-lg mb-3">
            Overlay Text
          </label>
          <input
            id="overlayText"
            type="text"
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            placeholder="Enter text to overlay on video..."
            className="w-full px-6 py-4 border-4 border-navy rounded-xl text-navy text-lg placeholder-navy/40 focus:outline-none focus:ring-4 focus:ring-coral/50 bg-white"
          />
        </div>

        {/* Process Button */}
        <button
          onClick={processVideo}
          disabled={!videoFile || !overlayText.trim() || isProcessing || !ffmpegLoaded}
          className="w-full bg-coral hover:bg-coral/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold text-xl py-5 px-6 border-4 border-navy rounded-xl shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] disabled:hover:translate-y-0 disabled:shadow-lg mb-6"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Process Video'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-4 border-red-600 rounded-xl p-4 mb-6">
            <p className="text-red-600 font-bold text-lg mb-2">Error: {error}</p>
            {errorStack && (
              <details className="mt-3">
                <summary className="text-red-600 font-semibold cursor-pointer">
                  View Error Stack
                </summary>
                <pre className="mt-2 text-xs text-red-800 bg-red-50 p-3 rounded overflow-x-auto border-2 border-red-300">
                  {errorStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Video Preview */}
        {processedVideoUrl && (
          <div className="border-4 border-navy rounded-2xl p-4 bg-white">
            <h2 className="text-navy font-bold text-2xl mb-4 text-center">Processed Video</h2>
            <video
              controls
              className="w-full rounded-lg border-2 border-navy"
              src={processedVideoUrl}
            >
              Your browser does not support the video tag.
            </video>
            <a
              href={processedVideoUrl}
              download="processed-video.mp4"
              className="mt-4 block w-full bg-navy hover:bg-navy/90 text-white font-bold text-lg py-3 px-6 border-4 border-navy rounded-xl text-center transition-all hover:shadow-lg"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
