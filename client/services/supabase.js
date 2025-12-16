import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key]; //Vite
    }
    return '';
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey){
    console.error("Supabase keys are missing! Check your env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

