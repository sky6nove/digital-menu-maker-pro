-- Verificar e corrigir políticas de storage para product-images

-- Primeiro, vamos remover as políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Allow uploads for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own uploads" ON storage.objects;

-- Criar políticas mais permissivas para o bucket product-images
-- Permitir upload para usuários autenticados
CREATE POLICY "Users can upload to product-images bucket" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Permitir acesso público de leitura para todas as imagens
CREATE POLICY "Public read access for product-images" ON storage.objects
FOR SELECT 
USING (bucket_id = 'product-images');

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own product-images" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete their own product-images" ON storage.objects
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Garantir que o bucket product-images existe e é público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Atualizar configurações do bucket para permitir uploads
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'product-images';