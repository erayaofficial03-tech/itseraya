ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS catalogue_whatsapp_message_template text;
UPDATE public.settings
SET catalogue_whatsapp_message_template = 'Hi! Here is the latest *{store_name}* catalogue ✨

Browse the full collection: {url}

The catalogue PDF has been downloaded — please attach it from your files.'
WHERE id = 1 AND catalogue_whatsapp_message_template IS NULL;