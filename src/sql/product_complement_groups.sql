
-- Create a table to store product complement group relationships
CREATE TABLE IF NOT EXISTS public.product_complement_groups (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(id),
  complement_group_id INTEGER NOT NULL REFERENCES public.complement_groups(id),
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_product_complement_groups_product_id ON public.product_complement_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_complement_groups_complement_group_id ON public.product_complement_groups(complement_group_id);
