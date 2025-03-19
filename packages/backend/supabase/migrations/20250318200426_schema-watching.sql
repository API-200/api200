create table if not exists public.endpoints_response_schema_history (
    id bigint primary key generated always as identity,
    endpoint_id bigint not null references public.endpoints on update cascade on delete cascade,
    schema jsonb default null,
    created_at timestamptz default now()    
);

alter table public.endpoints_response_schema_history
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on public.endpoints_response_schema_history to anon;

grant delete, insert, references, select, trigger, truncate, update on public.endpoints_response_schema_history to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.endpoints_response_schema_history to service_role;