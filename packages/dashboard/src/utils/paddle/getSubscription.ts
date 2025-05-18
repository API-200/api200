import {createClient} from "@/utils/supabase/server";

export async function getSubscription() {
    // Create a Supabase client
    const supabase = await createClient()

    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // If no user is found, return null
    if (!user) {
        return null;
    }

    // First get the customer that matches the user's email
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single();

    // If no customer is found, return null
    if (!customer) {
        return null;
    }

    // Get the subscription for this customer
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .maybeSingle();

    // If no subscription is found, return null
    if (!subscription) {
        return null;
    }

    // Return the subscription with the customer data
    return {
        ...subscription,
        customer,
    };
}
