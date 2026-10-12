'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminBadge,
  AdminEmptyState,
  AdminLoadingState,
  AdminPagination,
} from './components/AdminUI';

const AdminCustomers = () => {
  const { token } = useApp();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetch('/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomers(data.customers);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [token]);

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const addr = c.addresses?.[0];
    const addrStr = addr
      ? `${addr.street} ${addr.city} ${addr.state}`.toLowerCase()
      : '';
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      addrStr.includes(q)
    );
  });

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalCustomerSpend = customers.reduce(
    (sum, c) => sum + (Number(c.totalSpent) || 0),
    0
  );
  const totalCustomerOrders = customers.reduce(
    (sum, c) => sum + (Number(c.orderCount) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Directory"
        subtitle="Registered buyers, lifetime spend metrics, and primary shipping addresses."
        badge={`${customers.length} Registered`}
      />

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <AdminStatCard
          label="Registered Customers"
          value={customers.length}
          icon={Users}
          subtext="Verified Storefront Accounts"
        />
        <AdminStatCard
          label="Customer Orders"
          value={totalCustomerOrders}
          icon={ShoppingBag}
          subtext="Cumulative Orders Placed"
        />
        <AdminStatCard
          label="Lifetime Customer Spend"
          value={`₹${totalCustomerSpend.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          subtext="Total Paid Customer Revenue"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, email, phone, or city..."
            className="w-full min-h-[40px] pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg text-[13px] text-[#111111] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#111111] transition-colors"
          />
        </div>
        <span className="text-xs font-medium text-[#6B7280] hidden sm:inline">
          {filteredCustomers.length} customers
        </span>
      </div>

      {isLoading && customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E5E5]">
          <AdminLoadingState message="Loading customer directory..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#E5E5E5] text-[#6B7280] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Phone</th>
                  <th className="py-3.5 px-5">Orders Placed</th>
                  <th className="py-3.5 px-5">Total Spent</th>
                  <th className="py-3.5 px-5">Primary Address</th>
                  <th className="py-3.5 px-5">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c) => {
                    const addr = c.addresses?.[0];
                    const initial = (c.name || 'C').charAt(0).toUpperCase();
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-[#F5F5F5]/60 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#111111] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[#111111] truncate">
                                {c.name}
                              </p>
                              <p className="text-xs text-[#6B7280] truncate">
                                {c.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#111111] font-medium">
                          {c.phone || '—'}
                        </td>
                        <td className="py-3.5 px-5">
                          <AdminBadge variant="neutral">
                            {c.orderCount} orders
                          </AdminBadge>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#111111]">
                          ₹{c.totalSpent}
                        </td>
                        <td className="py-3.5 px-5 text-[#6B7280] text-xs max-w-xs truncate">
                          {addr
                            ? `${addr.street}, ${addr.city}, ${addr.state}`
                            : 'No address saved'}
                        </td>
                        <td className="py-3.5 px-5 text-[#6B7280] text-xs">
                          {new Date(c.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <AdminEmptyState
                        icon={Users}
                        title="No customers found"
                        description="Customer accounts matching your search query will appear here."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden divide-y divide-[#E5E5E5]">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((c) => {
                const addr = c.addresses?.[0];
                const initial = (c.name || 'C').charAt(0).toUpperCase();
                return (
                  <div key={c.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#111111] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111111] truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-[#6B7280] truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>
                      <AdminBadge variant="neutral">
                        {c.orderCount} orders
                      </AdminBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                          Total Spent
                        </span>
                        <span className="font-bold text-[#111111] text-sm">
                          ₹{c.totalSpent}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                          Phone
                        </span>
                        <span className="font-medium text-[#111111]">
                          {c.phone || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span className="truncate max-w-[65%]">
                        {addr
                          ? `${addr.city}, ${addr.state}`
                          : 'No address saved'}
                      </span>
                      <span>
                        Joined{' '}
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <AdminEmptyState
                icon={Users}
                title="No customers found"
                description="Customer accounts matching your search query will appear here."
              />
            )}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredCustomers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="customers"
          />
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
