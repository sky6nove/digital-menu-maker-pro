
-- Add order column to categories table
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Update existing categories to have sequential ordering
UPDATE public.categories
SET "order" = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
  FROM public.categories
) AS sub
WHERE categories.id = sub.id;
