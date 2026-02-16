import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAppointments() {
    console.log('--- Checking Guros ---');
    const { data: gurus, error: gError } = await supabase.from('gurus').select('id, name, user_id');
    if (gError) console.error(gError);
    else console.table(gurus);

    console.log('\n--- Checking Appointments ---');
    const { data: appointments, error: aError } = await supabase.from('appointments').select('*');
    if (aError) console.error(aError);
    else {
        console.log(`Found ${appointments.length} appointments`);
        console.table(appointments.map(a => ({
            id: a.id,
            guru_id: a.guru_id,
            client_name: a.client_name,
            status: a.status,
            date: a.appointment_date
        })));
    }
}

debugAppointments();
