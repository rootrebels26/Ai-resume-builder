import React, { useState, useRef } from 'react';
import { Upload, X, Camera, ZoomIn, ZoomOut, RotateCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Professional Photo Upload & Crop Modal
 * Handles drag-and-drop, format validation (JPG, JPEG, PNG, WebP up to 5MB),
 * live zoom scaling, and exports a high-quality base64 image into resumeData.personalInfo.photo.
 */
export function PhotoUploadModal({
  isOpen,
  onClose,
  onConfirm,
  currentPhoto = null,
  templateName = 'Selected Template',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(currentPhoto);
  const [zoom, setZoom] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndProcessFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please upload a valid image (JPG, PNG, or WebP).');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
      setZoom(1);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setZoom(1);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    if (!photoPreview) {
      setErrorMsg('Please upload a photo before continuing.');
      return;
    }
    onConfirm(photoPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                This template requires a profile photo.
              </h2>
              <p className="text-xs text-slate-400">
                Upload a professional photo to continue with {templateName}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!photoPreview ? (
            /* Drag and drop upload area */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Upload className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Click to upload or drag & drop photo
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, JPEG, PNG, or WebP (max 5 MB)
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition shadow-sm"
              >
                Select Photo from Computer
              </button>
            </div>
          ) : (
            /* Image Preview & Zoom Slider */
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-violet-500/50 shadow-inner relative flex items-center justify-center bg-slate-900">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-3">
                  Circular Preview as it will appear on your resume header
                </span>
              </div>

              {/* Zoom & Adjustment Controls */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-800">
                <ZoomOut className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <ZoomIn className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-300 w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons: Replace / Remove */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Replace Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!photoPreview}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition shadow-lg ${
              photoPreview
                ? 'bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-violet-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm and Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
