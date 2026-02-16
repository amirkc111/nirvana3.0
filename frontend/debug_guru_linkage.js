import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugGuruAuth() {
    console.log('--- Checking Columns in gurus table ---');
    const { data: cols, error: colError } = await supabase.from('gurus').select('*').limit(1);
    if (colError) {
        console.error('Error fetching gurus:', colError);
    } else {
        console.log('Available columns:', Object.keys(cols[0] || {}));
    }

    console.log('\n--- Listing Gurus and their Linkage ---');
    const { data: gurus, error: guruError } = await supabase
        .from('gurus')
        .select('id, name, email, user_id');

    if (guruError) {
        console.error('Error listing gurus:', guruError);
    } else {
        for (const guru of gurus) {
            console.log(`Guru: ${guru.name} | Email: ${guru.email} | UserID: ${guru.user_id}`);
            if (guru.user_id) {
                const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(guru.user_id);
                if (authError) {
                    console.log(`  -> Auth Record: NOT FOUND (${authError.message})`);
                } else {
                    console.log(`  -> Auth Record: FOUND (Email: ${authUser.user.email})`);
                }
            } else {
                console.log('  -> Auth Record: NOT LINKED (user_id is null)');
            }
        }
    }
}

debugGuruAuth();
