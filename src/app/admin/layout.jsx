import AdminLayout from '@/views/admin/AdminLayout';

export const metadata = { title: 'Commerce HQ | Admin Panel — SmoothSelf' };

export default function Layout({ children }) { return <AdminLayout>{children}</AdminLayout>; }