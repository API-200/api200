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

alter table public.endpoints_response_schema_history
    enable row level security;

create policy "Endpoints Response Schema History: Select" on public.endpoints_response_schema_history
    for select
    to authenticated
    using (
        exists (
            SELECT 1 FROM public.endpoints e
            JOIN public.services s ON e.service_id = s.id
            WHERE e.id = endpoint_id AND s.user_id = auth.uid()
        )
    );


CREATE OR REPLACE FUNCTION get_route_data(
    p_service_name text,
    p_user_id uuid,
    p_endpoint_name text,
    p_method text
) RETURNS json
    SECURITY DEFINER
    LANGUAGE plpgsql
AS
$$DECLARE
    result json;
BEGIN
SELECT
    json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'base_url', s.base_url,
            'user_id', s.user_id,
            'created_at', s.created_at,
            'updated_at', s.updated_at,
            'auth_type', s.auth_type,
            'auth_enabled', s.auth_enabled,
            'auth_config', s.auth_config,
            'endpoints', json_agg(
                    json_build_object(
                            'id', e.id,
                            'name', e.name,
                            'method', e.method,
                            'full_url', e.full_url,
                            'regex_path', e.regex_path,
                            'created_at', e.created_at,
                            'updated_at', e.updated_at,
                            'cache_enabled', e.cache_enabled,
                            'cache_ttl_s', e.cache_ttl_s,
                            'data_mapping_enabled', e.data_mapping_enabled,
                            'data_mapping_function', e.data_mapping_function,
                            'service_id', e.service_id,
                            'retry_count', e.retry_count,
                            'retry_interval_s', e.retry_interval_s,
                            'mock_enabled', e.mock_enabled,
                            'mock_status_code', e.mock_status_code,
                            'mock_response', e.mock_response,
                            'fallback_response_enabled', e.fallback_response_enabled,
                            'fallback_status_code', e.fallback_status_code,
                            'fallback_response', e.fallback_response,
                            'retry_enabled', e.retry_enabled
                    )
                         )
    ) INTO result
FROM services s
         INNER JOIN endpoints e ON e.service_id = s.id
WHERE s.name = p_service_name
  AND s.user_id = p_user_id
  AND p_endpoint_name ~ e.regex_path
      AND e.method = p_method
GROUP BY s.id;

RETURN result;
END;
$$;
