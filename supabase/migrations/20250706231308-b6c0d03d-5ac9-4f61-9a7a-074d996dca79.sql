
-- Primeiro, limpar todas as políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their images" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users on product-images" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users on product-images" ON storage.objects;

-- Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS corretas e específicas para o bucket product-images
CREATE POLICY "product_images_insert_policy" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "product_images_select_policy" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_update_policy" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "product_images_delete_policy" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

-- Atualizar configuração do bucket com todos os parâmetros necessários
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/svg+xml']
WHERE id = 'product-images';

-- Garantir que o bucket existe com a configuração correta
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
