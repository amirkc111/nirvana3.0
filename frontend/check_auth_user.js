import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrphanedAuth() {
    const email = 'bishwa@nirvanaastro.com';
    console.log(`--- Checking Auth User for: ${email} ---`);

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing auth users:', authError);
    } else {
        const user = users.find(u => u.email === email);
        if (user) {
            console.log(`Auth Record FOUND: ID = ${user.id}`);
        } else {
            console.log('Auth Record NOT FOUND in auth.users');
        }
    }
}

checkOrphanedAuth();
