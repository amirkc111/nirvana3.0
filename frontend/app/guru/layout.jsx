import GuruLayout from '@/components/guru/GuruLayout';

export const metadata = {
    title: 'Guru Portal | Nirvana 3.0',
    description: 'Specialized dashboard for Vedic Consultants',
};

export default function Layout({ children }) {
    return (
        <GuruLayout>
            {children}
        </GuruLayout>
    );
}
