import { NextResponse } from 'next/server';
import { randomBytes, createCipheriv } from "crypto";
import {dropServiceEndpointsCaches} from "../utils";
import { createClient } from '../../../utils/supabase/server';
import { env } from 'next-runtime-env';

const ENCRYPTION_KEY = env('ENCRYPTION_KEY')!;
const IV_LENGTH = 12;

function encrypt(text: string) {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const userId = (await supabase.auth.getUser())?.data?.user?.id

    const body = await req.json();

    try {
        // Encrypt sensitive fields
        const encryptedData: any = { ...body };

        delete encryptedData.mode

        if (body.auth_config?.api_key) {
            encryptedData.auth_config.api_key = encrypt(body.auth_config.api_key);
        }

        if (body.auth_config?.bearer_token) {
            encryptedData.auth_config.bearer_token = encrypt(body.auth_config.bearer_token);
        }

        let result;
        if (body.mode === "create") {
            result = await supabase
                .from("services")
                .insert(encryptedData)
                .select()
                .single();
        } else {
            result = await supabase
                .from("services")
                .update(encryptedData)
                .eq("id", body.id)
                .select()
                .single();
        }

        if (result.error) throw result.error;
        await dropServiceEndpointsCaches(userId!, body.serviceName);
        return NextResponse.json(result.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Encryption failed" },
            { status: 500 }
        );
    }
}
