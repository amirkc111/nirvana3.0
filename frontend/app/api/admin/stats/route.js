import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET(request) {
    try {
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Supabase Admin not configured' }, { status: 500 });
        }

        // 1. Fetch total users from Auth
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        if (userError) throw userError;

        const totalUsersCount = users.length;

        // 2. Fetch Membership Data from user_preferences
        const { data: preferences, error: prefError } = await supabaseAdmin
            .from('user_preferences')
            .select('user_id, zodiac_sign_english, membership, membership_price');

        const prefMap = {};
        let totalRevenue = 0;
        let premiumCount = 0;

        if (preferences) {
            preferences.forEach(p => {
                prefMap[p.user_id] = p;
                if (p.membership === 'monthly' || p.membership === 'yearly') {
                    premiumCount++;
                }
                totalRevenue += Number(p.membership_price || 0);
            });
        }

        // 3. Simple growth calculation (compare users created in last 7 days vs total)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersCount = users.filter(u => new Date(u.created_at) > sevenDaysAgo).length;

        const growthTrend = totalUsersCount > 0
            ? ((newUsersCount / totalUsersCount) * 100).toFixed(1) + '%'
            : '0%';

        // 4. Activity Mock (Can be based on kundli_records/data inserts if we query those)
        const { count: recordsCount, error: recordsError } = await supabaseAdmin
            .from('kundli_records')
            .select('*', { count: 'exact', head: true });

        // Fallback to kundli_data if recordsCount is null/error
        let totalRecords = recordsCount || 0;
        if (recordsError) {
            const { count: dataCount } = await supabaseAdmin
                .from('kundli_data')
                .select('*', { count: 'exact', head: true });
            totalRecords = dataCount || 0;
        }

        // 5. Dynamic Growth Data based on Period
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'monthly';

        // Fetch all appointments for charting
        const { data: allAppointments } = await supabaseAdmin
            .from('appointments')
            .select('created_at');

        let growthData = [];
        let servicesData = [];

        if (period === 'weekly') {
            // Last 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dayName = days[d.getDay()];

                const userCount = users.filter(u => {
                    const created = new Date(u.created_at);
                    return created.getDate() === d.getDate() &&
                        created.getMonth() === d.getMonth() &&
                        created.getFullYear() === d.getFullYear();
                }).length;

                const apptCount = (allAppointments || []).filter(a => {
                    const created = new Date(a.created_at);
                    return created.getDate() === d.getDate() &&
                        created.getMonth() === d.getMonth() &&
                        created.getFullYear() === d.getFullYear();
                }).length;

                growthData.push({ day: dayName, value: userCount });
                servicesData.push({ day: dayName, value: apptCount });
            }
        } else {
            // Last 4 units
            for (let i = 3; i >= 0; i--) {
                const start = new Date();
                start.setDate(start.getDate() - (i + 1) * 7);
                const end = new Date();
                end.setDate(end.getDate() - i * 7);

                const userCount = users.filter(u => {
                    const created = new Date(u.created_at);
                    return created >= start && created < end;
                }).length;

                const apptCount = (allAppointments || []).filter(a => {
                    const created = new Date(a.created_at);
                    return created >= start && created < end;
                }).length;

                growthData.push({ day: `Week ${4 - i}`, value: userCount });
                servicesData.push({ day: `Week ${4 - i}`, value: apptCount });
            }
        }

        // 6. Fetch Recent Users (Top 5)
        const sortedUsers = [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        const recentUsers = sortedUsers.map(u => {
            const pref = prefMap[u.id] || {};
            return {
                id: u.id,
                name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Unknown',
                email: u.email,
                zodiac: pref.zodiac_sign_english || 'N/A',
                status: pref.membership === 'monthly' || pref.membership === 'yearly' ? 'Premium' : 'Free'
            };
        });

        // 7. Fetch Recent Appointments (Top 5)
        const { data: recentAppointments } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: [
                { name: 'Total Revenue', value: `€${totalRevenue.toFixed(2)}`, trend: '0%', icon: 'FiDollarSign', color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Active Clients', value: totalUsersCount.toString(), trend: `0%`, icon: 'FiUsers', color: 'text-gray-600', bg: 'bg-gray-100' },
                { name: 'Total Charts', value: totalRecords.toString(), trend: '0%', icon: 'FiActivity', color: 'text-green-600', bg: 'bg-green-50' },
                { name: 'Conversion', value: totalUsersCount > 0 ? ((premiumCount / totalUsersCount) * 100).toFixed(1) + '%' : '0%', trend: '0%', icon: 'FiTrendingUp', color: 'text-purple-600', bg: 'bg-purple-50' },
            ],
            charts: {
                growth: growthData,
                services: servicesData,
                deviceUsage: []
            },
            recentUsers,
            recentAppointments: recentAppointments || []
        });
    } catch (error) {
        console.error('Admin Stats API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
