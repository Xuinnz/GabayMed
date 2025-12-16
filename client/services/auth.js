import { supabase } from './supabase.js';

class Auth{
    async facilitySignUp (email, password){
        // Hardcoded facility ID as requested
        const facilityId = '2a30a727-e2fe-4115-8168-703f87055a70';

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'staff', // <--- THE CRITICAL FLAG
                    facility_id: facilityId // Link them to their hospital immediately
                }
            }
        });
        if (error) throw error;
        return data;
    }

    async facilityLogin (email, password){
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async getCurrentUser(){
        const {data: { user} } = await supabase.auth.getUser();
        return user;
    }

    async getSession(){
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }
}

export { Auth };