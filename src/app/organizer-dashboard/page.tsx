'use client';

import { useEffect, useState, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { partnerApi, eventsApi, playApi, diningApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Pencil, Eye, ArrowLeft, Utensils, Trophy, Ticket, ShieldCheck, Clock, Trash2, RefreshCw } from 'lucide-react';

interface ListingItem {
    id: string;
    title?: string;
    name?: string;
    slug?: string;
    status?: string;
    rejection_reason?: string;
    images?: { hero?: string; poster?: string };
    location?: { city?: string };
    venue?: { city?: string };
}

function OrganizerDashboardContent() {
    const { token, organizerCategories } = useStore();
    const { isLoggedIn, isOrganizer, isAdmin, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawCategory = searchParams.get('category') || 'event';
    // Normalize event sub-types (creator, individual, company, non-profit) to 'event'
    const EVENT_SUBTYPES = ['creator', 'individual', 'company', 'non-profit'];
    const activeCategory = EVENT_SUBTYPES.includes(rawCategory) ? 'event' : rawCategory;

    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [allProfiles, setAllProfiles] = useState<any[]>([]);
    const [listings, setListings] = useState<ListingItem[]>([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: ListingItem | null }>({
        isOpen: false,
        item: null
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [resubmittingId, setResubmittingId] = useState<string | null>(null);

    // Category config
    const categoryConfig: Record<string, {
        label: string; icon: React.ReactNode; color: string; bgColor: string;
        createPath: string; editPath: (id: string) => string; viewPath: (item: ListingItem) => string;
        createLabel: string; editLabel: string; viewLabel: string;
        itemTitle: (item: ListingItem) => string; itemImage: (item: ListingItem) => string;
        itemCity: (item: ListingItem) => string;
    }> = {
        event: {
            label: 'Events',
            icon: <Ticket size={20} />,
            color: '#5331EA',
            bgColor: 'rgba(83, 49, 234, 0.08)',
            createPath: '/list-your-events/dashboard/create',
            editPath: (id) => `/list-your-events/dashboard/create?id=${id}`,
            viewPath: (item) => `/events/${item.id}`,
            createLabel: 'Create Event',
            editLabel: 'Edit',
            viewLabel: 'View',
            itemTitle: (item) => item.title || 'Untitled Event',
            itemImage: (item) => item.images?.hero || item.images?.poster || '',
            itemCity: (item) => item.venue?.city || '',
        },
        play: {
            label: 'Play / Courts',
            icon: <Trophy size={20} />,
            color: '#E7C200',
            bgColor: 'rgba(231, 194, 0, 0.08)',
            createPath: '/list-your-events/dashboard/create-play',
            editPath: (id) => `/list-your-events/dashboard/create-play?id=${id}`,
            viewPath: (item) => `/play/${item.slug || item.id}`,
            createLabel: 'Create Turf/Court',
            editLabel: 'Edit',
            viewLabel: 'View',
            itemTitle: (item) => item.name || 'Untitled Venue',
            itemImage: (item) => item.images?.hero || '',
            itemCity: (item) => item.location?.city || '',
        },
        dining: {
            label: 'Dining',
            icon: <Utensils size={20} />,
            color: '#FF6B35',
            bgColor: 'rgba(255, 107, 53, 0.08)',
            createPath: '/list-your-events/dashboard/create-dining',
            editPath: (id) => `/list-your-events/dashboard/create-dining?id=${id}`,
            viewPath: (item) => `/dining/venue/${item.slug || item.id}`,
            createLabel: 'Create Restaurant',
            editLabel: 'Edit',
            viewLabel: 'View',
            itemTitle: (item) => item.name || 'Untitled Restaurant',
            itemImage: (item) => item.images?.hero || '',
            itemCity: (item) => item.location?.city || '',
        },
    };

    const currentConfig = categoryConfig[activeCategory] || categoryConfig.event;

    const findProfileForCategory = (cat: string, profiles: any[]) => {
        const normalizedCat = EVENT_SUBTYPES.includes(cat) ? 'event' : cat;
        return profiles.find((p: any) => {
            const profileCat = p.organization_details?.category;
            if (normalizedCat === 'event') {
                return ['event', 'creator', 'individual', 'company', 'non-profit'].includes(profileCat);
            }
            return profileCat === normalizedCat;
        });
    };

    const isVerifiedForCategory = (cat: string) => {
        // Normalize category for verification check
        const normalizedCat = EVENT_SUBTYPES.includes(cat) ? 'event' : cat;

        // Backend profiles are the source of truth — check them first
        if (allProfiles.length > 0) {
            const profile = findProfileForCategory(normalizedCat, allProfiles);
            if (profile) return profile.status === 'approved';
            // No profile found for this category → not verified
            return false;
        }

        // Fallback to local store when profiles haven't loaded yet
        return organizerCategories.includes(normalizedCat) ||
            (normalizedCat === 'event' && organizerCategories.some(c => ['event', 'creator', 'individual', 'company', 'non-profit'].includes(c)));
    };

    // Only treat as verified if this specific category is approved
    const verifiedForActive = isVerifiedForCategory(activeCategory);

    const fetchListingsData = async () => {
        if (!verifiedForActive || !token) {
            setListings([]);
            return;
        }

        setListingsLoading(true);
        setListingsError(null);
        try {
            let response;
            if (activeCategory === 'event') {
                response = await partnerApi.getMyEvents();
            } else if (activeCategory === 'play') {
                response = await partnerApi.getMyPlayVenues();
            } else if (activeCategory === 'dining') {
                response = await partnerApi.getMyDiningVenues();
            }

            console.log(`[OrganizerDashboard] ${activeCategory} API response:`, response);

            if (response?.success && response.data) {
                const items = response.data.items || response.data || [];
                setListings(Array.isArray(items) ? items : []);
            } else {
                setListings([]);
                if (response && !response.success) {
                    setListingsError(response.message || 'Failed to load listings');
                }
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            setListingsError('Failed to load listings. Please try again.');
            setListings([]);
        } finally {
            setListingsLoading(false);
        }
    };

    const handleResubmit = async (item: ListingItem) => {
        if (!token) return;
        setResubmittingId(item.id);
        try {
            let response;
            if (activeCategory === 'event') {
                response = await eventsApi.resubmit(item.id);
            } else if (activeCategory === 'play') {
                response = await playApi.resubmit(item.id);
            } else if (activeCategory === 'dining') {
                response = await diningApi.resubmit(item.id);
            }
            if (response?.success) {
                setListings(prev => prev.map(i =>
                    i.id === item.id ? { ...i, status: 'pending', rejection_reason: undefined } : i
                ));
            } else {
                alert(response?.message || 'Failed to resubmit. Please try again.');
            }
        } catch (error) {
            console.error('Resubmit error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setResubmittingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.item || !token) return;

        setIsDeleting(true);
        try {
            let response;
            if (activeCategory === 'event') {
                response = await eventsApi.delete(deleteModal.item.id);
            } else if (activeCategory === 'play') {
                response = await playApi.delete(deleteModal.item.id);
            } else if (activeCategory === 'dining') {
                response = await diningApi.delete(deleteModal.item.id);
            }

            if (response?.success) {
                // Remove from local state
                setListings(prev => prev.filter(item => item.id !== deleteModal.item?.id));
                setDeleteModal({ isOpen: false, item: null });
            } else {
                alert(response?.message || 'Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        // Wait for auth to finish loading before making any redirect decisions
        if (authLoading) return;

        if (!isLoggedIn || !token) {
            router.push('/list-your-events');
            return;
        }

        // Allow admins who are also organizers to stay on the dashboard
        // Only redirect pure admins who have no organizer categories
        if (isAdmin && !isOrganizer && organizerCategories.length === 0) {
            router.push('/admin');
            return;
        }

        setLoading(true); // Reset loading on category change

        const fetchStatus = async () => {
            try {
                const response = await partnerApi.getMyStatus();
                if (response.success && response.data) {
                    const profiles = response.data.profiles || [];
                    setAllProfiles(profiles);

                    const currentProfile = findProfileForCategory(activeCategory, profiles);
                    const status = currentProfile ? currentProfile.status : null;
                    setVerificationStatus(status);

                    // Sync store: only add categories that are actually approved
                    if (profiles.length > 0) {
                        const approvedCats = profiles
                            .filter((p: any) => p.status === 'approved')
                            .map((p: any) => p.organization_details?.category)
                            .filter(Boolean);
                        if (approvedCats.length > 0) {
                            useStore.getState().setOrganizerCategories(approvedCats);
                        }
                    }
                } else {
                    setVerificationStatus(null);
                    setAllProfiles([]);
                }
            } catch (error) {
                console.error('Error fetching status:', error);
                setVerificationStatus(null);
                setAllProfiles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [authLoading, isLoggedIn, token, isAdmin, isOrganizer, activeCategory, router, organizerCategories.length]);

    // Fetch listings when verified for active category
    useEffect(() => {
        fetchListingsData();
    }, [verifiedForActive, activeCategory, token]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-zinc-500 font-medium font-[family-name:var(--font-anek-latin)]">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const allCategories = ['event', 'play', 'dining'];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <div className="bg-white border-b border-zinc-200 sticky top-16 z-40">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push('/play')} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                                <ArrowLeft size={20} className="text-zinc-500" />
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Partner Dashboard</h1>
                                <p className="text-sm text-zinc-500">Manage your listings across categories</p>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1 pb-0 overflow-x-auto scrollbar-hide">
                        {allCategories.map(cat => {
                            const config = categoryConfig[cat];
                            const isActive = activeCategory === cat;
                            const isVerified = isVerifiedForCategory(cat);
                            const categoryProfile = findProfileForCategory(cat, allProfiles);
                            const isPending = categoryProfile?.status === 'pending' || categoryProfile?.status === 'under_review';

                            return (
                                <button
                                    key={cat}
                                    onClick={() => router.push(`/organizer-dashboard?category=${cat}`)}
                                    className={`flex items-center gap-2 px-5 py-3 text-[15px] font-semibold whitespace-nowrap transition-all border-b-2 ${isActive
                                        ? 'text-zinc-900'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:border-zinc-200'
                                        }`}
                                    style={isActive ? { borderBottomColor: config.color } : {}}
                                >
                                    {config.icon}
                                    {config.label}
                                    {isVerified ? (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 uppercase tracking-tighter ml-1">
                                            <ShieldCheck size={10} />
                                            Verified
                                        </span>
                                    ) : isPending ? (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 uppercase tracking-tighter ml-1">
                                            <Clock size={10} />
                                            Pending
                                        </span>
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-zinc-200 ml-1" title="Not started for this category"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                {loading ? (
                    <div className="bg-white rounded-2xl border border-zinc-200 p-12 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-3 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4" />
                        <p className="text-zinc-400 text-sm font-medium">Loading {currentConfig.label} status...</p>
                    </div>
                ) : !verifiedForActive ? (
                    verificationStatus === 'pending' || verificationStatus === 'under_review' ? (
                        /* Under Review */
                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-50 mx-auto mb-4 flex items-center justify-center">
                                <Clock size={32} className="text-amber-500" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 mb-2">Account Review Pending</h2>
                            <p className="text-zinc-500 mb-2 max-w-md mx-auto">
                                Your {currentConfig.label} verification is being reviewed by our team. You&apos;ll be notified via email once approved.
                            </p>
                            <p className="text-sm text-zinc-400">This typically takes 24-48 hours. Please wait for admin approval.</p>
                        </div>
                    ) : (
                        /* Not verified - show Become X Organizer */
                        <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-12 text-center">
                            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white"
                                style={{ backgroundColor: currentConfig.color }}>
                                {currentConfig.icon}
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 mb-2">Become a {currentConfig.label} Organizer</h2>
                            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                                You&apos;re not registered for {currentConfig.label} yet. Complete the verification process to start creating and managing {currentConfig.label.toLowerCase()} listings.
                            </p>
                            <button
                                onClick={() => router.push(`/list-your-events/setup?category=${activeCategory}`)}
                                className="px-6 py-3 rounded-full text-white font-bold text-[15px] transition-all hover:opacity-90 shadow-sm"
                                style={{ backgroundColor: currentConfig.color }}
                            >
                                Become {currentConfig.label} Organizer
                            </button>
                        </div>
                    )
                ) : (
                    /* Verified - Show Create + Listings */
                    <div className="space-y-6">
                        {/* Create Button */}
                        <Link
                            href={currentConfig.createPath}
                            className="group flex items-center gap-4 bg-white rounded-2xl border-2 border-dashed border-zinc-200 p-6 hover:border-zinc-400 hover:shadow-sm transition-all"
                        >
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-md"
                                style={{ backgroundColor: currentConfig.color }}
                            >
                                <Plus size={26} />
                            </div>
                            <div>
                                <h3 className="text-[17px] font-bold text-zinc-900">{currentConfig.createLabel}</h3>
                                <p className="text-sm text-zinc-400">Add a new listing to your portfolio</p>
                            </div>
                        </Link>

                        {/* Listings */}
                        {listingsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: currentConfig.color, borderTopColor: 'transparent' }}></div>
                            </div>
                        ) : listingsError ? (
                            <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
                                <p className="text-red-500 text-[15px] mb-4">{listingsError}</p>
                                <button
                                    onClick={fetchListingsData}
                                    className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-white transition-all hover:opacity-90"
                                    style={{ backgroundColor: currentConfig.color }}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center">
                                <p className="text-zinc-400 text-[15px]">
                                    No {currentConfig.label.toLowerCase()} listings yet. Create your first one!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-[15px] font-bold text-zinc-500 uppercase tracking-wider px-1">
                                    Your {currentConfig.label} ({listings.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {listings.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-md transition-all group relative"
                                        >
                                            {/* Image */}
                                            <div className="h-36 bg-zinc-100 relative overflow-hidden">
                                                {currentConfig.itemImage(item) ? (
                                                    <img
                                                        src={currentConfig.itemImage(item)}
                                                        alt={currentConfig.itemTitle(item)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                        {currentConfig.icon}
                                                    </div>
                                                )}
                                                {/* Status badge */}
                                                {item.status && (
                                                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'active' || item.status === 'approved'
                                                        ? 'bg-green-500 text-white'
                                                        : item.status === 'pending'
                                                            ? 'bg-amber-500 text-white'
                                                            : 'bg-zinc-500 text-white'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4">
                                                <h4 className="text-[15px] font-bold text-zinc-900 mb-1 truncate">
                                                    {currentConfig.itemTitle(item)}
                                                </h4>
                                                {currentConfig.itemCity(item) && (
                                                    <p className="text-xs text-zinc-400 mb-2">{currentConfig.itemCity(item)}</p>
                                                )}

                                                {item.status === 'rejected' && item.rejection_reason && (
                                                    <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                                                        <p className="text-[11px] font-bold text-red-600 uppercase mb-0.5">Rejection Reason:</p>
                                                        <p className="text-xs text-red-500 line-clamp-2">{item.rejection_reason}</p>
                                                    </div>
                                                )}

                                                {item.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleResubmit(item)}
                                                        disabled={resubmittingId === item.id}
                                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                                                        style={{ backgroundColor: currentConfig.color }}
                                                    >
                                                        {resubmittingId === item.id ? (
                                                            <>
                                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Resubmitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RefreshCw size={13} />
                                                                Resubmit for Review
                                                            </>
                                                        )}
                                                    </button>
                                                )}

                                                <div className="flex items-center justify-between mb-3">
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, item })}
                                                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-auto"
                                                        title="Delete listing"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={currentConfig.editPath(item.id)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all border hover:shadow-sm"
                                                        style={{
                                                            color: currentConfig.color,
                                                            borderColor: currentConfig.color,
                                                            backgroundColor: currentConfig.bgColor,
                                                        }}
                                                    >
                                                        <Pencil size={14} />
                                                        {currentConfig.editLabel}
                                                    </Link>
                                                    <Link
                                                        href={currentConfig.viewPath(item)}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold text-zinc-600 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all hover:shadow-sm"
                                                    >
                                                        <Eye size={14} />
                                                        {currentConfig.viewLabel}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-extrabold text-zinc-900 mb-2">Delete Listing?</h3>
                            <p className="text-zinc-500 text-[15px] mb-8">
                                Are you sure you want to delete <span className="font-bold text-zinc-800">&quot;{currentConfig.itemTitle(deleteModal.item!)}&quot;</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, item: null })}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 text-zinc-600 font-bold text-[15px] hover:bg-zinc-200 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-white font-bold text-[15px] hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Deleting...
                                        </>
                                    ) : 'Delete Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrganizerDashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-[#5331EA] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <OrganizerDashboardContent />
        </Suspense>
    );
}
