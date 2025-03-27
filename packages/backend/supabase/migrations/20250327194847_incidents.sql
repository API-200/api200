create table if not exists public.incidents (
    id bigint primary key generated always as identity,
    endpoint_id bigint not null references public.endpoints on update cascade on delete cascade,
    title text not null,
    type text,
    details jsonb not null,
    handled boolean default false,
    created_at timestamptz default now()
);

alter table public.incidents
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to anon;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to service_role;