import { AddPhotoAlternate as ImageIcon } from '@mui/icons-material';
import { Alert, Box, Paper, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { apiService, getErrorMessage } from '../services/api';

interface ImageUploadResult {
  total: number;
  asignadas: number;
  errores: { archivo: string; motivo: string }[];
}

interface ProductBulkImageUploadProps {
  onSuccess: () => void;
}

export const ProductBulkImageUpload = ({ onSuccess }: ProductBulkImageUploadProps) => {
  const [imageResult, setImageResult] = useState<ImageUploadResult | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleBulkImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    setImageResult(null);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      const data = await apiService.upload<ImageUploadResult>(
        '/uploads/productos/importar',
        formData,
      );
      setImageResult(data);
      if (data.asignadas > 0) onSuccess();
    } catch (e: unknown) {
      alert(`Error al importar imágenes: ${getErrorMessage(e)}`);
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Resultado */}
      {imageResult && (
        <Alert
          severity={imageResult.errores.length === 0 ? 'success' : 'warning'}
          sx={{ mb: 2 }}
          onClose={() => setImageResult(null)}
        >
          <strong>Importación de imágenes:</strong> {imageResult.asignadas} de {imageResult.total}{' '}
          asignadas.
          {imageResult.errores.length > 0 && (
            <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
              {imageResult.errores.map((err, i) => (
                <li key={i}>
                  <strong>{err.archivo}</strong>: {err.motivo}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Drop zone */}
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          p: 3,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
          cursor: uploadingImages ? 'default' : 'pointer',
          opacity: uploadingImages ? 0.7 : 1,
        }}
        onClick={() => !uploadingImages && imageInputRef.current?.click()}
      >
        <input
          ref={imageInputRef}
          hidden
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleBulkImageUpload(e.target.files)}
        />
        <ImageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="subtitle1" color="primary.main">
          {uploadingImages ? 'Subiendo imágenes…' : 'Importar imágenes de productos'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Seleccioná varias imágenes. El nombre del archivo (sin extensión) debe coincidir con el
          nombre del producto.
          <br />
          Ej: <strong>Coca Cola.jpg</strong> → se asigna al producto "Coca Cola"
        </Typography>
      </Paper>
    </Box>
  );
};
