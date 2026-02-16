import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        // 1. Fetch all user preferences (billing info)
        const { data: preferences, error: prefError } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, membership, membership_price, created_at');

        if (prefError) throw prefError;

        // 2. Fetch Auth Users (for names/emails)
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // Create a map of users for quick lookup
        const userMap = users.reduce((acc, user) => {
            acc[user.id] = {
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
                last_sign_in: user.last_sign_in_at
            };
            return acc;
        }, {});

        // 3. Calculate Stats
        let totalSubscribers = 0;
        let mrr = 0;
        let totalRevenue = 0; // Approximate (sum of current plan values)

        const subscribers = preferences.map(pref => {
            const user = userMap[pref.user_id] || { name: 'Unknown', email: 'N/A' };
            const isPremium = ['monthly', 'yearly'].includes(pref.membership);
            const price = Number(pref.membership_price) || 0;

            if (isPremium) {
                totalSubscribers++;
                // Simple MRR calc: Monthly is 100%, Yearly is 1/12th
                if (pref.membership === 'monthly') mrr += price;
                if (pref.membership === 'yearly') mrr += (price / 12);
                totalRevenue += price;
            }

            return {
                id: pref.user_id,
                name: user.name,
                email: user.email,
                plan: pref.membership || 'free',
                status: isPremium ? 'Active' : 'Inactive',
                amount: price,
                cycle: pref.membership === 'yearly' ? '/year' : (pref.membership === 'monthly' ? '/month' : ''),
                startDate: new Date(pref.created_at).toLocaleDateString('en-GB'),
                nextBilling: new Date(new Date(pref.created_at).setMonth(new Date(pref.created_at).getMonth() + 1)).toLocaleDateString('en-GB') // Mock next billing
            };
        });

        // Sort by premium status then by amount desc
        subscribers.sort((a, b) => {
            if (a.status === 'Active' && b.status !== 'Active') return -1;
            if (a.status !== 'Active' && b.status === 'Active') return 1;
            return b.amount - a.amount;
        });

        const stats = {
            total_subscribers: totalSubscribers,
            mrr: mrr,
            arr: mrr * 12,
            active_rate: (totalSubscribers / users.length) * 100 || 0
        };

        return NextResponse.json({ stats, subscribers });

    } catch (error) {
        console.error('Subscriptions API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
