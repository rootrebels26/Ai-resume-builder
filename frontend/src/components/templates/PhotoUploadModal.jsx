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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border-[1.5px] border-ink text-ink rounded-3xl shadow-brutal-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-ink/10 bg-canvas-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5e48d7]/10 border border-[#5e48d7]/30 flex items-center justify-center text-[#5e48d7]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink tracking-tight">
                Profile Photo Required
              </h2>
              <p className="text-xs text-ink-muted">
                Upload a professional photo to continue with {templateName}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-white">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 border border-rose-300 text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
                  ? 'border-[#5e48d7] bg-[#5e48d7]/10'
                  : 'border-ink/20 bg-canvas-light hover:border-ink hover:bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInput}
              />
              <div className="w-14 h-14 rounded-full bg-white border border-ink/20 shadow-xs flex items-center justify-center text-ink">
                <Upload className="w-6 h-6 text-[#5e48d7]" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">
                  Click to upload or drag & drop photo
                </p>
                <p className="text-xs text-ink-muted mt-1">
                  JPG, JPEG, PNG, or WebP (max 5 MB)
                </p>
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#5e48d7] text-white hover:bg-[#4d3ab8] border border-black shadow-[2px_2px_0_#171713] transition cursor-pointer"
              >
                Select Photo from Computer
              </button>
            </div>
          ) : (
            /* Image Preview & Zoom Slider */
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 bg-canvas-light rounded-2xl border border-ink/10">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#5e48d7] shadow-inner relative flex items-center justify-center bg-white">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-100"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
                <span className="text-[11px] text-ink-muted mt-3">
                  Circular Preview as it will appear on your resume header
                </span>
              </div>

              {/* Zoom & Adjustment Controls */}
              <div className="flex items-center gap-3 px-3 py-2 bg-canvas-light rounded-xl border border-ink/10">
                <ZoomOut className="w-4 h-4 text-ink-muted" />
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#5e48d7]"
                />
                <ZoomIn className="w-4 h-4 text-ink-muted" />
                <span className="text-xs font-mono font-bold text-ink w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Action Buttons: Replace / Remove */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-canvas-light text-ink border border-ink/30 transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-ink-muted" />
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-canvas-light border-t border-ink/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-ink-muted hover:text-ink hover:bg-black/5 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!photoPreview}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition border border-black shadow-[2px_2px_0_#171713] ${
              photoPreview
                ? 'bg-[#5e48d7] hover:bg-[#4d3ab8] text-white cursor-pointer'
                : 'bg-black/10 text-black/40 border-black/20 cursor-not-allowed shadow-none'
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
