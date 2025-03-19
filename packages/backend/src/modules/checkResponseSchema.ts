import { captureException } from '@sentry/node';
import { supabase } from '@utils/supabase';
import { AssertionError, deepStrictEqual } from 'assert';

export async function checkResponseSchema(endpointId: number, responseSchema: any) {
    try {
        const saveSchema = async () => {
            await supabase
                .from('endpoints_response_schema_history')
                .insert({
                    endpoint_id: endpointId,
                    schema: responseSchema
                });
        }

        const latestSchemaResponse = await supabase
            .from('endpoints_response_schema_history')
            .select('*')
            .eq('endpoint_id', endpointId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const latestSchema = latestSchemaResponse.data?.schema;

        if (latestSchema == null) {
            await saveSchema();
            return;
        }

        try {
            deepStrictEqual(latestSchema, responseSchema);
        }
        catch (e: unknown) {
            if (e instanceof AssertionError) {
                await saveSchema();
                // TODO: notify
            }
        }
    }
    catch (e: any) {
        captureException(e);
    }
}