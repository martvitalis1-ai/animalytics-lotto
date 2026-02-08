import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, Image, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AdminImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load current image on mount
  useEffect(() => {
    loadCurrentImage();
  }, []);

  const loadCurrentImage = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .storage
        .from('roulette-maps')
        .list('', { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

      if (data && data.length > 0) {
        const { data: urlData } = supabase
          .storage
          .from('roulette-maps')
          .getPublicUrl(data[0].name);
        
        setCurrentImageUrl(urlData.publicUrl);
      } else {
        setCurrentImageUrl(null);
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 5MB');
      return;
    }

    setUploading(true);
    try {
      // Delete existing images first
      const { data: existingFiles } = await supabase
        .storage
        .from('roulette-maps')
        .list();

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => f.name);
        await supabase.storage.from('roulette-maps').remove(filesToDelete);
      }

      // Upload new image with unique name
      const fileName = `map-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase
        .storage
        .from('roulette-maps')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('roulette-maps')
        .getPublicUrl(fileName);

      setCurrentImageUrl(urlData.publicUrl);
      toast.success('¡Mapa de datos cargado exitosamente!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir imagen');
    }
    setUploading(false);
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    try {
      const { data: existingFiles } = await supabase
        .storage
        .from('roulette-maps')
        .list();

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => f.name);
        await supabase.storage.from('roulette-maps').remove(filesToDelete);
      }

      setCurrentImageUrl(null);
      toast.success('Mapa eliminado');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar imagen');
    }
    setDeleting(false);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Image className="w-5 h-5 text-primary" />
          Gestión Visual - Mapa de Ruleta
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>
          <Button
            variant="outline"
            disabled={uploading}
            className="shrink-0"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="ml-2">Subir Mapa</span>
          </Button>
        </div>

        {/* Current Image Preview */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : currentImageUrl ? (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary/30">
              <img 
                src={currentImageUrl} 
                alt="Mapa de Ruleta Actual" 
                className="w-full h-auto max-h-64 object-contain bg-muted/50"
              />
              <div className="absolute top-2 right-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  <Check className="w-3 h-3" />
                  Activo
                </span>
              </div>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar Mapa Actual
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay mapa cargado</p>
            <p className="text-xs">Sube una imagen para mostrarla en la sección Ruleta</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          El mapa se mostrará debajo de la Ruleta Universal. Formato recomendado: JPG/PNG, máx 5MB.
        </p>
      </CardContent>
    </Card>
  );
}
