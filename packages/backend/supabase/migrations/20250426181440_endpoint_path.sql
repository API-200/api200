alter table public.endpoints
add column path text;

create or replace function update_full_url(p_service_id integer)
    returns void
    security definer
    language plpgsql
as
$$
begin
    update public.endpoints e
    set full_url = concat(s.base_url, e.path)
    from public.services s
    where s.id = p_service_id and e.service_id = s.id;
end;
$$;