ALTER TABLE public.settings
ADD COLUMN usp_interval_ms integer DEFAULT 3500,
ADD COLUMN usp_fade_speed_ms integer DEFAULT 300;

UPDATE public.settings SET usp_interval_ms = 3500, usp_fade_speed_ms = 300 WHERE id = 1;

ALTER TABLE public.settings ALTER COLUMN usp_interval_ms SET NOT NULL;
ALTER TABLE public.settings ALTER COLUMN usp_fade_speed_ms SET NOT NULL;

COMMENT ON COLUMN public.settings.usp_interval_ms IS 'Milliseconds between USP rotations in status bar';
COMMENT ON COLUMN public.settings.usp_fade_speed_ms IS 'Milliseconds for fade-in animation duration in status bar';