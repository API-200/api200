ALTER TABLE public.endpoints
ADD COLUMN custom_headers_enabled boolean,
ADD COLUMN custom_headers jsonb;
