import { Tables } from '@/utils/supabase/database.types';

export type EnhancedIncident = Tables<"incidents"> & { endpoint: Tables<"endpoints"> & { service: Tables<"services"> } }