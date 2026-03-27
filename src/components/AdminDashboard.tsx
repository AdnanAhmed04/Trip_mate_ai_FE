import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
    Users, Store, Calculator, CheckCircle, Clock, XCircle, DollarSign, Search,
    LogOut, LayoutDashboard, ChevronRight, ChevronDown, UserPlus, FileText,
    Star, ShieldAlert, Monitor, Smartphone, Tablet, Bell, User,
    MoreHorizontal, Edit2, Trash2, RotateCw, X
} from 'lucide-react';

type TabType = 'all-vendors' | 'add-vendor' | 'user-list' | 'vendor-payments' | 'user-payments' | 'security-logs';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState<TabType>('all-vendors');
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['vendors', 'users', 'payments']);
    const [vendorData, setVendorData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [calcData, setCalcData] = useState<any>(null);
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'paid' | 'free'>('all');

    // Modal state
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [v, u, c, s] = await Promise.all([
                api.admin.getVendors(),
                api.admin.getUsers(),
                api.admin.getCalculations(),
                api.admin.getSecurityLogs()
            ]);
            setVendorData(v);
            setUserData(u);
            setCalcData(c);
            setSecurityLogs(s.logs || []);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const handleDeleteVendor = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this vendor?')) return;
        try {
            await api.admin.deleteVendor(id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting vendor:', err);
            alert('Failed to delete vendor');
        }
    };

    const handleRenewVendor = async (id: string) => {
        try {
            await api.admin.renewVendor(id);
            await fetchData();
        } catch (err) {
            console.error('Error approving vendor:', err);
            alert('Failed to approve vendor');
        }
    };

    const handleRejectVendor = async (id: string) => {
        const reason = window.prompt('Please provide a reason for rejection (this will be emailed to the vendor):', 'Does not meet our current requirements.');
        if (reason === null) return; // Cancelled
        
        try {
            await api.admin.rejectVendor(id, reason);
            await fetchData();
        } catch (err) {
            console.error('Error rejecting vendor:', err);
            alert('Failed to reject vendor');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this user?')) return;
        try {
            await api.admin.deleteUser(id);
            await fetchData();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user');
        }
    };

    const handleRenewUser = async (id: string) => {
        try {
            await api.admin.renewUser(id);
            await fetchData();
        } catch (err) {
            console.error('Error renewing user:', err);
            alert('Failed to renew user');
        }
    };

    const getActiveGroupName = () => {
        if (activeTab.includes('vendor')) return 'Vendors';
        if (activeTab.includes('user')) return 'Users';
        if (activeTab.includes('payment')) return 'Payments';
        if (activeTab === 'security-logs') return 'System Logs';
        return 'Dashboard';
    };

    const renderContent = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading Records...</p>
            </div>
        );

        switch (activeTab) {
            case 'all-vendors': return renderVendorList();
            case 'add-vendor': return renderAddVendor();
            case 'user-list': return renderUserList();
            case 'vendor-payments': return renderPayments('vendor');
            case 'user-payments': return renderPayments('user');
            case 'security-logs': return renderSecurityLogs();
            default: return renderVendorList();
        }
    };

    const renderVendorList = () => {
        const filtered = vendorData?.vendors?.filter((v: any) =>
            v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-700 ">All Vendors</h3>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 ${loading ? 'opacity-50' : ''}`}
                            title="Refresh Vendors"
                        >
                            <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by name"
                                className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 outline-none w-64 transition-all focus:bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8f9fa] text-gray-500 text-[11px] uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Full Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Registration Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filtered?.map((v: any) => (
                                <tr key={v._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {v.companyName || "Vendor"}
                                    </td>

                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {v.email}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {v.createdAt
                                            ? new Date(v.createdAt).toISOString().split("T")[0]
                                            : "2018-05-16"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded inline-flex items-center justify-center text-[10px] font-bold ${v.status === "approved"
                                                ? "bg-green-100 text-green-700"
                                                : v.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {v.status === "approved"
                                                ? "Approved"
                                                : v.status === "rejected"
                                                    ? "Rejected"
                                                    : "Pending Approval"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setSelectedItem({ ...v, type: 'vendor' });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1 hover:text-blue-500 transition-colors"
                                                title="View Details"
                                            >
                                                <MoreHorizontal size={14} />
                                            </button>
                                            
                                            {(v.status === "pending" || v.status === "unpaid") && (
                                                <>
                                                    <button
                                                        onClick={() => handleRenewVendor(v._id)}
                                                        className="p-1 hover:text-green-500 transition-colors"
                                                        title="Approve Vendor"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectVendor(v._id)}
                                                        className="p-1 hover:text-orange-500 transition-colors"
                                                        title="Reject Vendor"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => handleDeleteVendor(v._id)}
                                                className="p-1 hover:text-red-500 transition-colors"
                                                title="Remove Vendor"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAddVendor = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">Add New Vendor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Company Name <span className="text-red-500">*</span></label><input type="text" className="w-full border border-gray-200 p-2 rounded outline-none focus:border-blue-400" placeholder="e.g. Acme Corp" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Business Type <span className="text-red-500">*</span></label>
                        <select className="w-full border border-gray-200 p-2 rounded outline-none focus:border-blue-400 bg-white">
                            <option>Travel Agency</option>
                            <option>Tour Operator</option>
                            <option>Transport Provider</option>
                        </select>
                    </div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Official Email <span className="text-red-500">*</span></label><input type="email" className="w-full border border-gray-200 p-2 rounded outline-none focus:border-blue-400" placeholder="contact@company.com" /></div>
                </div>
                <div className="space-y-4">
                    <p className="text-xs font-black text-gray-800 uppercase tracking-widest mb-2">Contact Information</p>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Main Representative</label><input type="text" className="w-full border border-gray-200 p-2 rounded outline-none focus:border-blue-400" placeholder="First Last" /></div>
                    <div><label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label><input type="text" className="w-full border border-gray-200 p-2 rounded outline-none focus:border-blue-400" placeholder="+1 234 567 890" /></div>
                </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 flex gap-3">
                <button className="px-6 py-2 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 transition-colors">Submit Request</button>
                <button className="px-6 py-2 bg-gray-100 text-gray-600 font-bold rounded border border-gray-200 hover:bg-gray-200">Reset Form</button>
            </div>
        </div>
    );

    const renderUserList = () => {
        const filtered = userData?.users?.filter((u: any) =>
            (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (userFilter === 'all' || u.subscriptionStatus === userFilter)
        );
        return (
            <div className="space-y-6 p-4">
                {/* Statistics Cards Relocated Here */}
                <div className="grid grid-cols-3 mb-4 md:grid-cols-3 gap-6">
                    <StatCard title="Total Platform Reach" value={userData.stats?.total || 0} icon={Users} color="blue" />
                    <StatCard title="Revenue Generating Users" value={userData.stats?.paid || 0} icon={DollarSign} color="indigo" />
                    <StatCard title="Community Growth" value={userData.stats?.free || 0} icon={Users} color="gray" />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                        <div className="flex gap-2">
                            {['all', 'paid', 'free'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setUserFilter(f as any)}
                                    className={`px-4 py-1.5 text-sm font-bold capitalize rounded transition-all ${userFilter === f ? 'bg-gray-800 bg-gray-100' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 ${loading ? 'opacity-50' : ''}`}
                                title="Refresh Users"
                            >
                                <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 outline-none w-64 transition-all focus:bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8f9fa] text-gray-500 text-[11px] uppercase font-bold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4"></th>
                                    <th className="px-6 py-4">Full Name</th>
                                    <th className="px-6 py-4">Email Address</th>
                                    <th className="px-6 py-4">Registration Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filtered?.map((u: any) => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                {u.avatar ? (
                                                    <img
                                                        src={u.avatar}
                                                        alt={u.name || u.companyName || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={14} className="text-gray-400" />
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 font-bold text-gray-700">
                                            {u.name || u.companyName || "User"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {u.email}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {u.createdAt
                                                ? new Date(u.createdAt).toISOString().split("T")[0]
                                                : "2018-05-16"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded inline-flex items-center justify-center text-[10px] font-bold ${u.subscriptionStatus === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {u.subscriptionStatus === "paid" ? "Active" : "Free"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem({ ...u, type: 'user' });
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1 hover:text-blue-500 transition-colors"
                                                    title="View Details"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>
                                                {u.subscriptionStatus === 'paid' && (
                                                    <button
                                                        onClick={() => handleRenewUser(u._id)}
                                                        className="p-1 hover:text-green-500 transition-colors"
                                                        title="Renew User"
                                                    >
                                                        <RotateCw size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-1 hover:text-red-500 transition-colors"
                                                    title="Remove User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderPayments = (type: 'vendor' | 'user') => {
        const list = type === 'vendor' ? calcData?.vendorStats?.vendors || [] : calcData?.userStats?.users || [];

        // Calculate Statistics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = type === 'vendor' ? {
            total: vendorData?.vendors?.length || 0,
            revenue: calcData?.vendorStats?.revenue || 0,
            newThisMonth: (vendorData?.vendors || []).filter((v: any) => new Date(v.createdAt) >= startOfMonth).length || 0
        } : {
            thisMonth: (userData?.users || []).filter((u: any) => u.subscriptionStatus === 'paid' && new Date(u.createdAt) >= startOfMonth).length || 0,
            totalPaid: (userData?.users || []).filter((u: any) => u.subscriptionStatus === 'paid').length || 0
        };

        return (
            <div className="space-y-6 p-4">
                {/* Stats Header */}
                <div className="grid grid-cols-3 mb-4 md:grid-cols-3 gap-6">
                    {type === 'vendor' ? (
                        <>
                            <StatCard
                                title="Total Vendors"
                                value={stats.total}
                                icon={Store}
                                color="blue"
                            />
                            <StatCard
                                title="Vendor Revenue"
                                value={`$${stats.revenue}`}
                                icon={DollarSign}
                                color="indigo"
                            />
                            <StatCard
                                title="New This Month"
                                value={stats.newThisMonth}
                                icon={UserPlus}
                                color="blue"
                            />

                        </>
                    ) : (
                        <>
                            <StatCard
                                title="Total Paid Users"
                                value={stats?.totalPaid ?? 0}
                                icon={CheckCircle}
                                color="green"
                            />

                            <StatCard
                                title="Monthly Subscriptions"
                                value={stats?.thisMonth ?? 0}
                                icon={Clock}
                                color="red"
                            />

                            <StatCard
                                title="Subscription Growth"
                                value={stats?.thisMonth ?? 0}
                                icon={RotateCw}
                                color="blue"
                            />

                            <StatCard
                                title="Revenue Growth"
                                value={new Intl.NumberFormat().format(
                                    type === "vendor"
                                        ? calcData?.vendorStats?.revenue ?? 0
                                        : calcData?.userStats?.revenue ?? 0
                                )}
                                icon={DollarSign}
                                color="yellow"
                            />
                        </>
                    )}
                </div>

                <div className="bg-white rounded shadow-sm rounded-lg border border-gray-200">


                    <table className="w-full text-left">
                        <thead className="bg-[#f8f9fa] text-[11px] font-bold uppercase text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Transaction</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {list?.map((item: any) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">
                                            {item.companyName || item.name}
                                        </p>
                                        <p className="text-xs text-gray-400 italic">
                                            {item.email}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 font-bold text-blue-600">
                                        ${type === "vendor" ? "99" : "19"}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 rounded inline-flex items-center justify-center text-[10px] font-bold bg-green-100 text-green-700">
                                            SUCCESS
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const renderSecurityLogs = () => {
        const filtered = securityLogs.filter(log =>
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-700">Security Audit Trail</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last 100 system events</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 ${loading ? 'opacity-50' : ''}`}
                            title="Refresh Logs"
                        >
                            <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 outline-none w-64 transition-all focus:bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8f9fa] text-gray-500 text-[11px] uppercase font-bold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 w-48">Timestamp</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((log: any) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-700 text-sm">{log.actor}</p>
                                        <p className="text-[10px] text-gray-400">{log.ip}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-gray-600 uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                            log.severity === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedItem({ ...log, type: 'log' });
                                                setIsModalOpen(true);
                                            }}
                                            className="text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase"
                                        >
                                            View Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <ShieldAlert size={40} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No security events found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full bg-[#f4f7f9] font-sans selection:bg-blue-100 overflow-hidden">
            {/* Sidebar - Dark CRM Style */}
            <aside className="w-[260px] bg-[#2d3446] shrink-0 h-full flex flex-col z-40">
                <div className="h-14 flex items-center px-6 border-b border-black/10 bg-black/5">
                    <span className="text-blue-400 font-black text-xl tracking-tighter">TM</span>
                    <span className="text-white/40 font-black text-[10px] border border-white/20 ml-2 px-1 rounded uppercase">Admin</span>
                </div>

                <div className="flex-1 text-white overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
                    {/* Nav Group: Vendors */}
                    <SidebarGroup
                        label="Vendors"
                        icon={Store}
                        expanded={expandedGroups.includes('vendors')}
                    // onToggle={() => toggleGroup('vendors')}
                    >
                        <SidebarItem className='cursor-pointer' active={activeTab === 'all-vendors'} onClick={() => setActiveTab('all-vendors')} label="All Vendors" icon={FileText} />
                        <SidebarItem className='cursor-pointer' active={activeTab === 'add-vendor'} onClick={() => setActiveTab('add-vendor')} label="Add Vendor" icon={UserPlus} />
                    </SidebarGroup>

                    {/* Nav Group: Users */}
                    <SidebarGroup
                        label="Users"
                        icon={Users}
                        expanded={expandedGroups.includes('users')}
                    // onToggle={() => toggleGroup('users')}
                    >
                        <SidebarItem active={activeTab === 'user-list'} onClick={() => setActiveTab('user-list')} label="User Directory" icon={Users} />
                    </SidebarGroup>

                    {/* Nav Group: Payments */}
                    <SidebarGroup
                        label="Financials"
                        icon={DollarSign}
                        expanded={expandedGroups.includes('payments')}
                    // onToggle={() => toggleGroup('payments')}
                    >
                        <SidebarItem active={activeTab === 'vendor-payments'} onClick={() => setActiveTab('vendor-payments')} label="Vendor Payments" icon={Calculator} />
                        <SidebarItem active={activeTab === 'user-payments'} onClick={() => setActiveTab('user-payments')} label="User Subscriptions" icon={FileText} />
                    </SidebarGroup>

                    <div className="mt-8 px-6">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-4">Core Systems</p>
                        <div className="space-y-3">
                            <div
                                onClick={() => setActiveTab('security-logs')}
                                className={`flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'security-logs' ? 'text-blue-400' : 'text-white/50 hover:text-white'}`}
                            >
                                <ShieldAlert size={14} />
                                <span className="text-xs font-bold">Security Logs</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 mt-auto bg-black/5 border-t border-black/10">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 text-white/50 hover:text-red-400 transition-all font-bold text-xs group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 duration-300" /> Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Single Header */}
                <header className="h-14 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm">

                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <GetActiveIcon tab={activeTab} />
                        </div>
                        <h1 className="text-sm font-black tracking-wide uppercase text-gray-800">
                            {getActiveGroupName()}
                        </h1>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-6">


                        <div className="relative">
                            <Bell size={18} className="text-gray-400 cursor-pointer" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500">Adnan Ahmed</span>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                                AA
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </main>
            </div>

            {isModalOpen && <DetailsModal item={selectedItem} onClose={() => setIsModalOpen(false)} />}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .selection\\:bg-blue-100::selection { background: #dbeafe; }
            `}</style>
        </div>
    );
}

function SidebarGroup({ label, icon: Icon, expanded, onToggle, children }: any) {
    return (
        <div className="mb-2">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-6 py-3 text-white/50 hover:text-white transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span className="text-xs font-black uppercase tracking-widest leading-none">{label}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-black/10 py-2">
                    {children}
                </div>
            </div>
        </div>
    );
}

function SidebarItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-10 py-2.5 transition-all text-[11px] font-bold tracking-tight ${active ? 'text-blue-400 bg-blue-400/5 border-l-2 border-blue-400' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={12} />
            {label}
        </button>
    );
}

function StatCard({ title, value, icon: Icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4 group">
            <div className={`w-12 h-12 rounded flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-black text-gray-800 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function GetActiveIcon({ tab }: { tab: string }) {
    if (tab.includes('vendor')) return <Store size={16} />;
    if (tab.includes('user')) return <Users size={16} />;
    if (tab.includes('payment')) return <DollarSign size={16} />;
    return <LayoutDashboard size={16} />;
}

function DetailsModal({ item, onClose }: { item: any; onClose: () => void }) {
    if (!item) return null;

    const isVendor = item.type === 'vendor';
    const isLog = item.type === 'log';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                            {isLog ? 'Security Event Details' : (isVendor ? 'Vendor Profile' : 'User Profile')}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Record ID: {item._id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {/* Header Info */}
                    <div className="flex items-start gap-6">
                        <div className="w-40 h-20  flex items-center justify-center shrink-0">
                            {isLog ? <ShieldAlert size={94} className="text-red-500 rounded-full bg-red-200 border border-red-100 p-4" /> : (isVendor ? <Store size={32} className="text-blue-500" /> : <User size={32} className="text-blue-500" />)}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                                {isLog ? item.action.replace(/_/g, ' ') : (item.companyName || item.name)}
                            </h2>
                            <p className="text-gray-500 font-bold">{isLog ? `Triggered by ${item.actor}` : item.email}</p>
                            <div className="flex gap-2 mt-2">
                                {isLog ? (
                                    <span className={`px-3 py-0.5 rounded text-[10px] font-black uppercase ${item.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {item.severity} SEVERITY
                                    </span>
                                ) : (
                                    <>
                                        <span className={`px-3 py-0.5 rounded text-[10px] font-black uppercase ${item.status === 'approved' || item.subscriptionStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {item.status || item.subscriptionStatus}
                                        </span>
                                        {item.paid && <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded text-[10px] font-black uppercase">Paid Member</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isLog ? (
                        <div className="grid grid-cols-2 gap-8">
                            {/* Registration Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Record Overview</h4>
                                <div className="space-y-3">
                                    <DetailItem label={isVendor ? "Business Type" : "Account Type"} value={item.vendorType || (item.subscriptionStatus === 'paid' ? 'Premium' : 'Standard')} />
                                    <DetailItem label="Joined Platform" value={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                                    {isVendor && <DetailItem label="Operating City" value={item.city || 'Not Specified'} />}
                                    {isVendor && <DetailItem label="Budget Range" value={`$${item.budgetMin} - $${item.budgetMax}`} />}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Financial Info</h4>
                                <div className="space-y-3">
                                    <DetailItem label="Payment Status" value={item.paid || item.subscriptionStatus === 'paid' ? 'CONFIRMED' : 'PENDING'} />
                                    <DetailItem label="Stripe Session" value={item.stripeSessionId || 'N/A'} isCode />
                                    <DetailItem label="Transaction ID" value={item.paymentIntentId || 'N/A'} isCode />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-red-600 uppercase tracking-widest border-b border-red-50 pb-2">Event Origin</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Source IP" value={item.ip || 'Unknown'} isCode />
                                    <DetailItem label="Time of Event" value={new Date(item.createdAt).toLocaleString()} />
                                    <DetailItem label="Actor Email" value={item.actor} />
                                    <DetailItem label="Event Status" value="Logged & Encrypted" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">User Agent Header</h4>
                                <p className="text-[11px] font-mono text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 break-all leading-relaxed">
                                    {item.userAgent || 'No data captured.'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Metadata Payload</h4>
                                <div className="bg-gray-900 rounded-lg p-6 font-mono text-xs text-blue-300 overflow-x-auto">
                                    <pre>{JSON.stringify(item.details || {}, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {isVendor && !isLog && (
                        <div className="space-y-6 pt-4 border-t border-gray-100">
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Offered Services</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.services?.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{s}</span>
                                    ))}
                                    {item.customServices?.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Company Bio</h4>
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                                    "{item.aboutUs || 'No description provided.'}"
                                </p>
                            </div>

                            {item.branches?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Branch Network ({item.branches.length})</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {item.branches.map((b: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded font-bold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px]">{i + 1}</span>
                                                    <span className="text-gray-800">{b.name}</span>
                                                </div>
                                                <span className="text-gray-400 font-normal">{b.location} • {b.phone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Close Entry</button>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isCode }: { label: string; value: string; isCode?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${isCode ? 'font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded w-fit' : 'text-gray-700'}`}>
                {value}
            </p>
        </div>
    );
}
