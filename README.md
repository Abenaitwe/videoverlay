# Video Text Overlay App

A Next.js 14 application that allows users to upload short videos and add text overlays using FFmpeg WASM.

## Features

- 🎬 Drag & drop or click to upload video files
- ✏️ Add custom text overlays to videos
- 🎨 Bold, retro-inspired design with navy borders and coral accents
- 🔄 Real-time video processing in the browser using FFmpeg WASM
- 📥 Download processed videos
- ⚠️ Comprehensive error handling with stack traces displayed in the UI

## Design

- **Retro aesthetic**: Thick navy borders, coral accent buttons on a warm cream background
- **Centered card layout**: All content in a clean, centered card with padding and rounded corners
- **Responsive**: Works on desktop and mobile devices
- **Loading states**: Spinner animation while processing
- **Error display**: Clear error messages with expandable stack traces

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Usage

1. **Upload a Video**: 
   - Drag and drop a video file onto the upload area, or
   - Click the upload area to browse and select a video file
   - Recommended: Use short videos (max ~10 seconds) for best performance

2. **Enter Overlay Text**:
   - Type the text you want to overlay on the video in the text input field

3. **Process Video**:
   - Click the "Process Video" button
   - Wait for FFmpeg to process the video (you'll see a loading spinner)
   - FFmpeg will add the text overlay centered at the bottom of the video with a white font and black border

4. **Preview & Download**:
   - Once processing is complete, the video preview will appear
   - Use the video controls to play and preview your processed video
   - Click the "Download Video" button to save the processed video to your device

## Technical Details

### Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **FFmpeg WASM**: Client-side video processing using FFmpeg compiled to WebAssembly
- **@ffmpeg/ffmpeg**: v0.12.10 (ESM version)
- **@ffmpeg/util**: v0.12.1

### Browser Compatibility

The application requires a modern browser with support for:
- WebAssembly
- SharedArrayBuffer (requires specific CORS headers)
- ES modules

Recommended browsers:
- Chrome 92+
- Firefox 95+
- Safari 15.2+
- Edge 92+

### CORS Headers

The application is configured with the necessary CORS headers for SharedArrayBuffer support:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are set in `next.config.mjs` and are required for FFmpeg WASM to function properly.

## Project Structure

```
/workspace/
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Main page with video processing logic
│   └── globals.css         # Global styles with Tailwind directives
├── next.config.mjs         # Next.js configuration
├── tailwind.config.mjs     # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies
```

## Troubleshooting

### FFmpeg Loading Issues

If FFmpeg fails to load:
- Check your internet connection (FFmpeg core files are loaded from CDN)
- Ensure your browser supports WebAssembly and SharedArrayBuffer
- Check the browser console for detailed error messages

### Processing Errors

If video processing fails:
- Ensure the video file is in a supported format (MP4 recommended)
- Check that the video file is not corrupted
- View the error stack trace in the UI for debugging information
- Try with a shorter video (processing time increases with video length)

### Performance

Video processing happens entirely in the browser and depends on:
- Your device's CPU performance
- Video file size and duration
- Browser efficiency with WebAssembly

For best performance, use short videos (under 10 seconds).

## License

This project is open source and available under the MIT License.
