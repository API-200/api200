ALTER TABLE public.endpoints
ADD COLUMN custom_headers_enabled boolean,
ADD COLUMN custom_headers jsonb;

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
                            'retry_enabled', e.retry_enabled,
                            'custom_headers_enabled', e.custom_headers_enabled,
                            'custom_headers', e.custom_headers
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

alter function get_route_data(text, uuid, text, text) owner to postgres;

grant execute on function get_route_data(text, uuid, text,text) to anon;

grant execute on function get_route_data(text, uuid, text,text) to authenticated;

grant execute on function get_route_data(text, uuid, text,text) to service_role;
