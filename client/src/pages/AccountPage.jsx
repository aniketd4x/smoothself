import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Package, MapPin, LogOut, Plus, Trash2, CheckCircle2, ShieldCheck, Lock, Mail, Key, Eye, EyeOff, Phone } from 'lucide-react';

const AccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, loginUser, logoutUser, updateUser, showToast } = useApp();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || (user ? 'orders' : 'login'));
  const [authMode, setAuthMode] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // Register form state
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile and security form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Orders and addresses state
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    apartment: '',
    city: '',
    state: 'Karnataka',
    postalCode: ''
  });

  // Fetch customer orders from Supabase if logged in
  useEffect(() => {
    if (user && token) {
      fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch(err => {
          console.error('Failed to load orders from Supabase:', err);
        });
    }
  }, [user, token]);

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Handle customer profile, email, and password update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!token && !user) return;

    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        showToast('New password and confirm password do not match', 'error');
        return;
      }
      if (!profileForm.currentPassword) {
        showToast('Please enter your current password to set a new password', 'error');
        return;
      }
    }

    setIsUpdatingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim().toLowerCase(),
        phone: profileForm.phone ? profileForm.phone.trim() : '',
      };
      if (profileForm.newPassword) {
        payload.password = profileForm.newPassword;
        payload.currentPassword = profileForm.currentPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();

      if (res.ok && resData.success) {
        updateUser(resData.user, resData.token);
        setProfileForm(prev => ({
          ...prev,
          name: resData.user.name,
          email: resData.user.email,
          phone: resData.user.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        showToast('Profile and credentials updated successfully!');
      } else {
        showToast(resData.message || 'Failed to update credentials', 'error');
      }
    } catch (err) {
      showToast('Error updating profile: ' + err.message, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        loginUser(data.user, data.token);
        setActiveTab('orders');
      } else {
        showToast(data.message || 'Invalid email or password', 'error');
      }
    } catch (err) {
      showToast('Login failed. Please check your connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        loginUser(data.user, data.token);
        showToast('Account created successfully! Welcome to SmoothSelf.');
        setActiveTab('orders');
      } else {
        showToast(data.message || 'Could not register', 'error');
      }
    } catch (err) {
      showToast('Could not register account. Please check your details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        if (user) {
          updateUser({ ...user, addresses: data.addresses }, token);
        }
        setShowAddressForm(false);
        showToast('Address saved successfully!');
      } else {
        showToast(data.message || 'Failed to save address', 'error');
      }
    } catch {
      showToast('Error saving address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses(data.addresses);
        if (user) {
          updateUser({ ...user, addresses: data.addresses }, token);
        }
        showToast('Address removed', 'info');
      } else {
        showToast(data.message || 'Failed to remove address', 'error');
      }
    } catch {
      showToast('Error deleting address', 'error');
    }
  };

  // If not logged in, show Auth form (Login / Register)
  if (!user) {
    return (
      <div className="w-full bg-brand-surface/40 py-16 md:py-20 min-h-[75vh] flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-brand-border shadow-sm">
          
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary">
              {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h1>
            <p className="text-xs text-brand-muted mt-2">
              {authMode === 'login'
                ? 'Sign in to view orders, saved addresses, and faster checkout.'
                : 'Join SmoothSelf to receive exclusive member gifts and track orders.'}
            </p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="e.g. customer@aurabotanica.com"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center pt-4 border-t border-brand-border text-xs text-brand-muted">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-brand-primary hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g. Ananya Deshmukh"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="e.g. ananya@example.com"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">Password (Min 6 Characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center pt-4 border-t border-brand-border text-xs text-brand-muted">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-brand-primary hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Logged-in Customer Dashboard
  return (
    <div className="w-full bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Account Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-brand-border gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Customer Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary mt-1">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-brand-muted">{user.email} • {user.phone || 'No phone set'}</p>
          </div>

          <button
            onClick={logoutUser}
            className="inline-flex items-center space-x-1.5 px-4 py-2 border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-red-50 hover:text-red-600 transition self-start sm:self-auto"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Tabs (Orders vs Addresses vs Profile & Security) */}
        <div className="flex space-x-4 border-b border-brand-border mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'orders'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'addresses'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* TAB 1: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length > 0 ? (
              orders.map((ord) => (
                <div key={ord._id} className="p-6 rounded-xl border border-brand-border bg-brand-surface/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border/60 gap-2">
                    <div>
                      <span className="text-xs text-brand-muted">Order ID: </span>
                      <strong className="text-sm font-mono text-brand-primary">{ord.orderNumber}</strong>
                      <span className="block text-[11px] text-brand-muted mt-0.5">
                        Placed on {new Date(ord.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-brand-primary'
                      }`}>
                        {ord.orderStatus}
                      </span>
                      <span className="text-sm font-extrabold text-brand-primary">₹{ord.totalAmount}</span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="divide-y divide-brand-border/40">
                    {ord.orderItems?.map((it, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={it.image} alt="" className="w-10 h-12 object-cover rounded bg-white border border-brand-border" />
                          <div>
                            <p className="font-semibold text-brand-text">{it.name}</p>
                            <p className="text-[11px] text-brand-muted">Qty: {it.quantity} • {it.variantTitle}</p>
                          </div>
                        </div>
                        <span className="font-bold text-brand-primary">₹{it.total}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right pt-2 border-t border-brand-border/60">
                    <span className="text-xs text-brand-muted">
                      Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-brand-surface/40 rounded-xl border border-brand-border">
                <Package size={36} className="mx-auto text-brand-muted mb-2" />
                <h3 className="font-serif text-lg font-bold text-brand-primary">No orders placed yet</h3>
                <p className="text-xs text-brand-muted mt-1 mb-6">Explore our fresh botanical batches and place your first order.</p>
                <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-full">
                  Shop Formulations
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-brand-primary">Delivery Locations</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg shadow"
              >
                <Plus size={14} />
                <span>{showAddressForm ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="p-6 bg-brand-surface rounded-xl border border-brand-border space-y-4 max-w-xl animate-fade-in">
                <h4 className="font-serif text-base font-bold text-brand-primary">New Delivery Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.name}
                      onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress.street}
                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-brand-border rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-lg shadow"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a._id} className="p-5 rounded-xl border border-brand-border bg-white shadow-sm flex flex-col justify-between">
                  <div className="text-xs text-brand-muted space-y-1">
                    <p className="font-bold text-brand-text text-sm">{a.name}</p>
                    <p>{a.street} {a.apartment}</p>
                    <p>{a.city}, {a.state} - {a.postalCode}</p>
                    <p>Phone: {a.phone}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                    {a.isDefault && (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        Default Address
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(a._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium inline-flex items-center space-x-1 ml-auto"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & SECURITY (CHANGE EMAIL AND PASSWORD) */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
            <div className="border-b border-brand-border pb-4">
              <h2 className="font-serif text-xl font-bold text-brand-primary flex items-center space-x-2">
                <ShieldCheck size={22} className="text-brand-primary" />
                <span>Account Credentials & Security</span>
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Update your personal details, registered email address, and account password.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary"
                      />
                      <User size={15} className="absolute left-3 top-3 text-brand-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 99999 99999"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary"
                      />
                      <Phone size={15} className="absolute left-3 top-3 text-brand-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">
                    Email Address (Login ID) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. customer@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary"
                    />
                    <Mail size={15} className="absolute left-3 top-3 text-brand-muted" />
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1">
                    Changing this will update the email you use to sign into SmoothSelf.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-brand-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center space-x-1.5">
                    <Lock size={14} className="text-brand-primary" />
                    <span>Change Password</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(!showProfilePassword)}
                    className="text-xs text-brand-muted hover:text-brand-primary inline-flex items-center space-x-1"
                  >
                    {showProfilePassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showProfilePassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-brand-muted">
                  Leave the password fields empty if you do not want to change your password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showProfilePassword ? 'text' : 'password'}
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                      placeholder="Enter current password to authorize change"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                    />
                    <Key size={15} className="absolute left-3 top-3 text-brand-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showProfilePassword ? 'text' : 'password'}
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-brand-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-text mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showProfilePassword ? 'text' : 'password'}
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-lg text-xs focus:outline-none focus:border-brand-primary"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-brand-muted" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-60 flex items-center space-x-2"
                >
                  <ShieldCheck size={16} />
                  <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile & Security'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountPage;
