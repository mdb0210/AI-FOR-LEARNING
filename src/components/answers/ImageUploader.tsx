import React, { useState, useRef } from 'react';
import { Image, Upload, X, Eye, FileText, Camera, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  onImageUploaded: (imageDataUrl: string, description: string) => void;
  initialImageDataUrl?: string;
  initialDescription?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  initialImageDataUrl = '',
  initialDescription = '',
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageDataUrl);
  const [description, setDescription] = useState<string>(initialDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        onImageUploaded(result, description);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleDiagram = () => {
    const sampleDiagramSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="100%" height="100%" fill="%230f172a"/><text x="30" y="40" fill="%2338bdf8" font-size="18" font-family="sans-serif" font-weight="bold">RELATIONAL 2NF DECOMPOSITION DIAGRAM</text><rect x="30" y="70" width="220" height="120" rx="8" fill="%231e293b" stroke="%23f43f5e" stroke-width="2"/><text x="45" y="100" fill="%23fda4af" font-size="14" font-weight="bold" font-family="sans-serif">Unnormalized Table</text><text x="45" y="125" fill="white" font-size="12" font-family="sans-serif">StudentID* (PK part)</text><text x="45" y="145" fill="white" font-size="12" font-family="sans-serif">CourseID* (PK part)</text><text x="45" y="165" fill="%23f87171" font-size="12" font-family="sans-serif">CourseFee (Partial Dep!)</text><path d="M 260 130 L 320 130" stroke="%2394a3b8" stroke-width="2" marker-end="url(%23arr)"/><rect x="330" y="60" width="230" height="80" rx="8" fill="%231e293b" stroke="%2310b981" stroke-width="2"/><text x="345" y="85" fill="%236ee7b7" font-size="13" font-weight="bold" font-family="sans-serif">Table 1: Courses (2NF)</text><text x="345" y="105" fill="white" font-size="12" font-family="sans-serif">CourseID* (PK)</text><text x="345" y="125" fill="white" font-size="12" font-family="sans-serif">CourseFee</text><rect x="330" y="160" width="230" height="80" rx="8" fill="%231e293b" stroke="%2310b981" stroke-width="2"/><text x="345" y="185" fill="%236ee7b7" font-size="13" font-weight="bold" font-family="sans-serif">Table 2: Enrollment (2NF)</text><text x="345" y="205" fill="white" font-size="12" font-family="sans-serif">StudentID* (PK)</text><text x="345" y="225" fill="white" font-size="12" font-family="sans-serif">CourseID* (FK to Courses)</text></svg>`;
    setImageUrl(sampleDiagramSvg);
    const sampleDesc = 'ER / Schema decomposition diagram demonstrating removal of partial dependency from composite key relation into two 2NF tables.';
    setDescription(sampleDesc);
    onImageUploaded(sampleDiagramSvg, sampleDesc);
  };

  const removeImage = () => {
    setImageUrl('');
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageUploaded('', '');
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Visual / Handwritten Answer</h4>
            <p className="text-xs text-slate-400">Upload diagrams, handwritten calculations, or flowcharts</p>
          </div>
        </div>

        {!imageUrl && (
          <button
            type="button"
            onClick={handleUseSampleDiagram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Diagram</span>
          </button>
        )}
      </div>

      {imageUrl ? (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 group flex justify-center">
            <img
              src={imageUrl}
              alt="Answer upload preview"
              className="max-h-72 object-contain rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/90 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Diagram / Handwritten Description for OCR & Vision Reasoning */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Diagram Annotation / Explanation
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                onImageUploaded(imageUrl, e.target.value);
              }}
              placeholder="Add details about your diagram or handwritten steps..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer flex flex-col items-center justify-center p-8 rounded-xl bg-slate-950/70 border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-slate-950 transition-all text-center space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Click to Upload Image or Photo</p>
            <p className="text-xs text-slate-500">Supports PNG, JPG, SVG, diagrams, and handwritten work</p>
          </div>
        </div>
      )}
    </div>
  );
};
