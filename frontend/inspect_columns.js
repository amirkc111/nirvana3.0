import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'gurus' });

    if (error) {
        // If RPC doesn't exist, try a simple select
        console.log('RPC failed, trying simple select...');
        const { data: selectData, error: selectError } = await supabase
            .from('gurus')
            .select('*')
            .limit(1);

        if (selectError) {
            console.error('Error selecting from gurus:', selectError);
        } else {
            console.log('Columns found via SELECT:', Object.keys(selectData[0] || {}));
        }
    } else {
        console.log('Columns found via RPC:', data);
    }
}

inspectTable();
