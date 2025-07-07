
-- Etapa 1: Limpar completamente todas as políticas existentes
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
DROP POLICY IF EXISTS "product_images_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "product_images_delete_policy" ON storage.objects;

-- Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Etapa 2: Criar políticas RLS definitivas com nomes únicos
CREATE POLICY "storage_product_images_insert_authenticated" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
  );

CREATE POLICY "storage_product_images_select_public" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "storage_product_images_update_authenticated" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "storage_product_images_delete_authenticated" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'product-images');

-- Etapa 3: Garantir que o bucket product-images existe e está configurado corretamente
DELETE FROM storage.buckets WHERE id = 'product-images';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);
