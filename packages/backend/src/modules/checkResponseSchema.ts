import { captureException } from '@sentry/node';
import { supabase } from '@utils/supabase';
import { AssertionError, deepStrictEqual } from 'assert';
import { sendEmailWithHtml } from './mailer';
import { prepareHtml } from '@utils/templatesProcessor';
import { Tables } from '@utils/database.types';
import { getIncidentTemplate } from 'src/emails';
import FEATURES from 'src/features';

export async function checkResponseSchema(userId: string, endpointData: Tables<'endpoints'>, responseSchema: any) {
    try {
        const saveSchema = async (oldSchema: any, newSchema: any, saveIncident: boolean = false) => {
            await supabase
                .from('endpoints_response_schema_history')
                .insert({
                    endpoint_id: endpointData.id,
                    schema: responseSchema
                });

            if (saveIncident) {
                await supabase
                    .from('incidents')
                    .insert({
                        endpoint_id: endpointData.id,
                        type: 'SCHEMA_CHANGED',
                        title: 'Response schema changed',
                        details: {
                            oldSchema,
                            newSchema
                        }
                    });
            }
        }

        const latestSchemaResponse = await supabase
            .from('endpoints_response_schema_history')
            .select('*')
            .eq('endpoint_id', endpointData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const latestSchema = latestSchemaResponse.data?.schema;

        if (latestSchema == null) {
            await saveSchema(latestSchema, responseSchema);
            return;
        }

        try {
            deepStrictEqual(latestSchema, responseSchema);
        }
        catch (e: unknown) {
            if (e instanceof AssertionError) {
                await saveSchema(latestSchema, responseSchema, true);

                if (FEATURES.EMAILS) {
                    const userData = await supabase.auth.admin.getUserById(userId);
                    if (userData.data.user?.email) {
                        const template = await getIncidentTemplate();
                        const html = prepareHtml(template, {
                            title: 'Response schema has changed',
                            info: 'Response schema has changed on the',
                            description: 'Please review the updates to ensure compatibility with your integration.',
                            endpointName: endpointData.name,
                            endpointFullUrl: endpointData.full_url,
                            detailsUrl: `${process.env.API200_FRONTEND_URL}/services/${endpointData.service_id}/endpoints/${endpointData.id}`
                        });

                        await sendEmailWithHtml(userData.data.user.email, '[API 200] Response schema has changed!', html);
                    }
                }
            }
        }
    }
    catch (e: any) {
        captureException(e);
    }
}