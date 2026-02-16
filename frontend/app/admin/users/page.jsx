import UserTable from '@/components/admin/UserTable';

export const metadata = {
    title: 'Clients | Nirvana 3.0 Admin',
    description: 'Manage your client database and subscriptions',
};

export default function UsersPage() {
    return (
        <UserTable />
    );
}
