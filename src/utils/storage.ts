import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'expense-receipts';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'application/pdf'];

export interface FileValidationError {
  type: 'size' | 'format';
  message: string;
}

export const validateFile = (file: File): FileValidationError | null => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'size',
      message: 'O arquivo deve ter no máximo 5MB'
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      type: 'format',
      message: 'Apenas arquivos PNG e PDF são permitidos'
    };
  }

  return null;
};

export const uploadReceipt = async (file: File, userId: string): Promise<string> => {
  const validation = validateFile(file);
  if (validation) {
    throw new Error(validation.message);
  }

  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const deleteReceipt = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME);

    if (bucketIndex === -1) {
      throw new Error('URL inválida');
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar arquivo:', error.message);
    }
  } catch (error) {
    console.error('Erro ao processar URL do arquivo:', error);
  }
};

export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    return 'arquivo';
  }
};

export const isImageFile = (url: string): boolean => {
  return url.toLowerCase().endsWith('.png');
};

export const isPdfFile = (url: string): boolean => {
  return url.toLowerCase().endsWith('.pdf');
};
