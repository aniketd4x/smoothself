import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Mail, Phone, ShoppingBag, MapPin } from 'lucide-react';

const AdminCustomers = () => {
  const { token } = useApp();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setCustomers(data.customers);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
          Customer Directory
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Registered buyers, lifetime spend metrics, and shipping addresses.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-brand-muted uppercase tracking-wider font-semibold">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Primary Address</th>
                <th className="p-4">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {customers.map((c) => {
                const addr = c.addresses?.[0];
                return (
                  <tr key={c.id} className="hover:bg-brand-surface/40 transition">
                    <td className="p-4">
                      <p className="font-bold text-brand-primary">{c.name}</p>
                      <p className="text-[11px] text-brand-muted">{c.email}</p>
                    </td>
                    <td className="p-4 text-brand-text font-medium">{c.phone || '—'}</td>
                    <td className="p-4 font-bold">{c.orderCount} orders</td>
                    <td className="p-4 font-extrabold text-brand-primary">₹{c.totalSpent}</td>
                    <td className="p-4 text-brand-muted max-w-xs truncate">
                      {addr ? `${addr.street}, ${addr.city}, ${addr.state}` : 'No address saved'}
                    </td>
                    <td className="p-4 text-brand-muted">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
