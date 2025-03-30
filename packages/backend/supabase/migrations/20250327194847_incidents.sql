create table if not exists public.incidents (
    id bigint primary key generated always as identity,
    endpoint_id bigint not null references public.endpoints on update cascade on delete cascade,
    title text not null,
    type text,
    details jsonb not null,
    resolved boolean default false,
    created_at timestamptz default now()
);

alter table public.incidents
    owner to postgres;

alter table public.Incidents
    enable row level security;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to anon;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.incidents to service_role;

create policy "Incidents: Select" on public.incidents
    for select
    to authenticated
    using (
        exists (
            SELECT 1 FROM public.endpoints e
            JOIN public.services s ON e.service_id = s.id
            WHERE e.id = endpoint_id AND s.user_id = auth.uid()
        )
    );

alter table public.logs
    add column created_at timestamptz default now() not null;