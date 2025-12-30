import React, { useRef, useState } from 'react';
import { Upload, File, X, Eye } from 'lucide-react';
import { validateFile, isImageFile, isPdfFile } from '../../utils/storage';

interface FileUploadFieldProps {
  file: File | null;
  existingFileUrl?: string;
  onFileSelect: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  file,
  existingFileUrl,
  onFileSelect,
  onRemoveExisting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (validation) {
      setError(validation.message);
      onFileSelect(null);
      return;
    }

    setError('');
    onFileSelect(selectedFile);

    if (selectedFile.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('');
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveExisting = () => {
    if (onRemoveExisting) {
      onRemoveExisting();
    }
  };

  const handleViewExisting = () => {
    if (existingFileUrl) {
      window.open(existingFileUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Comprovante (opcional)
      </label>

      {existingFileUrl && !file && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <File className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isImageFile(existingFileUrl) ? 'Imagem anexada' : 'PDF anexado'}
              </p>
              <p className="text-xs text-gray-500">
                {isImageFile(existingFileUrl) ? 'PNG' : 'PDF'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleViewExisting}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Visualizar arquivo"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemoveExisting}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {file ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <File className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type.includes('pdf') ? 'PDF' : 'PNG'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {preview && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-contain bg-gray-50"
              />
            </div>
          )}
        </div>
      ) : !existingFileUrl ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Clique para selecionar</span> ou arraste um arquivo
              </p>
              <p className="text-xs text-gray-500">PNG ou PDF (máx. 5MB)</p>
            </div>
          </label>
        </div>
      ) : null}

      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <X className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
