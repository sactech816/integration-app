-- Add design customization columns to order_forms
ALTER TABLE order_forms
  ADD COLUMN IF NOT EXISTS design_layout TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS design_color TEXT DEFAULT 'emerald';
