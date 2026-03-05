-- Add CTA button settings and owner notification customization to order_forms
ALTER TABLE order_forms
  ADD COLUMN IF NOT EXISTS cta_button jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notify_email_subject text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notify_email_body text DEFAULT NULL;
