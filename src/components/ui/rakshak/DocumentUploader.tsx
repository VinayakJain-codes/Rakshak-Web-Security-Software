import React from 'react';

interface DocumentUploaderProps {
  label: string;
  description: string;
  acceptedTypes?: string;
  required?: boolean;
}

export function DocumentUploader({ label, description, acceptedTypes = ".pdf,.jpg,.png", required }: DocumentUploaderProps) {
  return (
    <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
      <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="material-symbols-outlined text-[24px]">upload_file</span>
      </div>
      <h4 className="font-bold text-sm text-on-surface flex justify-center items-center gap-1">
        {label}
        {required && <span className="text-error">*</span>}
      </h4>
      <p className="text-xs text-on-surface-variant mt-1 mb-4 max-w-xs mx-auto font-label">
        {description}
      </p>
      
      <label className="bg-surface-container border border-outline-variant text-on-surface font-bold text-xs px-4 py-2 rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors inline-block">
        Browse Files
        <input type="file" className="hidden" accept={acceptedTypes} />
      </label>
      <div className="text-[10px] text-on-surface-variant font-mono mt-2">
        Accepted: {acceptedTypes} (Max 5MB)
      </div>
    </div>
  );
}
