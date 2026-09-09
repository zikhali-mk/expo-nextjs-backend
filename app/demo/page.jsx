"use client";

import { useState } from "react";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/javascript";

export default function Page() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setImageUrl("");
    setProgress(0);

    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setProgress(0);

      // Get secure authentication parameters
      const authResponse = await fetch("/api/upload-auth");

      if (!authResponse.ok) {
        throw new Error("Failed to get ImageKit authentication.");
      }

      const auth = await authResponse.json();

      // Upload selected image
      const response = await upload({
        file: file,
        fileName: file.name,

        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
        publicKey: auth.publicKey,

        useUniqueFileName: true,

        folder: "/uploads",

        onProgress: (event) => {
          if (event.total) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );

            setProgress(percentage);
          }
        },
      });

      console.log("IMAGEKIT UPLOAD RESPONSE:", response);

      console.log("IMAGE URL:", response.url);

      setImageUrl(response.url);
      setProgress(100);
    } catch (error) {
      console.error("ImageKit upload error:", error);

      if (error instanceof ImageKitAbortError) {
        setError("Upload was cancelled.");
      } else if (error instanceof ImageKitInvalidRequestError) {
        setError(`Invalid upload request: ${error.message}`);
      } else if (error instanceof ImageKitUploadNetworkError) {
        setError(`Network error: ${error.message}`);
      } else if (error instanceof ImageKitServerError) {
        setError(`ImageKit server error: ${error.message}`);
      } else {
        setError(error.message || "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl">

        <h1 className="text-2xl font-bold mb-2">
          ImageKit Image Picker
        </h1>

        <p className="text-sm text-gray-400 mb-6">
          Select an image from your computer and upload it to ImageKit.
        </p>

        {/* File Picker */}
        <label className="block cursor-pointer">
          <div className="rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 transition p-8 text-center">

            <div className="text-4xl mb-3">
              🖼️
            </div>

            <p className="font-medium">
              {file ? file.name : "Choose an image"}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, JPEG, WEBP
            </p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </label>

        {/* Preview */}
        {preview && (
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-2">
              Preview
            </p>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={preview}
                alt="Selected image"
                className="w-full max-h-80 object-contain bg-black"
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed px-5 py-3 font-semibold transition"
        >
          {uploading ? `Uploading ${progress}%` : "Upload Image"}
        </button>

        {/* Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Uploaded Image */}
        {imageUrl && (
          <div className="mt-6">

            <p className="text-sm text-gray-400 mb-2">
              Uploaded Image
            </p>

            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full max-h-80 object-contain rounded-2xl border border-white/10 bg-black"
            />

            <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/10 p-4">
              <p className="text-xs text-gray-500 mb-2">
                ImageKit URL
              </p>

              <p className="text-sm text-purple-300 break-all">
                {imageUrl}
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}