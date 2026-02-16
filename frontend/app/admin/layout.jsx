import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
    title: 'Admin Panel | Nirvana 3.0',
    description: 'Polished CRM and Client Management System',
};

export default function Layout({ children }) {
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
