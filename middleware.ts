import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add headers for SharedArrayBuffer support (required for ffmpeg.wasm)
  // Using credentialless mode to allow blob URLs while still enabling SharedArrayBuffer
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  return response;
}

export const config = {
  matcher: '/:path*',
};
