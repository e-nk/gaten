"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Play, CheckCircle } from "lucide-react";

interface VideoUploadProps {
  onVideoUpload: (videoData: { url: string; duration: number }) => void;
  currentVideoUrl?: string;
}

export function VideoUpload({ onVideoUpload, currentVideoUrl }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      alert('File size must be less than 500MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onVideoUpload({
            url: response.url,
            duration: response.duration || 0
          });
        } else {
          throw new Error('Upload failed');
        }
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', 'http://localhost:4000/api/upload/video');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setDragActive(false);
  };

  if (currentVideoUrl && !uploading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Video uploaded successfully</span>
          </div>
          <Button
            type="button" // Explicitly set button type
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              e.stopPropagation(); // Prevent event bubbling
              onVideoUpload({ url: '', duration: 0 });
            }}
            size="sm"
            variant="outline"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
        
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video 
            src={currentVideoUrl} 
            controls 
            className="w-full h-full"
            preload="metadata"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-school-primary-blue bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-school-primary-blue rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-school-primary-blue font-medium">Uploading video...</p>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}% complete</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div 
                className="bg-school-primary-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Drop your video file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Supports MP4, MOV, AVI (max 500MB)</p>
            </div>
            <Button
              type="button" // Explicitly set button type to prevent form submission
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                e.stopPropagation(); // Prevent event bubbling
                
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
              variant="outline"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Video File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}