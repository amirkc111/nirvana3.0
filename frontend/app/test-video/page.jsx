'use client';

import { useEffect, useRef } from 'react';

export default function TestVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      console.log('Video element:', videoRef.current);
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-8">Video Test Page</h1>
      
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-auto"
          controls
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => console.error('Video error:', e)}
          onCanPlay={() => console.log('Video can play')}
          onLoadStart={() => console.log('Video loading started')}
        >
          <source src="/bgvid.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg shadow w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <div className="space-y-2">
          <p>Video source: <code className="bg-gray-100 p-1 rounded">/bgvid.mp4</code></p>
          <p>Check the browser's developer console (F12) for more detailed error messages.</p>
          <p>If the video doesn't play, please check:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Is the video file in the <code className="bg-gray-100 p-1 rounded">/public</code> directory?</li>
            <li>Is the video format supported by your browser?</li>
            <li>Are there any CORS issues in the Network tab?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
