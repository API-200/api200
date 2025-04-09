alter table public.services
  add column if not exists is_mcp_enabled boolean default false;