
-- Primeiro, limpar todas as políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their images" ON storage.objects;

-- Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para INSERT (upload) - mais permissiva
CREATE POLICY "Enable insert for authenticated users on product-images" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

-- Política para SELECT (visualizar) - pública
CREATE POLICY "Enable read access for all users on product-images" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'product-images');

-- Política para UPDATE - usuários autenticados
CREATE POLICY "Enable update for authenticated users on product-images" ON storage.objects
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

-- Política para DELETE - usuários autenticados
CREATE POLICY "Enable delete for authenticated users on product-images" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

-- Atualizar configuração do bucket
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
WHERE id = 'product-images';

-- Se o bucket não existir, criar ele
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, 
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
