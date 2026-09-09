import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  FolderDown,
  Info,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SlotInfo {
  key: 'hero' | 'spray' | 'pour' | 'accessories' | 'kitchen';
  title: string;
  subtitle: string;
  filename: string;
  previewUrl: string;
  description: string;
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({ isOpen, onClose }) => {
  const { images, refreshAll } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, { file: File; base64: string }>>({});

  const batchInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const slots: SlotInfo[] = [
    {
      key: 'hero',
      title: '1. Main Hero Visual',
      subtitle: 'Primary Showcase & Box',
      filename: 'hero.jpg',
      previewUrl: images.find((i) => i.isMain)?.url || images[0]?.url || '/images/hero.jpg',
      description: 'The front-facing high resolution showcase of the oil dispenser bottle and packaging.',
    },
    {
      key: 'spray',
      title: '2. Fine Mist Spray',
      subtitle: 'Uniform Atomized Misting',
      filename: 'spray.jpg',
      previewUrl: images[1]?.url || '/images/spray.jpg',
      description: 'Quick-press action demonstrating the ultra-fine, even atomized mist over ingredients.',
    },
    {
      key: 'pour',
      title: '3. Smooth Pour Stream',
      subtitle: 'Drip-Free Pouring Action',
      filename: 'pour.jpg',
      previewUrl: images[2]?.url || '/images/pour.jpg',
      description: 'Tilting the bottle to pour a smooth, steady stream into skillets or cookware.',
    },
    {
      key: 'accessories',
      title: '4. Accessories & Kit',
      subtitle: 'Brushes & Retail Box',
      filename: 'accessories.jpg',
      previewUrl: images[3]?.url || '/images/accessories.jpg',
      description: 'Full culinary kit displaying cleaning brushes, silicone basting brush, and retail package.',
    },
    {
      key: 'kitchen',
      title: '5. Dual Action / Countertop',
      subtitle: 'Dual Top Spout & Lifestyle',
      filename: 'kitchen.jpg',
      previewUrl: images[4]?.url || '/images/kitchen.jpg',
      description: 'Closeup of dual spray/pour mechanism or dispenser resting in modern kitchen setting.',
    },
  ];

  const handleSingleSlotChange = (slotKey: 'hero' | 'spray' | 'pour' | 'accessories' | 'kitchen', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLocalPreviews((prev) => ({ ...prev, [slotKey]: base64 }));
      setPendingFiles((prev) => ({ ...prev, [slotKey]: { file, base64 } }));
    };
    reader.readAsDataURL(file);
  };

  const handleBatchFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList: File[] = Array.from(e.target.files);
    const slotKeys: Array<'hero' | 'spray' | 'pour' | 'accessories' | 'kitchen'> = [
      'hero',
      'spray',
      'pour',
      'accessories',
      'kitchen',
    ];

    fileList.slice(0, 5).forEach((file: File, index: number) => {
      const key = slotKeys[index];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setLocalPreviews((prev) => ({ ...prev, [key]: base64 }));
        setPendingFiles((prev) => ({ ...prev, [key]: { file, base64 } }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveAll = async () => {
    const keys = Object.keys(pendingFiles);
    if (keys.length === 0) {
      setErrorMessage('Please select at least one real photo to replace.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const uploadList = keys.map((key) => ({
        base64Data: pendingFiles[key].base64,
        filename: pendingFiles[key].file.name,
        targetSlot: key,
      }));

      await api.uploadBatchImages(uploadList);
      await refreshAll();

      setPendingFiles({});
      setSuccessMessage(`Successfully updated ${keys.length} product photos with your real images!`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save uploaded photos. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#151515] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="font-display text-2xl font-normal text-[#EAEAEA]">
                Replace AI Placeholders with Real Photos
              </h2>
            </div>
            <p className="text-xs text-white/60 font-light max-w-2xl">
              Upload your 5 real product photographs to instantly replace the default visual assets across the entire
              storefront, interactive gallery, and checkout experience.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Guidance Box */}
        <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-start gap-3 text-xs text-white/70">
          <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-white">Quick 1-Click Replacement:</p>
            <p className="text-white/60">
              You can click <strong>"Select All 5 Photos At Once"</strong> below, or click any individual photo slot to
              assign each perspective. Once selected, click <strong>"Apply Real Photos"</strong> to update the live site
              permanently.
            </p>
          </div>
        </div>

        {/* Global Batch Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#181818] border border-white/10">
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={batchInputRef}
              multiple
              accept="image/*"
              onChange={handleBatchFileSelection}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => batchInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select All 5 Photos At Once</span>
            </button>
            <span className="text-xs text-white/50 hidden sm:inline">
              (Auto-assigns in order to Slots 1 through 5)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {Object.keys(pendingFiles).length > 0 && (
              <span className="text-xs text-[#D4AF37] font-medium">
                {Object.keys(pendingFiles).length} photo{Object.keys(pendingFiles).length > 1 ? 's' : ''} staged
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSubmitting || Object.keys(pendingFiles).length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Real Photos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 5 Distinct Perspective Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => {
            const currentPreview = localPreviews[slot.key] || slot.previewUrl;
            const isPending = !!pendingFiles[slot.key];

            return (
              <div
                key={slot.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isPending ? 'bg-[#1E1E1E] border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30' : 'bg-[#181818] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-white tracking-wide">{slot.title}</span>
                  {isPending ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#D4AF37] text-black">
                      Ready to Apply
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/40">{slot.filename}</span>
                  )}
                </div>

                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 mb-3 group">
                  <img
                    src={currentPreview}
                    alt={slot.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-2"
                  />

                  {/* Hover upload trigger overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity cursor-pointer p-4 text-center">
                    <UploadCloud className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-xs font-medium text-white">Click to Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSingleSlotChange(slot.key, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-white/80">{slot.subtitle}</p>
                  <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{slot.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D4AF37] hover:text-[#E5C158] cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isPending ? 'Change Photo' : 'Upload Real Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleSingleSlotChange(slot.key, e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingFiles((prev) => {
                          const copy = { ...prev };
                          delete copy[slot.key];
                          return copy;
                        });
                        setLocalPreviews((prev) => {
                          const copy = { ...prev };
                          delete copy[slot.key];
                          return copy;
                        });
                      }}
                      className="text-[10px] text-white/40 hover:text-red-400 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alternative Tip for File Explorer */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3 text-xs text-white/50">
          <FolderDown className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white/80">Alternative: Direct File Explorer Upload</span>
            <p>
              In Google AI Studio's left sidebar, open the <strong>File Explorer</strong>, navigate to{' '}
              <code className="text-[#D4AF37] bg-white/5 px-1 py-0.5 rounded">public/images/</code>, and drag-and-drop
              your photos directly, named{' '}
              <code className="text-white/70">hero.jpg, spray.jpg, pour.jpg, accessories.jpg, kitchen.jpg</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
