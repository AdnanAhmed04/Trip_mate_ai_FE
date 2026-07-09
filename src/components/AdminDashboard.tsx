import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';
import {
    Users, Store, Calculator, CheckCircle, Clock, XCircle, DollarSign, Search,
    LogOut, LayoutDashboard, ChevronDown, UserPlus, FileText,
    ShieldAlert, Bell, User, Menu, Hotel as HotelIcon, CalendarCheck,
    MoreHorizontal, Trash2, RotateCw, X, Inbox, ArrowRight,
} from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from './ui/dialog';
import {
    AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
    AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from './ui/alert-dialog';
import { Toaster } from './ui/sonner';
import { Textarea } from './ui/textarea';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from './ui/dropdown-menu';

type TabType = 'overview' | 'all-vendors' | 'add-vendor' | 'user-list' | 'vendor-payments' | 'user-payments' | 'hotel-payments' | 'security-logs' | 'hotels';

type ConfirmType = 'delete-vendor' | 'delete-user' | 'delete-hotel' | 'reject-hotel' | 'approve-vendor' | 'renew-user' | 'approve-hotel' | 'confirm-booking';

interface ConfirmState {
    type: ConfirmType;
    id: string;
    name?: string;
}

interface RejectState {
    type: 'vendor' | 'booking';
    id: string;
    name?: string;
}

const CONFIRM_COPY: Record<ConfirmType, { title: string; description: string; actionLabel: string; destructive?: boolean }> = {
    'delete-vendor': { title: 'Remove this vendor?', description: 'This permanently deletes the vendor record and cannot be undone.', actionLabel: 'Remove Vendor', destructive: true },
    'delete-user': { title: 'Remove this user?', description: 'This permanently deletes the user account and cannot be undone.', actionLabel: 'Remove User', destructive: true },
    'delete-hotel': { title: 'Delete this hotel?', description: 'This permanently removes the hotel listing and cannot be undone.', actionLabel: 'Delete Hotel', destructive: true },
    'reject-hotel': { title: 'Reject this hotel?', description: 'The hotel will be marked as rejected and hidden from users.', actionLabel: 'Reject Hotel', destructive: true },
    'approve-vendor': { title: 'Approve this vendor?', description: 'The vendor will be marked as approved and become publicly visible.', actionLabel: 'Approve Vendor' },
    'renew-user': { title: 'Renew this subscription?', description: 'This manually extends the paid subscription for this user.', actionLabel: 'Renew Subscription' },
    'approve-hotel': { title: 'Approve this hotel?', description: 'The hotel listing will go live and become bookable by users.', actionLabel: 'Approve Hotel' },
    'confirm-booking': { title: 'Confirm this booking?', description: 'The guest will be notified that their reservation is confirmed.', actionLabel: 'Confirm Booking' },
};

const STATUS_STYLES: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
    unpaid: 'bg-slate-100 text-slate-600 border-slate-200',
    free: 'bg-slate-100 text-slate-600 border-slate-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function StatusBadge({ status, labelOverride }: { status?: string; labelOverride?: string }) {
    const key = status || 'unpaid';
    const cls = STATUS_STYLES[key] || 'bg-slate-100 text-slate-600 border-slate-200';
    const label = labelOverride || key.replace(/_/g, ' ');
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${cls}`}>
            {label}
        </span>
    );
}

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [hotelSubTab, setHotelSubTab] = useState<'listings' | 'bookings'>('listings');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<string[]>(['vendors', 'users', 'payments', 'hotels']);
    const [vendorData, setVendorData] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);
    const [calcData, setCalcData] = useState<any>(null);
    const [securityLogs, setSecurityLogs] = useState<any[]>([]);
    const [hotelData, setHotelData] = useState<any>(null);
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'paid' | 'free'>('all');

    // Details modal
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Confirm / reject dialogs
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [rejectState, setRejectState] = useState<RejectState | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionBusy, setActionBusy] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setSearchQuery('');
        setSidebarOpen(false);
    }, [activeTab]);

    const fetchData = async (silent = false) => {
        if (silent) setRefreshing(true); else setLoading(true);
        try {
            const [v, u, c, s, h, b] = await Promise.all([
                api.admin.getVendors(),
                api.admin.getUsers(),
                api.admin.getCalculations(),
                api.admin.getSecurityLogs(),
                api.admin.getHotels(),
                api.bookings.getAll()
            ]);
            setVendorData(v);
            setUserData(u);
            setCalcData(c);
            setSecurityLogs(s.logs || []);
            setHotelData(h);
            setBookingData(b);
            if (silent) toast.success('Dashboard data refreshed');
        } catch (err: any) {
            console.error('Error fetching admin data:', err);
            toast.error(err?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    // ── Unified confirm executor ────────────────────────────────
    const executeConfirm = async () => {
        if (!confirmState) return;
        setActionBusy(true);
        try {
            switch (confirmState.type) {
                case 'delete-vendor': await api.admin.deleteVendor(confirmState.id); toast.success('Vendor removed'); break;
                case 'delete-user': await api.admin.deleteUser(confirmState.id); toast.success('User removed'); break;
                case 'delete-hotel': await api.admin.deleteHotel(confirmState.id); toast.success('Hotel deleted'); break;
                case 'reject-hotel': await api.admin.rejectHotel(confirmState.id); toast.success('Hotel rejected'); break;
                case 'approve-vendor': await api.admin.renewVendor(confirmState.id); toast.success('Vendor approved'); break;
                case 'renew-user': await api.admin.renewUser(confirmState.id); toast.success('Subscription renewed'); break;
                case 'approve-hotel': await api.admin.approveHotel(confirmState.id); toast.success('Hotel approved'); break;
                case 'confirm-booking': await api.bookings.confirm(confirmState.id); toast.success('Booking confirmed'); break;
            }
            await fetchData(true);
        } catch (err: any) {
            toast.error(err?.message || 'Action failed. Please try again.');
        } finally {
            setActionBusy(false);
            setConfirmState(null);
        }
    };

    // ── Unified reject-with-reason executor ─────────────────────
    const executeReject = async () => {
        if (!rejectState) return;
        setActionBusy(true);
        try {
            if (rejectState.type === 'vendor') {
                await api.admin.rejectVendor(rejectState.id, rejectReason || 'Does not meet our current requirements.');
                toast.success('Vendor rejected and notified by email');
            } else {
                await api.bookings.reject(rejectState.id, rejectReason);
                toast.success('Booking rejected and guest notified');
            }
            await fetchData(true);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to reject. Please try again.');
        } finally {
            setActionBusy(false);
            setRejectState(null);
            setRejectReason('');
        }
    };

    const getPageMeta = (): { title: string; description: string; icon: any } => {
        switch (activeTab) {
            case 'overview': return { title: 'Overview', description: 'Snapshot of platform activity and pending approvals', icon: LayoutDashboard };
            case 'all-vendors': return { title: 'All Vendors', description: 'Review, approve, and manage vendor accounts', icon: Store };
            case 'add-vendor': return { title: 'Add Vendor', description: 'Manually register a new vendor on the platform', icon: UserPlus };
            case 'user-list': return { title: 'User Directory', description: 'Browse and manage registered platform users', icon: Users };
            case 'vendor-payments': return { title: 'Vendor Payments', description: 'Revenue and transaction history for vendors', icon: Calculator };
            case 'user-payments': return { title: 'User Subscriptions', description: 'Revenue and subscription history for users', icon: FileText };
            case 'hotel-payments': return { title: 'Hotel Payments', description: 'Listing fee transactions from registered hotels', icon: HotelIcon };
            case 'security-logs': return { title: 'Security Logs', description: 'Audit trail of sensitive system events', icon: ShieldAlert };
            case 'hotels': return { title: 'Hotels', description: 'Hotels Listing and Hotels Bookings management', icon: HotelIcon };
            default: return { title: 'Dashboard', description: '', icon: LayoutDashboard };
        }
    };

    const renderContent = () => {
        if (loading) return <LoadingState />;

        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'all-vendors': return renderVendorList();
            case 'add-vendor': return renderAddVendor();
            case 'user-list': return renderUserList();
            case 'vendor-payments': return renderPayments('vendor');
            case 'user-payments': return renderPayments('user');
            case 'hotel-payments': return renderHotelPayments();
            case 'security-logs': return renderSecurityLogs();
            case 'hotels': return renderHotels();
            default: return renderOverview();
        }
    };

    // ────────────────────────────────────────────────────────────
    // OVERVIEW
    // ────────────────────────────────────────────────────────────
    const renderOverview = () => {
        const pendingVendors = (vendorData?.vendors || []).filter((v: any) => v.status === 'pending' || v.status === 'pending_approval' || v.status === 'unpaid').length;
        const pendingHotels = (hotelData?.hotels || []).filter((h: any) => h.status === 'pending' || h.status === 'pending_approval').length;
        const pendingBookings = (bookingData?.bookings || []).filter((b: any) => b.status === 'pending').length;
        const totalRevenue = (calcData?.vendorStats?.revenue || 0) + (calcData?.userStats?.revenue || 0) + ((hotelData?.hotels || []).filter((h: any) => h.paid).length * 12);

        const recentVendors = [...(vendorData?.vendors || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
        const recentBookings = [...(bookingData?.bookings || [])].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Vendors" value={vendorData?.vendors?.length || 0} icon={Store} tone="blue" trend={`${pendingVendors} pending review`} />
                    <StatCard title="Total Users" value={userData?.stats?.total || 0} icon={Users} tone="violet" trend={`${userData?.stats?.paid || 0} paid subscribers`} />
                    <StatCard title="Total Hotels" value={hotelData?.stats?.total || 0} icon={HotelIcon} tone="amber" trend={`${pendingHotels} awaiting approval`} />
                    <StatCard title="Platform Revenue" value={`$${new Intl.NumberFormat().format(totalRevenue)}`} icon={DollarSign} tone="emerald" trend="Vendor + subscription income" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <ActionCard
                        icon={Store}
                        tone="blue"
                        title="Vendor approvals"
                        count={pendingVendors}
                        description="Vendors waiting for review before going live."
                        onClick={() => setActiveTab('all-vendors')}
                    />
                    <ActionCard
                        icon={HotelIcon}
                        tone="amber"
                        title="Hotel approvals"
                        count={pendingHotels}
                        description="Hotel listings pending approval to appear on the site."
                        onClick={() => { setHotelSubTab('listings'); setActiveTab('hotels'); }}
                    />
                    <ActionCard
                        icon={CalendarCheck}
                        tone="rose"
                        title="Booking requests"
                        count={pendingBookings}
                        description="Guest reservations awaiting confirmation."
                        onClick={() => { setHotelSubTab('bookings'); setActiveTab('hotels'); }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Panel title="Recently Registered Vendors" action={{ label: 'View all', onClick: () => setActiveTab('all-vendors') }}>
                        {recentVendors.length === 0 ? (
                            <EmptyRow label="No vendors registered yet" />
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentVendors.map((v: any) => (
                                    <li key={v._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <Store size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{v.companyName || 'Vendor'}</p>
                                                <p className="text-xs text-slate-400 truncate">{v.email}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={v.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>

                    <Panel title="Recent Booking Activity" action={{ label: 'View all', onClick: () => { setHotelSubTab('bookings'); setActiveTab('hotels'); } }}>
                        {recentBookings.length === 0 ? (
                            <EmptyRow label="No bookings yet" />
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {recentBookings.map((b: any) => (
                                    <li key={b._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                                <CalendarCheck size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{b.contactName || b.user?.name || 'Guest'}</p>
                                                <p className="text-xs text-slate-400 truncate">{b.hotel?.hotelName || b.hotelName || 'Hotel'}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={b.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────
    // VENDORS
    // ────────────────────────────────────────────────────────────
    const renderVendorList = () => {
        const filtered = (vendorData?.vendors || []).filter((v: any) =>
            (v.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <Panel
                title="All Vendors"
                subtitle={`${filtered.length} of ${vendorData?.vendors?.length || 0} vendors`}
                toolbar={
                    <TableToolbar
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="Search by name or email"
                        onRefresh={() => fetchData(true)}
                        refreshing={refreshing}
                    />
                }
                noPadding
            >
                {filtered.length === 0 ? (
                    <EmptyState icon={Store} label="No vendors found" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Company</th>
                                    <th className="px-6 py-3.5">Email</th>
                                    <th className="px-6 py-3.5">Registered</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((v: any) => (
                                    <tr key={v._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3.5 font-semibold text-slate-800">{v.companyName || 'Vendor'}</td>
                                        <td className="px-6 py-3.5 text-slate-500 text-sm">{v.email}</td>
                                        <td className="px-6 py-3.5 text-sm text-slate-500">{v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                        <td className="px-6 py-3.5"><StatusBadge status={v.status} /></td>
                                        <td className="px-6 py-3.5 text-right">
                                            <RowActions>
                                                <DropdownMenuItem onClick={() => { setSelectedItem({ ...v, type: 'vendor' }); setIsModalOpen(true); }}>
                                                    <MoreHorizontal size={14} className="mr-2" /> View details
                                                </DropdownMenuItem>
                                                {(v.status === 'pending' || v.status === 'pending_approval' || v.status === 'unpaid') && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => setConfirmState({ type: 'approve-vendor', id: v._id, name: v.companyName })}>
                                                            <CheckCircle size={14} className="mr-2 text-emerald-600" /> Approve vendor
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setRejectState({ type: 'vendor', id: v._id, name: v.companyName })}>
                                                            <XCircle size={14} className="mr-2 text-amber-600" /> Reject vendor
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem variant="destructive" onClick={() => setConfirmState({ type: 'delete-vendor', id: v._id, name: v.companyName })}>
                                                    <Trash2 size={14} className="mr-2" /> Remove vendor
                                                </DropdownMenuItem>
                                            </RowActions>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        );
    };

    const renderAddVendor = () => (
        <Panel title="Add New Vendor" subtitle="Manually create a vendor profile on the platform">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <FormField label="Company Name" required>
                        <input type="text" className={INPUT_CLS} placeholder="e.g. Acme Corp" />
                    </FormField>
                    <FormField label="Business Type" required>
                        <select className={`${INPUT_CLS} bg-white`}>
                            <option>Travel Agency</option>
                            <option>Tour Operator</option>
                            <option>Transport Provider</option>
                        </select>
                    </FormField>
                    <FormField label="Official Email" required>
                        <input type="email" className={INPUT_CLS} placeholder="contact@company.com" />
                    </FormField>
                </div>
                <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2">Contact Information</p>
                    <FormField label="Main Representative">
                        <input type="text" className={INPUT_CLS} placeholder="First Last" />
                    </FormField>
                    <FormField label="Phone Number">
                        <input type="text" className={INPUT_CLS} placeholder="+1 234 567 890" />
                    </FormField>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                <button
                    onClick={() => toast.info('Vendor onboarding via public registration form is recommended. Manual creation is not yet wired to the API.')}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Submit Request
                </button>
                <button className="px-5 py-2.5 bg-white text-slate-600 font-semibold text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    Reset Form
                </button>
            </div>
        </Panel>
    );

    // ────────────────────────────────────────────────────────────
    // USERS
    // ────────────────────────────────────────────────────────────
    const renderUserList = () => {
        const filtered = (userData?.users || []).filter((u: any) =>
            (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (userFilter === 'all' || u.subscriptionStatus === userFilter)
        );

        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Total Platform Reach" value={userData?.stats?.total || 0} icon={Users} tone="blue" />
                    <StatCard title="Revenue Generating Users" value={userData?.stats?.paid || 0} icon={DollarSign} tone="violet" />
                    <StatCard title="Free Tier Users" value={userData?.stats?.free || 0} icon={Users} tone="slate" />
                </div>

                <Panel
                    title="User Directory"
                    subtitle={`${filtered.length} of ${userData?.users?.length || 0} users`}
                    toolbar={
                        <TableToolbar
                            searchValue={searchQuery}
                            onSearchChange={setSearchQuery}
                            placeholder="Search users..."
                            onRefresh={() => fetchData(true)}
                            refreshing={refreshing}
                            filters={
                                <div className="flex gap-1.5">
                                    {(['all', 'paid', 'free'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setUserFilter(f)}
                                            className={`px-3.5 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${userFilter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                    }
                    noPadding
                >
                    {filtered.length === 0 ? (
                        <EmptyState icon={Users} label="No users found" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5 w-14"></th>
                                        <th className="px-6 py-3.5">Full Name</th>
                                        <th className="px-6 py-3.5">Email</th>
                                        <th className="px-6 py-3.5">Registered</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((u: any) => (
                                        <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt={u.name || u.companyName || 'User'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={14} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 font-semibold text-slate-800">{u.name || u.companyName || 'User'}</td>
                                            <td className="px-6 py-3.5 text-slate-500 text-sm">{u.email}</td>
                                            <td className="px-6 py-3.5 text-sm text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                            <td className="px-6 py-3.5"><StatusBadge status={u.subscriptionStatus === 'paid' ? 'active' : 'free'} labelOverride={u.subscriptionStatus === 'paid' ? 'Active' : 'Free'} /></td>
                                            <td className="px-6 py-3.5 text-right">
                                                <RowActions>
                                                    <DropdownMenuItem onClick={() => { setSelectedItem({ ...u, type: 'user' }); setIsModalOpen(true); }}>
                                                        <MoreHorizontal size={14} className="mr-2" /> View details
                                                    </DropdownMenuItem>
                                                    {u.subscriptionStatus === 'paid' && (
                                                        <DropdownMenuItem onClick={() => setConfirmState({ type: 'renew-user', id: u._id, name: u.name })}>
                                                            <RotateCw size={14} className="mr-2 text-emerald-600" /> Renew subscription
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem variant="destructive" onClick={() => setConfirmState({ type: 'delete-user', id: u._id, name: u.name })}>
                                                        <Trash2 size={14} className="mr-2" /> Remove user
                                                    </DropdownMenuItem>
                                                </RowActions>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────
    // PAYMENTS
    // ────────────────────────────────────────────────────────────
    const renderPayments = (type: 'vendor' | 'user') => {
        const list = type === 'vendor' ? calcData?.vendorStats?.vendors || [] : calcData?.userStats?.users || [];
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = type === 'vendor' ? {
            total: vendorData?.vendors?.length || 0,
            revenue: calcData?.vendorStats?.revenue || 0,
            newThisMonth: (vendorData?.vendors || []).filter((v: any) => new Date(v.createdAt) >= startOfMonth).length || 0,
        } : {
            totalPaid: (userData?.users || []).filter((u: any) => u.subscriptionStatus === 'paid').length || 0,
            thisMonth: (userData?.users || []).filter((u: any) => u.subscriptionStatus === 'paid' && new Date(u.createdAt) >= startOfMonth).length || 0,
            revenue: calcData?.userStats?.revenue ?? 0,
        };

        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {type === 'vendor' ? (
                        <>
                            <StatCard title="Total Vendors" value={stats.total} icon={Store} tone="blue" />
                            <StatCard title="Vendor Revenue" value={`$${new Intl.NumberFormat().format(stats.revenue)}`} icon={DollarSign} tone="emerald" />
                            <StatCard title="New This Month" value={stats.newThisMonth} icon={UserPlus} tone="violet" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Total Paid Users" value={stats.totalPaid} icon={CheckCircle} tone="emerald" />
                            <StatCard title="New Subscriptions" value={stats.thisMonth} icon={Clock} tone="amber" />
                            <StatCard title="Subscription Revenue" value={`$${new Intl.NumberFormat().format(stats.revenue)}`} icon={DollarSign} tone="violet" />
                        </>
                    )}
                </div>

                <Panel title={type === 'vendor' ? 'Vendor Transactions' : 'User Subscription Transactions'} noPadding>
                    {list.length === 0 ? (
                        <EmptyState icon={DollarSign} label="No transactions found" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Recipient</th>
                                        <th className="px-6 py-3.5">Amount</th>
                                        <th className="px-6 py-3.5 text-right">Transaction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {list.map((item: any) => (
                                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <p className="font-semibold text-slate-800">{item.companyName || item.name}</p>
                                                <p className="text-xs text-slate-400">{item.email}</p>
                                            </td>
                                            <td className="px-6 py-3.5 font-bold text-blue-600">${type === 'vendor' ? '99' : '19'}</td>
                                            <td className="px-6 py-3.5 text-right"><StatusBadge status="paid" labelOverride="Success" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────
    // HOTEL PAYMENTS
    // ────────────────────────────────────────────────────────────
    const renderHotelPayments = () => {
        const allHotels: any[] = hotelData?.hotels || [];
        const paidHotels = allHotels.filter((h: any) => h.paid === true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = paidHotels.filter((h: any) => new Date(h.createdAt) >= startOfMonth).length;
        const LISTING_FEE = 12; // $12 per hotel (1200 cents via Stripe)
        const totalRevenue = paidHotels.length * LISTING_FEE;

        const filtered = paidHotels.filter((h: any) =>
            (h.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard title="Total Hotels Paid" value={paidHotels.length} icon={HotelIcon} tone="blue" />
                    <StatCard title="Hotel Revenue" value={`$${new Intl.NumberFormat().format(totalRevenue)}`} icon={DollarSign} tone="emerald" />
                    <StatCard title="New This Month" value={newThisMonth} icon={Clock} tone="amber" />
                </div>

                <Panel
                    title="Hotel Listing Transactions"
                    subtitle={`${filtered.length} paid hotel${filtered.length !== 1 ? 's' : ''}`}
                    toolbar={
                        <TableToolbar
                            searchValue={searchQuery}
                            onSearchChange={setSearchQuery}
                            placeholder="Search by hotel name or city…"
                            onRefresh={() => fetchData(true)}
                            refreshing={refreshing}
                        />
                    }
                    noPadding
                >
                    {filtered.length === 0 ? (
                        <EmptyState icon={DollarSign} label="No hotel payment records found" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Hotel</th>
                                        <th className="px-6 py-3.5">Location</th>
                                        <th className="px-6 py-3.5">Category</th>
                                        <th className="px-6 py-3.5">Paid On</th>
                                        <th className="px-6 py-3.5">Amount</th>
                                        <th className="px-6 py-3.5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((h: any) => (
                                        <tr key={h._id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-amber-50 overflow-hidden shrink-0 border border-amber-100">
                                                        {h.logoUrl
                                                            ? <img src={h.logoUrl} alt={h.hotelName} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><HotelIcon size={14} className="text-amber-400" /></div>
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{h.hotelName}</p>
                                                        <p className="text-xs text-slate-400">{h.email || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 text-slate-600 text-sm">{h.city || '—'}</td>
                                            <td className="px-6 py-3.5">
                                                <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{h.budgetCategory || '—'}</span>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-slate-500">
                                                {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </td>
                                            <td className="px-6 py-3.5 font-bold text-blue-600">${LISTING_FEE}</td>
                                            <td className="px-6 py-3.5 text-right">
                                                <StatusBadge status="paid" labelOverride="Success" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────
    // HOTELS (unified: listings + bookings sub-tabs)
    // ────────────────────────────────────────────────────────────
    const renderHotels = () => {
        const hotels = hotelData?.hotels || [];
        const hotelStats = hotelData?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };

        const bookings: any[] = bookingData?.bookings || [];
        const bookingStats = bookingData?.stats || { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
        const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

        const filteredHotels = hotels.filter((h: any) =>
            (h.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.city || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-5">
                {/* Sub-tab switcher */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1 w-fit">
                    <button
                        onClick={() => { setHotelSubTab('listings'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${hotelSubTab === 'listings'
                            ? 'bg-[#161c2d] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                        <HotelIcon size={15} />
                        Hotels Listing
                        {hotelStats.pending > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {hotelStats.pending}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { setHotelSubTab('bookings'); setSearchQuery(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${hotelSubTab === 'bookings'
                            ? 'bg-[#161c2d] text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                        <CalendarCheck size={15} />
                        Hotels Bookings
                        {bookingStats.pending > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {bookingStats.pending}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── LISTINGS sub-tab ─────────────────────────── */}
                {hotelSubTab === 'listings' && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total" value={hotelStats.total} icon={HotelIcon} tone="slate" />
                            <StatCard title="Pending" value={hotelStats.pending} icon={Clock} tone="amber" />
                            <StatCard title="Approved" value={hotelStats.approved} icon={CheckCircle} tone="emerald" />
                            <StatCard title="Rejected" value={hotelStats.rejected} icon={XCircle} tone="rose" />
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-700">{filteredHotels.length}</span> of {hotels.length} hotels
                            </p>
                            <TableToolbar
                                searchValue={searchQuery}
                                onSearchChange={setSearchQuery}
                                placeholder="Search by name or city…"
                                onRefresh={() => fetchData(true)}
                                refreshing={refreshing}
                            />
                        </div>

                        {filteredHotels.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-16">
                                <EmptyState icon={HotelIcon} label="No hotels found" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {filteredHotels.map((h: any) => (
                                    <div key={h._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                                        {/* Hotel image */}
                                        <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                                            {h.logoUrl
                                                ? <img src={h.logoUrl} alt={h.hotelName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                : <div className="w-full h-full flex items-center justify-center"><HotelIcon size={32} className="text-slate-300" /></div>
                                            }
                                            {/* Status overlay badge */}
                                            <div className="absolute top-3 right-3">
                                                <StatusBadge status={h.status} />
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{h.hotelName}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                                <span>{h.city}</span>
                                                <span className="text-slate-300">·</span>
                                                <span className="uppercase font-semibold">{h.budgetCategory}</span>
                                                <span className="text-slate-300">·</span>
                                                <span className="font-semibold text-slate-700">${h.pricePerNight}/night</span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 mb-5 flex-1">{h.description}</p>

                                            <div className="flex items-center gap-2">
                                                {h.status !== 'approved' && (
                                                    <button
                                                        onClick={() => setConfirmState({ type: 'approve-hotel', id: h._id, name: h.hotelName })}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                                    >
                                                        <CheckCircle size={13} /> Approve
                                                    </button>
                                                )}
                                                {h.status !== 'rejected' && (
                                                    <button
                                                        onClick={() => setConfirmState({ type: 'reject-hotel', id: h._id, name: h.hotelName })}
                                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                                                    >
                                                        <XCircle size={13} /> Reject
                                                    </button>
                                                )}
                                                {h.status === 'approved' && (
                                                    <div className="flex-1 flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-bold py-2.5">
                                                        <CheckCircle size={13} /> Live
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => setConfirmState({ type: 'delete-hotel', id: h._id, name: h.hotelName })}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center transition-colors border border-red-100"
                                                    title="Delete hotel"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── BOOKINGS sub-tab ─────────────────────────── */}
                {hotelSubTab === 'bookings' && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Bookings" value={bookingStats.total} icon={CalendarCheck} tone="slate" />
                            <StatCard title="Pending" value={bookingStats.pending} icon={Clock} tone="amber" />
                            <StatCard title="Confirmed" value={bookingStats.confirmed} icon={CheckCircle} tone="emerald" />
                            <StatCard title="Cancelled" value={bookingStats.cancelled} icon={XCircle} tone="rose" />
                        </div>

                        <Panel
                            title="Hotels Bookings"
                            subtitle={`${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}`}
                            toolbar={
                                <TableToolbar
                                    searchValue={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    placeholder="Search guest or hotel…"
                                    onRefresh={() => fetchData(true)}
                                    refreshing={refreshing}
                                />
                            }
                            noPadding
                        >
                            {bookings.length === 0 ? (
                                <EmptyState icon={CalendarCheck} label="No bookings yet" />
                            ) : (() => {
                                const filteredBookings = bookings.filter((b: any) =>
                                    (b.contactName || b.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (b.contactEmail || b.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (b.hotel?.hotelName || b.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase())
                                );
                                return filteredBookings.length === 0 ? (
                                    <EmptyState icon={CalendarCheck} label="No bookings match your search" />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                                                    <th className="px-6 py-3.5 text-left">Guest</th>
                                                    <th className="px-6 py-3.5 text-left">Hotel</th>
                                                    <th className="px-6 py-3.5 text-left">Dates</th>
                                                    <th className="px-6 py-3.5 text-left">Guests</th>
                                                    <th className="px-6 py-3.5 text-left">Total</th>
                                                    <th className="px-6 py-3.5 text-left">Status</th>
                                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredBookings.map((b: any) => (
                                                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                                                                    {(b.contactName || b.user?.name || 'G')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-slate-800 text-sm">{b.contactName || b.user?.name || '—'}</div>
                                                                    <div className="text-xs text-slate-400">{b.contactEmail || b.user?.email || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-800 text-sm">{b.hotel?.hotelName || b.hotelName || '—'}</div>
                                                            <div className="text-xs text-slate-400">{b.hotel?.city || b.city || '—'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-600">
                                                            <div className="font-medium">{fmtDate(b.checkIn)}</div>
                                                            <div className="text-slate-400">→ {fmtDate(b.checkOut)}</div>
                                                            <div className="text-slate-400 mt-0.5">{b.nights} night{b.nights !== 1 ? 's' : ''}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 font-medium">{b.guests}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-800">${b.estimatedTotal}</td>
                                                        <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                                                        <td className="px-6 py-4 text-right">
                                                            {b.status === 'pending' ? (
                                                                <div className="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => setConfirmState({ type: 'confirm-booking', id: b._id })}
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                                                    >
                                                                        <CheckCircle size={12} /> Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectState({ type: 'booking', id: b._id })}
                                                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-red-100"
                                                                    >
                                                                        <XCircle size={12} /> Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">
                                                                    {b.status === 'confirmed' ? '✓ Confirmed' : '✗ Rejected'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })()}
                        </Panel>
                    </>
                )}
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────
    // SECURITY LOGS
    // ────────────────────────────────────────────────────────────
    const renderSecurityLogs = () => {
        const filtered = securityLogs.filter(log =>
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <Panel
                title="Security Audit Trail"
                subtitle="Last 100 system events"
                toolbar={
                    <TableToolbar
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        placeholder="Filter logs..."
                        onRefresh={() => fetchData(true)}
                        refreshing={refreshing}
                    />
                }
                noPadding
            >
                {filtered.length === 0 ? (
                    <EmptyState icon={ShieldAlert} label="No security events found" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5 w-48">Timestamp</th>
                                    <th className="px-6 py-3.5">Actor</th>
                                    <th className="px-6 py-3.5">Action</th>
                                    <th className="px-6 py-3.5">Severity</th>
                                    <th className="px-6 py-3.5 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3.5 text-xs font-mono text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-3.5">
                                            <p className="font-semibold text-slate-700 text-sm">{log.actor}</p>
                                            <p className="text-[10px] text-slate-400">{log.ip}</p>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <StatusBadge
                                                status={log.severity === 'CRITICAL' ? 'rejected' : log.severity === 'WARN' ? 'pending' : 'approved'}
                                                labelOverride={log.severity}
                                            />
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button
                                                onClick={() => { setSelectedItem({ ...log, type: 'log' }); setIsModalOpen(true); }}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                                            >
                                                View data
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        );
    };

    const meta = getPageMeta();
    const pendingVendorsCount = (vendorData?.vendors || []).filter((v: any) => v.status === 'pending' || v.status === 'pending_approval' || v.status === 'unpaid').length;
    const pendingHotelsCount = (hotelData?.hotels || []).filter((h: any) => h.status === 'pending' || h.status === 'pending_approval').length;
    const pendingBookingsCount = (bookingData?.bookings || []).filter((b: any) => b.status === 'pending').length;
    const totalAlerts = pendingVendorsCount + pendingHotelsCount + pendingBookingsCount;

    return (
        <div className="flex h-screen w-full bg-[#f4f6f9] font-sans overflow-hidden">
            <Toaster position="top-right" richColors closeButton />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-[264px] bg-[#161c2d] shrink-0 h-full flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-16 flex items-center px-6 border-b border-white/5 gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-black text-sm">TM</div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">TripMate</p>
                    </div>
                    <button className="ml-auto text-white/40 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 text-white overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
                    <SidebarItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={LayoutDashboard} />

                    <SidebarGroup label="Vendors" icon={Store} expanded={expandedGroups.includes('vendors')} onToggle={() => toggleGroup('vendors')}>
                        <SidebarItem active={activeTab === 'all-vendors'} onClick={() => setActiveTab('all-vendors')} label="All Vendors" icon={FileText} badge={pendingVendorsCount} />
                        {/* <SidebarItem active={activeTab === 'add-vendor'} onClick={() => setActiveTab('add-vendor')} label="Add Vendor" icon={UserPlus} /> */}
                    </SidebarGroup>
 
                    <SidebarGroup label="Hotels" icon={HotelIcon} expanded={expandedGroups.includes('hotels')} onToggle={() => toggleGroup('hotels')}>
                        <SidebarItem active={activeTab === 'hotels' && hotelSubTab === 'listings'} onClick={() => { setHotelSubTab('listings'); setActiveTab('hotels'); }} label="Hotels Listing" icon={CheckCircle} badge={pendingHotelsCount} />
                        <SidebarItem active={activeTab === 'hotels' && hotelSubTab === 'bookings'} onClick={() => { setHotelSubTab('bookings'); setActiveTab('hotels'); }} label="Hotels Bookings" icon={CalendarCheck} badge={pendingBookingsCount} />
                    </SidebarGroup>

                    <SidebarGroup label="Users" icon={Users} expanded={expandedGroups.includes('users')} onToggle={() => toggleGroup('users')}>
                        <SidebarItem active={activeTab === 'user-list'} onClick={() => setActiveTab('user-list')} label="User Directory" icon={Users} />
                    </SidebarGroup>

                    <SidebarGroup label="Financials" icon={DollarSign} expanded={expandedGroups.includes('payments')} onToggle={() => toggleGroup('payments')}>
                        <SidebarItem active={activeTab === 'vendor-payments'} onClick={() => setActiveTab('vendor-payments')} label="Vendor Payments" icon={Calculator} />
                        <SidebarItem active={activeTab === 'user-payments'} onClick={() => setActiveTab('user-payments')} label="User Subscriptions" icon={FileText} />
                        <SidebarItem active={activeTab === 'hotel-payments'} onClick={() => setActiveTab('hotel-payments')} label="Hotel Payments" icon={HotelIcon} />
                    </SidebarGroup>

                    <div className="mt-4 px-4">
                        <p className="text-[10px] font-bold text-white/25 uppercase tracking-[2px] mb-2 px-2">Core Systems</p>
                        <SidebarItem active={activeTab === 'security-logs'} onClick={() => setActiveTab('security-logs')} label="Security Logs" icon={ShieldAlert} />
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all font-semibold text-sm group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Logout Session
                    </button>
                </div>
            </aside>

            {/* Main Container */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <button className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 -ml-1.5" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <meta.icon size={17} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">{meta.title}</h1>
                            <p className="text-[11px] text-slate-400 leading-tight truncate hidden sm:block">{meta.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Bell size={18} className="text-slate-500" />
                                    {totalAlerts > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                                            {totalAlerts > 9 ? '9+' : totalAlerts}
                                        </span>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                                <DropdownMenuLabel>Pending Approvals</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {totalAlerts === 0 ? (
                                    <p className="px-2 py-3 text-sm text-slate-400 text-center">You're all caught up 🎉</p>
                                ) : (
                                    <>
                                        {pendingVendorsCount > 0 && (
                                            <DropdownMenuItem onClick={() => setActiveTab('all-vendors')}>
                                                <Store size={14} className="mr-2 text-blue-600" /> {pendingVendorsCount} vendor{pendingVendorsCount !== 1 ? 's' : ''} awaiting review
                                            </DropdownMenuItem>
                                        )}
                                        {pendingHotelsCount > 0 && (
                                            <DropdownMenuItem onClick={() => { setHotelSubTab('listings'); setActiveTab('hotels'); }}>
                                                <HotelIcon size={14} className="mr-2 text-amber-600" /> {pendingHotelsCount} hotel{pendingHotelsCount !== 1 ? 's' : ''} pending approval
                                            </DropdownMenuItem>
                                        )}
                                        {pendingBookingsCount > 0 && (
                                            <DropdownMenuItem onClick={() => { setHotelSubTab('bookings'); setActiveTab('hotels'); }}>
                                                <CalendarCheck size={14} className="mr-2 text-rose-600" /> {pendingBookingsCount} booking{pendingBookingsCount !== 1 ? 's' : ''} awaiting confirmation
                                            </DropdownMenuItem>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="w-px h-6 bg-slate-200 hidden sm:block" />

                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">AD</div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-bold text-slate-700 leading-tight">Adnan</p>
                                <p className="text-[10px] text-slate-400 leading-tight">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>

            {isModalOpen && <DetailsModal item={selectedItem} onClose={() => setIsModalOpen(false)} />}

            {/* Confirm Dialog (approvals, renewals, deletes) */}
            <AlertDialog open={!!confirmState} onOpenChange={(open: boolean) => !open && setConfirmState(null)}>
                <AlertDialogContent className="bg-white border border-slate-200 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState ? CONFIRM_COPY[confirmState.type].title : ''}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState?.name && <span className="font-semibold text-slate-700">{confirmState.name}</span>}
                            {confirmState?.name && <br />}
                            {confirmState ? CONFIRM_COPY[confirmState.type].description : ''}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executeConfirm}
                            disabled={actionBusy}
                            className={confirmState && CONFIRM_COPY[confirmState.type].destructive ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-300' : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-300'}
                        >
                            {actionBusy ? 'Working…' : (confirmState ? CONFIRM_COPY[confirmState.type].actionLabel : 'Confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog (vendor / booking with reason) */}
            <Dialog open={!!rejectState} onOpenChange={(open: boolean) => { if (!open) { setRejectState(null); setRejectReason(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{rejectState?.type === 'vendor' ? 'Reject Vendor' : 'Reject Booking'}</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejection — this will be emailed to {rejectState?.type === 'vendor' ? 'the vendor' : 'the guest'}.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                        placeholder={rejectState?.type === 'vendor' ? 'e.g. Does not meet our current requirements.' : 'e.g. Hotel fully booked for selected dates.'}
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => { setRejectState(null); setRejectReason(''); }}
                            disabled={actionBusy}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeReject}
                            disabled={actionBusy}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {actionBusy ? 'Rejecting…' : 'Reject & Notify'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
            `}</style>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// Shared building blocks
// ══════════════════════════════════════════════════════════════

const INPUT_CLS = 'w-full border border-slate-200 px-3 py-2.5 rounded-lg outline-none text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors';

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function SidebarGroup({ label, icon: Icon, expanded, onToggle, children }: any) {
    return (
        <div className="mb-1 px-2">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{label}</span>
                </div>
                <ChevronDown size={13} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="py-1 pl-2">{children}</div>
            </div>
        </div>
    );
}

function SidebarItem({ active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] font-semibold ${active ? 'text-white bg-blue-500/15 border border-blue-400/20' : 'text-white/45 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
            <Icon size={14} className={active ? 'text-blue-400' : ''} />
            <span className="flex-1 text-left">{label}</span>
            {!!badge && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatCard({ title, value, icon: Icon, tone = 'slate', trend }: { title: string; value: React.ReactNode; icon: any; tone?: 'blue' | 'violet' | 'amber' | 'emerald' | 'rose' | 'slate'; trend?: string }) {
    const toneMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        slate: 'bg-slate-100 text-slate-500',
    };
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${toneMap[tone]}`}>
                <Icon size={19} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1 truncate">{title}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
                {trend && <p className="text-[11px] text-slate-400 mt-1.5 truncate">{trend}</p>}
            </div>
        </div>
    );
}

function ActionCard({ icon: Icon, tone, title, count, description, onClick }: { icon: any; tone: 'blue' | 'amber' | 'rose'; title: string; count: number; description: string; onClick: () => void }) {
    const toneMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
    };
    return (
        <button onClick={onClick} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>
                    <Icon size={18} />
                </div>
                {count > 0 && (
                    <span className="text-2xl font-black text-slate-800 tracking-tight">{count}</span>
                )}
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{description}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                Review now <ArrowRight size={13} />
            </span>
        </button>
    );
}

function Panel({ title, subtitle, toolbar, action, children, noPadding }: { title: string; subtitle?: string; toolbar?: React.ReactNode; action?: { label: string; onClick: () => void }; children: React.ReactNode; noPadding?: boolean }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                    {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
                </div>
                {toolbar}
                {action && (
                    <button onClick={action.onClick} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        {action.label} <ArrowRight size={12} />
                    </button>
                )}
            </div>
            <div className={noPadding ? '' : 'p-5 sm:p-6'}>{children}</div>
        </div>
    );
}

function TableToolbar({ searchValue, onSearchChange, placeholder, onRefresh, refreshing, filters }: { searchValue: string; onSearchChange: (v: string) => void; placeholder: string; onRefresh: () => void; refreshing?: boolean; filters?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {filters}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-300 focus:border-blue-300 outline-none w-56 transition-all focus:bg-white"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <button
                onClick={onRefresh}
                disabled={refreshing}
                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 border border-slate-200 ${refreshing ? 'opacity-50' : ''}`}
                title="Refresh"
            >
                <RotateCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
        </div>
    );
}

function RowActions({ children }: { children: React.ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                    <MoreHorizontal size={16} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                <Icon size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">{label}</p>
        </div>
    );
}

function EmptyRow({ label }: { label: string }) {
    return (
        <div className="py-8 flex items-center gap-2 justify-center text-slate-400 text-sm">
            <Inbox size={15} /> {label}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-[86px] animate-pulse flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-2.5 bg-slate-100 rounded w-2/3" />
                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-slate-50 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

function DetailsModal({ item, onClose }: { item: any; onClose: () => void }) {
    if (!item) return null;

    const isVendor = item.type === 'vendor';
    const isLog = item.type === 'log';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">
                            {isLog ? 'Security Event Details' : (isVendor ? 'Vendor Profile' : 'User Profile')}
                        </h3>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Record ID: {item._id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8">
                    {/* Header Info */}
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100">
                            {isLog ? <ShieldAlert size={28} className="text-red-500" /> : (isVendor ? <Store size={26} className="text-blue-500" /> : <User size={26} className="text-blue-500" />)}
                        </div>
                        <div className="space-y-1 min-w-0">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight truncate">
                                {isLog ? item.action.replace(/_/g, ' ') : (item.companyName || item.name)}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium truncate">{isLog ? `Triggered by ${item.actor}` : item.email}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {isLog ? (
                                    <StatusBadge status={item.severity === 'CRITICAL' ? 'rejected' : 'pending'} labelOverride={`${item.severity} severity`} />
                                ) : (
                                    <>
                                        <StatusBadge status={item.status || item.subscriptionStatus} />
                                        {item.paid && <StatusBadge status="paid" labelOverride="Paid member" />}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isLog ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Record Overview</h4>
                                <div className="space-y-3">
                                    <DetailItem label={isVendor ? 'Business Type' : 'Account Type'} value={item.vendorType || (item.subscriptionStatus === 'paid' ? 'Premium' : 'Standard')} />
                                    <DetailItem label="Joined Platform" value={item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} />
                                    {isVendor && <DetailItem label="Operating City" value={item.city || 'Not specified'} />}
                                    {isVendor && <DetailItem label="Budget Range" value={`$${item.budgetMin} - $${item.budgetMax}`} />}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Event Metadata</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DetailItem label="Actor" value={item.actor} />
                                <DetailItem label="IP Address" value={item.ip || 'Unknown'} isCode />
                                <DetailItem label="Timestamp" value={new Date(item.createdAt).toLocaleString()} />
                                <DetailItem label="Severity" value={item.severity} />
                            </div>
                        </div>
                    )}

                    {isVendor && !isLog && (
                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Offered Services</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.services?.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{s}</span>
                                    ))}
                                    {item.customServices?.map((s: string) => (
                                        <span key={s} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Bio</h4>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                    "{item.aboutUs || 'No description provided.'}"
                                </p>
                            </div>

                            {item.branches?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Branch Network ({item.branches.length})</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {item.branches.map((b: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg font-semibold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px]">{i + 1}</span>
                                                    <span className="text-slate-800">{b.name}</span>
                                                </div>
                                                <span className="text-slate-400 font-normal">{b.location} • {b.phone}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isCode }: { label: string; value: string; isCode?: boolean }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm font-semibold ${isCode ? 'font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded w-fit' : 'text-slate-700'}`}>
                {value}
            </p>
        </div>
    );
}
