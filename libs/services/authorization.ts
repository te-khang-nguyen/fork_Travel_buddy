import { supabase } from "../supabase/supabase_client";

export default async function isAuthenticated(token) {
    // Using supabase-js getUser function to validate the token without exposing supbase project secret key
    const { data: { user } } = await supabase.auth.getUser(token);
    
    // If signed in user found for the provided token, signal that the token is valid.
    if(user){
        return {data: user!.id};
    }
};