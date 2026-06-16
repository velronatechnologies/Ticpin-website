'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, PlusCircle, Upload, Search, ArrowLeft, Trash2, Info, ExternalLink, Edit2 } from 'lucide-react';
import { CATEGORIES, CITIES, CATEGORY_DATA } from '@/app/play/create/data';
import { useRouter, useParams, notFound } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { uploadMedia } from '@/lib/api/admin';
import { playApi } from '@/lib/api/play';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';

export default function EditPlayPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const editorRef = useRef<HTMLDivElement>(null);

    const [loadingData, setLoadingData] = useState(true);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    const [venueName, setVenueName] = useState('');
    const [venueAddress, setVenueAddress] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    const [googleMapLink, setGoogleMapLink] = useState('');
    const [openingTime, setOpeningTime] = useState(''); // legacy combined
    const [timeHour, setTimeHour] = useState('');
    const [timeMinute, setTimeMinute] = useState('');
    const [timePeriod, setTimePeriod] = useState('');
    const [closeHour, setCloseHour] = useState('');
    const [closeMinute, setCloseMinute] = useState('');
    const [closePeriod, setClosePeriod] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');
    const [landscapeUrl, setLandscapeUrl] = useState('');
    const [secondaryBannerUrl, setSecondaryBannerUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    
    const [facilities, setFacilities] = useState<string[]>([]);
    const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState(false);
    const [petFriendly, setPetFriendly] = useState('');
    const [maxDuration, setMaxDuration] = useState('');
    const [outsideFood, setOutsideFood] = useState('');
    const [venueLocationType, setVenueLocationType] = useState('');
    const [surfaceType, setSurfaceType] = useState('');
    const [cancellations, setCancellations] = useState('');
    const [changingRooms, setChangingRooms] = useState('');
    const [equipmentRentals, setEquipmentRentals] = useState('');
    
    const FACILITIES_OPTIONS = ['Parking', 'Changing Rooms', 'Showers', 'Equipment Rental', 'Cafeteria', 'Locker', 'First Aid', 'WiFi', 'Seating Area', 'Restrooms'];

    const toggleFacility = (facility: string) => {
        setFacilities(prev =>
            prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
        );
    };

    const [payment, setPayment] = useState({ organizerName: '', gstin: '', accountNumber: '', ifsc: '', accountType: '' });
    const [pocs, setPocs] = useState<{ name: string; email: string; mobile: string }[]>([]);
    const [salesNotifs, setSalesNotifs] = useState<{ email: string; mobile: string }[]>([]);
    const [newPoc, setNewPoc] = useState({ name: '', email: '', mobile: '' });
    const [newSales, setNewSales] = useState({ email: '', mobile: '' });

    // Pre-fill inputs when data exists
    useEffect(() => {
        if (pocs.length > 0) {
            setNewPoc(pocs[0]);
        } else {
            setNewPoc({ name: '', email: '', mobile: '' });
        }
    }, [pocs]);

    useEffect(() => {
        if (salesNotifs.length > 0) {
            setNewSales(salesNotifs[0]);
        } else {
            setNewSales({ email: '', mobile: '' });
        }
    }, [salesNotifs]);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showYoutube, setShowYoutube] = useState(false);
    const [showProhibited, setShowProhibited] = useState(false);
    const [showFaqs, setShowFaqs] = useState(false);
    const [playInstructions, setPlayInstructions] = useState('');
    const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
    const [prohibitedItems, setProhibitedItems] = useState<string[]>([]);
    const [newProhibitedItem, setNewProhibitedItem] = useState('');
    const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    // Courts State
    const [courts, setCourts] = useState<{ name: string; type: string; price: string; image_url: string }[]>([]);
    const [newCourt, setNewCourt] = useState({ name: '', type: '', price: '', image_url: '' });
    const [editingCourtIndex, setEditingCourtIndex] = useState<number | null>(null);

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [replacingGalleryIndex, setReplacingGalleryIndex] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [originalData, setOriginalData] = useState<Record<string, any>>({});
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState({ city: '' });
    const [selections, setSelections] = useState({ category: 'Select Sport', subCategory: 'Select Court Type', city: 'Select City' });
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isViewMode, setIsViewMode] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!hasCheckedSession) return;

        const load = async () => {
            let session = getOrganizerSession();
            if (!session) { router.replace('/'); return; }

            // If not approved and not admin, re-sync from DB once to be sure
            if (!session.isAdmin && session.categoryStatus?.play !== 'approved') {
                try {
                    const me = await organizerApi.getMe();
                    // Add small delay to ensure cookies are updated
                    await new Promise(resolve => setTimeout(resolve, 100));
                    // Re-read session after cookies are updated
                    session = getOrganizerSession() || session;
                } catch { /* ignore sync error */ }
            }

            if (!session.isAdmin && session.categoryStatus?.play !== 'approved') {
                setAuthChecked(false);
                return;
            }
            setAuthChecked(true);
            try {
                const d = await playApi.getByID(id) as Record<string, unknown>;
                // Store original data for change detection
                setOriginalData(d);

                setVenueName((d.name as string) ?? '');
                if (editorRef.current) editorRef.current.innerHTML = (d.description as string) ?? '';
                setHasContent(!!d.description);
                setVenueAddress((d.venue_address as string) ?? '');
                setInstagramLink((d.instagram_link as string) ?? '');
                setGoogleMapLink((d.google_map_link as string) ?? '');
                setOpeningTime((d.time as string) ?? '');
                
                // Parse opening_time
                const opTime = (d.opening_time as string) ?? '';
                const opMatch = opTime.match(/(\d+):(\d+)\s+(AM|PM)/i);
                if (opMatch) {
                    setTimeHour(opMatch[1]);
                    setTimeMinute(opMatch[2]);
                    setTimePeriod(opMatch[3].toUpperCase());
                }

                // Parse closing_time
                const clTime = (d.closing_time as string) ?? '';
                const clMatch = clTime.match(/(\d+):(\d+)\s+(AM|PM)/i);
                if (clMatch) {
                    setCloseHour(clMatch[1]);
                    setCloseMinute(clMatch[2]);
                    setClosePeriod(clMatch[3].toUpperCase());
                }
                
                setPortraitUrl((d.portrait_image_url as string) ?? '');
                setLandscapeUrl((d.landscape_image_url as string) ?? '');
                setSecondaryBannerUrl((d.secondary_banner_url as string) ?? '');
                setVideoUrl((d.card_video_url as string) ?? '');
                setGalleryUrls((d.gallery_urls as string[]) ?? []);
                
                const g = (d.guide as Record<string, unknown>) ?? {};
                setFacilities((g.facilities as string[]) ?? []);
                setPetFriendly(g.is_pet_friendly ? 'Yes' : 'No');
                setOutsideFood(g.outside_food_allowed ? 'Yes' : 'No');
                setCancellations(g.cancellations_allowed ? 'Yes' : 'No');
                setChangingRooms(g.changing_rooms_available ? 'Yes' : 'No');
                setEquipmentRentals(g.equipment_rentals_available ? 'Yes' : 'No');
                setVenueLocationType((g.venue_location_type as string) ?? '');
                setSurfaceType((g.surface_type as string) ?? '');
                setMaxDuration((g.max_duration as string) ?? '');
                const p = (d.payment as Record<string, unknown>) ?? {};
                const loadedPayment = {
                    organizerName: (p.organizer_name as string) ?? '',
                    gstin: (p.gstin as string) ?? '',
                    accountNumber: (p.account_number as string) ?? '',
                    ifsc: (p.ifsc as string) ?? '',
                    accountType: (p.account_type as string) ?? '',
                };
                // If existing payment data is present, show as verified
                const hasExistingPayment = !!(loadedPayment.accountNumber || loadedPayment.ifsc || loadedPayment.gstin);
                if (hasExistingPayment) {
                    setPayment(loadedPayment);
                    setPaymentVerified(true);
                } else {
                    // Try fetching from verified organizer setup
                    try {
                        const setup = await organizerApi.getExistingSetup('play');
                        const hasSetup = !!(setup.bankAccountNo || setup.bankIfsc || setup.gstNumber || setup.pan);
                        setPayment({
                            organizerName: setup.accountHolder || setup.panName || loadedPayment.organizerName || session.email.split('@')[0],
                            gstin: setup.gstNumber || setup.pan || '',
                            accountNumber: setup.bankAccountNo || '',
                            ifsc: setup.bankIfsc || '',
                            accountType: loadedPayment.accountType,
                        });
                        setPaymentVerified(hasSetup);
                    } catch {
                        setPayment(loadedPayment);
                    }
                }
                setPocs(((d.points_of_contact as { name: string; email: string; mobile: string }[]) ?? []));
                setSalesNotifs(((d.sales_notifications as { email: string; mobile: string }[]) ?? []));
                const instructions = (d.event_instructions as string) ?? '';
                if (instructions) { setPlayInstructions(instructions); setShowInstructions(true); }
                const yt = (d.youtube_video_url as string) ?? '';
                if (yt) { setYoutubeVideoUrl(yt); setShowYoutube(true); }
                const pi = (d.prohibited_items as string[]) ?? [];
                if (pi.length) { setProhibitedItems(pi); setShowProhibited(true); }
                const faqList = (d.faqs as { question: string; answer: string }[]) ?? [];
                if (faqList.length) { setFaqs(faqList); setShowFaqs(true); }
                const cat = (d.category as string) ?? '';
                const sub = (d.sub_category as string) ?? '';
                const city = (d.city as string) ?? '';
                setSelections({
                    category: cat || 'Select Sport',
                    subCategory: sub || 'Select Court Type',
                    city: city || 'Select City',
                });

                const courtsData = (d.courts as { name: string; type: string; price: number; image_url?: string }[]) ?? [];
                setCourts(courtsData.map(c => ({
                    name: c.name,
                    type: c.type,
                    price: c.price.toString(),
                    image_url: c.image_url ?? ''
                })));
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Failed to load listing';
                // Check if play not found (404) - redirect to 404 page
                if (errorMsg.toLowerCase().includes('not found') || errorMsg.includes('404')) {
                    notFound();
                    return;
                }
                setSubmitMsg(errorMsg);
            } finally {
                setLoadingData(false);
            }
        };
        load();
    }, [id, router, hasCheckedSession]);

    // Separate effect to handle editor innerHTML once data is loaded and ref is available
    useEffect(() => {
        if (!loadingData && editorRef.current && originalData.description) {
            editorRef.current.innerHTML = originalData.description;
            setHasContent(true);
        }
    }, [loadingData, originalData.description]);

    // Check if any changes have been made
    const checkChanges = useCallback(() => {
        if (!originalData || Object.keys(originalData).length === 0) return;

        const currentData = {
            name: venueName,
            description: editorRef.current?.innerHTML || '',
            venue_address: venueAddress,
            instagram_link: instagramLink,
            google_map_link: googleMapLink,
            time: openingTime,
            opening_time: timeHour && timeMinute && timePeriod ? `${timeHour}:${timeMinute} ${timePeriod}` : '',
            closing_time: closeHour && closeMinute && closePeriod ? `${closeHour}:${closeMinute} ${closePeriod}` : '',
            portrait_image_url: portraitUrl,
            landscape_image_url: landscapeUrl,
            secondary_banner_url: secondaryBannerUrl,
            card_video_url: videoUrl,
            gallery_urls: galleryUrls,
            event_instructions: playInstructions,
            youtube_video_url: youtubeVideoUrl,
            prohibited_items: prohibitedItems,
            faqs: faqs,
            category: selections.category === 'Select Sport' ? '' : selections.category,
            sub_category: selections.subCategory === 'Select Court Type' ? '' : selections.subCategory,
            city: selections.city === 'Select City' ? '' : selections.city,
            points_of_contact: pocs,
            sales_notifications: salesNotifs,
            courts: courts.map(c => ({ ...c, price: Number(c.price) }))
        };

        const hasFieldChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);
        setHasChanges(hasFieldChanges);
    }, [originalData, venueName, venueAddress, instagramLink, googleMapLink, openingTime, timeHour, timeMinute, timePeriod, closeHour, closeMinute, closePeriod,
        portraitUrl, landscapeUrl, secondaryBannerUrl, videoUrl, galleryUrls, playInstructions, youtubeVideoUrl,
        prohibitedItems, faqs, selections, pocs, salesNotifs, courts]);

    // Update hasChanges whenever any field changes
    useEffect(() => {
        checkChanges();
    }, [checkChanges]);

    if (!authChecked && hasCheckedSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF8D6] via-white to-white">
                <div className="bg-white rounded-[24px] p-10 shadow-lg max-w-md text-center space-y-4">
                    <h2 className="text-[24px] font-semibold text-black">Access Restricted</h2>
                    <p className="text-[16px] text-zinc-500">Your play registration must be approved by the admin before you can edit listings.</p>
                    <button onClick={() => router.back()} className="bg-black text-white px-6 h-10 rounded-[12px] text-[14px] font-medium">Go Back</button>
                </div>
            </div>
        );
    }

    const handleUpload = async (key: string, file: File, multi = false) => {
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            if (multi && key === 'gallery') setGalleryUrls(prev => [...prev, url]);
            else if (key === 'portrait') setPortraitUrl(url);
            else if (key === 'landscape') setLandscapeUrl(url);
            else if (key === 'secondary_banner') setSecondaryBannerUrl(url);
            else if (key === 'video') setVideoUrl(url);
            else if (key === 'court_image') setNewCourt(prev => ({ ...prev, image_url: url }));
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const handleReplaceGalleryImage = async (file: File, index: number) => {
        setUploading(u => ({ ...u, gallery_replace: true }));
        try {
            const url = await uploadMedia(file);
            setGalleryUrls(prev => prev.map((item, idx) => (idx === index ? url : item)));
        } catch {
            toast.error('Upload failed. Try again.');
        } finally {
            setUploading(u => ({ ...u, gallery_replace: false }));
            setReplacingGalleryIndex(null);
        }
    };

    const makeUploadInput = (key: string, accept: string, multi = false) => (
        <input type="file" accept={accept} className="hidden" id={`upload-${key}`}
            onChange={e => { const f = e.target.files?.[0]; if (f) { handleUpload(key, f, multi); e.target.value = ''; } }} />
    );

    const handleSubmit = async () => {
        const session = getOrganizerSession();
        if (!session) return;
        if (!venueName.trim()) { setSubmitMsg('Venue name is required.'); return; }
        if (selections.category === 'Select Sport') { setSubmitMsg('Please select a sport.'); return; }
        if (!portraitUrl || !landscapeUrl) { setSubmitMsg('Please upload both portrait and landscape images.'); return; }
        if (galleryUrls.length < 3) { setSubmitMsg('Please upload at least 3 gallery images.'); return; }
        setSubmitLoading(true); setSubmitMsg('');
        try {
            await playApi.update(id, {
                name: venueName.trim(),
                description: editorRef.current?.innerHTML ?? '',
                category: selections.category,
                sub_category: selections.subCategory === 'Select Court Type' ? '' : selections.subCategory,
                city: selections.city === 'Select City' ? '' : selections.city,
                time: (timeHour && closeHour) ? `${timeHour}:${timeMinute} ${timePeriod} - ${closeHour}:${closeMinute} ${closePeriod}` : openingTime,
                opening_time: timeHour && timeMinute && timePeriod ? `${timeHour}:${timeMinute} ${timePeriod}` : '',
                closing_time: closeHour && closeMinute && closePeriod ? `${closeHour}:${closeMinute} ${closePeriod}` : '',
                venue_name: venueName.trim(),
                venue_address: venueAddress,
                google_map_link: googleMapLink,
                instagram_link: instagramLink,
                portrait_image_url: portraitUrl,
                landscape_image_url: landscapeUrl,
                secondary_banner_url: secondaryBannerUrl,
                card_video_url: videoUrl,
                gallery_urls: galleryUrls,
                guide: {
                    facilities: facilities,
                    is_pet_friendly: petFriendly === 'Yes',
                    outside_food_allowed: outsideFood === 'Yes',
                    venue_location_type: venueLocationType,
                    surface_type: surfaceType,
                    cancellations_allowed: cancellations === 'Yes',
                    changing_rooms_available: changingRooms === 'Yes',
                    equipment_rentals_available: equipmentRentals === 'Yes',
                    max_duration: maxDuration,
                },
                event_instructions: playInstructions,
                youtube_video_url: youtubeVideoUrl,
                prohibited_items: prohibitedItems,
                faqs,
                payment: {
                    organizer_name: payment.organizerName,
                    gstin: payment.gstin,
                    account_number: payment.accountNumber,
                    ifsc: payment.ifsc,
                    account_type: payment.accountType,
                },
                courts: courts.map(c => ({
                    name: c.name,
                    type: c.type,
                    price: parseFloat(c.price),
                    image_url: c.image_url
                })),
                price_starts_from: courts.length > 0 ? Math.min(...courts.map(c => parseFloat(c.price) || 0)) : 0,
                points_of_contact: pocs,
                sales_notifications: salesNotifs,
            });
            setSubmitMsg('✅ Venue updated successfully!');
            setHasChanges(false);
            setTimeout(() => router.push(`/play/edit/${id}/format`), 1800);
        } catch (err) {
            setSubmitMsg(err instanceof Error ? err.message : 'Update failed.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleDropdown = (name: string) => {
        if (openDropdown === name) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(name);
            // Clear search when opening dropdown
            setDropdownSearch(prev => ({ ...prev, [name]: '' }));
        }
    };
    const handleSelect = (name: string, value: string) => {
        setSelections(prev => {
            const n = { ...prev, [name]: value };
            if (name === 'category') n.subCategory = 'Select Court Type';
            return n;
        });
        setOpenDropdown(null);
        // Clear search when selecting an item
        setDropdownSearch(prev => ({ ...prev, [name]: '' }));
    };
    const addPoc = () => { if (!newPoc.name || !newPoc.email || !newPoc.mobile) return; setPocs([...pocs, newPoc]); setNewPoc({ name: '', email: '', mobile: '' }); };
    const removePoc = (i: number) => setPocs(pocs.filter((_, idx) => idx !== i));
    const addSalesNotif = () => { if (!newSales.email || !newSales.mobile) return; setSalesNotifs([...salesNotifs, newSales]); setNewSales({ email: '', mobile: '' }); };
    const removeSalesNotif = (i: number) => setSalesNotifs(salesNotifs.filter((_, idx) => idx !== i));
    const addProhibitedItem = () => { if (newProhibitedItem.trim()) { setProhibitedItems([...prohibitedItems, newProhibitedItem.trim()]); setNewProhibitedItem(''); } };
    const addFaq = () => { if (newFaq.question.trim() && newFaq.answer.trim()) { setFaqs([...faqs, newFaq]); setNewFaq({ question: '', answer: '' }); } };
    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (command === 'bold') setIsBold(!isBold);
        if (command === 'italic') setIsItalic(!isItalic);
        if (command === 'underline') setIsUnderline(!isUnderline);
        editorRef.current?.focus();
    };

    const accentColor = '#E7C200';

    if (loadingData) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFCED] via-white to-white">
            <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#E7C200] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[16px] text-zinc-500">Loading venue...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white overflow-x-hidden">
            <div className="w-full" style={{ zoom: '0.70' }}>
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    {/* Back + Title */}
                    <div className="mb-6">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[18px] text-zinc-500 hover:text-black mb-4">
                            <ArrowLeft size={20} /> Back
                        </button>
                        <h1 className="text-[40px] font-medium leading-[44px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {isViewMode ? 'View play venue' : 'Edit play venue'}
                        </h1>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[25px] font-medium text-[#686868]">
                                {isViewMode ? 'Overview of your venue details on Ticpin.' : 'Make changes and save to update your venue on Ticpin.'}
                            </p>
                            <div className="flex items-center gap-4">
                                {isViewMode && hasChanges && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitLoading}
                                        className="flex items-center gap-2 bg-[#E7C200] text-black px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-[#d6b300] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? 'Updating...' : 'UPDATE'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsViewMode(!isViewMode)}
                                    className="flex items-center gap-2 bg-black text-white px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    <Edit2 size={18} />
                                    {isViewMode ? 'Edit Details' : 'View Mode'}
                                </button>
                                {isViewMode && (
                                    <button
                                        onClick={() => router.push(`/play/edit/${id}/format`)}
                                        className="flex items-center gap-2 bg-[#E7C200] text-black px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-[#d6b300] transition-colors"
                                    >
                                        Next: Pricing Format
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="w-[1800px] h-[1.5px] bg-gray-400 ml-[25px] mb-6" />

                    {makeUploadInput('portrait', 'image/*')}
                    {makeUploadInput('landscape', 'image/*')}
                    {makeUploadInput('secondary_banner', 'image/*')}
                    {makeUploadInput('video', 'video/*')}
                    {makeUploadInput('gallery', 'image/*,video/*', true)}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="upload-gallery-replace"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f !== undefined && replacingGalleryIndex !== null) {
                                handleReplaceGalleryImage(f, replacingGalleryIndex);
                            }
                            e.target.value = '';
                        }}
                    />
                    {makeUploadInput('court_image', 'image/*')}

                    {/* Venue Name */}
                    <div className="mb-12">
                        <label className="block text-[24px] font-medium mb-2 text-black mt-[20px]">Venue name</label>
                        {isViewMode ? (
                            <p className="text-[35px] font-semibold text-black">{venueName || 'N/A'}</p>
                        ) : (
                            <>
                                <input type="text" placeholder="Your venue's name" value={venueName} onChange={e => setVenueName(e.target.value)}
                                    className="w-full text-[30px] font-medium text-black placeholder-[#AEAEAE] bg-transparent border-none outline-none mt-[-10px]" />
                                <div className="w-full h-[1px] bg-[#AEAEAE] mt-2" />
                            </>
                        )}
                    </div>

                    <div className="space-y-10 mt-[-30px]">
                        {/* Description */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-6">Venue Description <span style={{ color: accentColor }}>*</span></h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-6" />
                            
                            {isViewMode ? (
                                <div 
                                    className="prose prose-xl max-w-none text-[22px] text-zinc-700 min-h-[100px]"
                                    dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || originalData.description || 'No description provided.' }}
                                />
                            ) : (
                                <>
                                    <div className="flex gap-1 mb-4">
                                        <button onClick={() => handleFormat('bold')} className={`p-2 rounded ${isBold ? 'bg-gray-200' : ''}`}><Image src="/create event/bold.svg" alt="Bold" width={40} height={40} /></button>
                                        <button onClick={() => handleFormat('italic')} className={`p-2 rounded ${isItalic ? 'bg-gray-200' : ''}`}><Image src="/create event/italic.svg" alt="Italic" width={40} height={40} /></button>
                                        <button onClick={() => handleFormat('underline')} className={`p-2 rounded ${isUnderline ? 'bg-gray-200' : ''}`}><Image src="/create event/underline.svg" alt="Underline" width={40} height={40} /></button>
                                    </div>
                                    <div className="border border-[#AEAEAE] rounded-[10px] p-6 min-h-[260px] relative">
                                        <div ref={editorRef} contentEditable onInput={e => setHasContent(e.currentTarget.innerText.length > 0)}
                                            className="w-full h-full text-[30px] font-medium text-black outline-none min-h-[210px]" />
                                        {!hasContent && <div className="absolute top-6 left-6 text-[#AEAEAE] text-[25px] font-medium pointer-events-none">Venue description</div>}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Category */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-6">Sport type <span style={{ color: accentColor }}>*</span></h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            
                            {isViewMode ? (
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Sport</label>
                                        <p className="text-[24px] font-semibold text-black">{selections.category}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Court Type</label>
                                        <p className="text-[24px] font-semibold text-black">{selections.subCategory}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-12">
                                    {[{ key: 'category', label: 'Sport' }, { key: 'subCategory', label: 'Court Type' }].map(({ key, label }) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">{label} <span style={{ color: accentColor }}>*</span></label>
                                            <div className="relative w-full">
                                                <div onClick={() => toggleDropdown(key)} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer">
                                                    <span className={`text-[20px] ${selections[key as 'category' | 'subCategory'].startsWith('Select') ? 'text-[#686868]' : 'text-black'}`}>{selections[key as 'category' | 'subCategory']}</span>
                                                    {openDropdown === key ? <ChevronUp className="absolute right-6" size={24} /> : <ChevronDown className="absolute right-6" size={24} />}
                                                </div>
                                                {openDropdown === key && (
                                                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#686868] rounded-[10px] mt-1 max-h-[300px] overflow-y-auto shadow-xl">
                                                        {(key === 'category' ? CATEGORIES : (CATEGORY_DATA[selections.category] || [])).map(opt => (
                                                            <div key={opt} onClick={() => handleSelect(key, opt)} className="px-6 py-3 hover:bg-zinc-50 cursor-pointer text-[18px] transition-colors">{opt}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Location */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-6">Location <span style={{ color: accentColor }}>*</span></h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            
                            {isViewMode ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">City</label>
                                            <p className="text-[24px] font-semibold text-black">{selections.city}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Venue Address</label>
                                            <p className="text-[24px] font-semibold text-black">{venueAddress || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Google Maps Link</label>
                                            <a href={googleMapLink} target="_blank" rel="noopener noreferrer" className="text-[22px] text-blue-600 font-medium hover:underline flex items-center gap-2">
                                                View on Map <ExternalLink size={18} />
                                            </a>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Instagram Link</label>
                                            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-[22px] text-pink-600 font-medium hover:underline flex items-center gap-2">
                                                View Instagram <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">City</label>
                                        <div className="relative w-full">
                                            <div onClick={() => toggleDropdown('city')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer">
                                                <span className={`text-[20px] ${selections.city === 'Select City' ? 'text-[#686868]' : 'text-black'}`}>{selections.city}</span>
                                                {openDropdown === 'city' ? <ChevronUp className="absolute right-6" size={24} /> : <ChevronDown className="absolute right-6" size={24} />}
                                            </div>
                                            {openDropdown === 'city' && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#686868] rounded-[10px] mt-1 max-h-[350px] overflow-y-auto shadow-xl">
                                                    <div className="p-3 border-b border-[#AEAEAE]">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AEAEAE]" size={16} />
                                                            <input
                                                                type="text"
                                                                placeholder="Search city..."
                                                                value={dropdownSearch.city}
                                                                onChange={(e) => setDropdownSearch(prev => ({ ...prev, city: e.target.value }))}
                                                                className="w-full pl-10 pr-4 py-2 border border-[#AEAEAE] rounded-lg text-[16px] focus:outline-none focus:border-[#5331EA]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto">
                                                        {CITIES.filter(opt => opt.toLowerCase().includes(dropdownSearch.city.toLowerCase())).map((opt, index) => <div key={`${opt}-${index}`} onClick={() => handleSelect('city', opt)} className="px-6 py-3 hover:bg-zinc-50 cursor-pointer text-[18px] transition-colors">{opt}</div>)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Venue Address</label>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-4 mt-[10px]">
                                            <Search className="text-[#AEAEAE]" size={24} />
                                            <input type="text" placeholder="Search address" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Google Maps Link</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                <input type="text" placeholder="Google Maps URL" value={googleMapLink} onChange={e => setGoogleMapLink(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Instagram Link</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                <input type="text" placeholder="Instagram URL" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Guide */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h3 className="text-[30px] font-medium text-black mb-6">Venue Guide</h3>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            
                            {isViewMode ? (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    {[
                                        { label: 'Facilities', value: facilities.join(', ') || 'None' },
                                        { label: 'Max Duration', value: maxDuration },
                                        { label: 'Pet Friendly', value: petFriendly },
                                        { label: 'Outside Food', value: outsideFood },
                                        { label: 'Location Type', value: venueLocationType },
                                        { label: 'Surface Type', value: surfaceType },
                                        { label: 'Cancellations', value: cancellations },
                                        { label: 'Changing Rooms', value: changingRooms },
                                        { label: 'Equipment Rentals', value: equipmentRentals },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-50">
                                            <span className="text-[20px] text-[#686868]">{label}</span>
                                            <span className="text-[20px] font-semibold text-black">{value || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <span className="text-[25px] font-medium text-black mt-4">Facilities available <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative w-[840px]">
                                            {/* Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => setShowFacilitiesDropdown(d => !d)}
                                                className="w-full border border-[#686868] rounded-[10px] min-h-[64px] flex items-center flex-wrap gap-2 px-4 py-2 text-left"
                                            >
                                                {facilities.length === 0 ? (
                                                    <span className="text-[22px] text-[#AEAEAE]">Select facilities</span>
                                                ) : (
                                                    facilities.map(f => (
                                                        <span key={f} className="bg-[#E7C200] text-black text-[18px] font-medium rounded-[6px] px-3 py-1 flex items-center gap-1">
                                                            {f}
                                                            <span
                                                                onClick={e => { e.stopPropagation(); toggleFacility(f); }}
                                                                className="cursor-pointer text-[16px] font-bold leading-none">
                                                                ×
                                                            </span>
                                                        </span>
                                                    ))
                                                )}
                                                <ChevronDown size={22} className="ml-auto text-[#686868] shrink-0" />
                                            </button>
                                            {/* Dropdown */}
                                            {showFacilitiesDropdown && (
                                                <div className="absolute z-50 top-[calc(100%+6px)] left-0 w-full bg-white border border-[#686868] rounded-[10px] shadow-lg overflow-hidden">
                                                    {FACILITIES_OPTIONS.map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => toggleFacility(opt)}
                                                            className={`w-full flex items-center gap-3 px-6 py-4 text-[22px] text-left transition-colors ${facilities.includes(opt)
                                                                ? 'bg-[#E7C200]/20 font-semibold'
                                                                : 'hover:bg-zinc-50'
                                                                }`}
                                                        >
                                                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${facilities.includes(opt) ? 'border-[#E7C200] bg-[#E7C200]' : 'border-[#686868]'
                                                                }`}>
                                                                {facilities.includes(opt) && <span className="text-black text-[14px] font-bold">✓</span>}
                                                            </span>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                    <div className="px-4 py-3 border-t border-[#686868]">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowFacilitiesDropdown(false)}
                                                            className="w-full bg-black text-white rounded-[8px] py-2 text-[20px] font-medium"
                                                        >Done</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Maximum booking duration? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select duration</option>
                                                <option value="1 Hour">1 Hour</option>
                                                <option value="2 Hours">2 Hours</option>
                                                <option value="3 Hours">3 Hours</option>
                                                <option value="4 Hours">4 Hours</option>
                                                <option value="No limit">No limit</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Is the venue pet-friendly? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={petFriendly} onChange={e => setPetFriendly(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Is outside food allowed? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={outsideFood} onChange={e => setOutsideFood(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">In-door or out-door? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={venueLocationType} onChange={e => setVenueLocationType(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="In-door">In-door</option>
                                                <option value="Out-door">Out-door</option>
                                                <option value="Both">Both</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Select surface type <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={surfaceType} onChange={e => setSurfaceType(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select surface</option>
                                                <option value="Clay">Clay</option>
                                                <option value="Synthetic">Synthetic</option>
                                                <option value="Grass">Grass</option>
                                                <option value="Concrete">Concrete</option>
                                                <option value="Wooden">Wooden</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Allow cancellations? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={cancellations} onChange={e => setCancellations(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Changing rooms available? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={changingRooms} onChange={e => setChangingRooms(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Equipment rentals available? <span className="text-[#E7C200]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select value={equipmentRentals} onChange={e => setEquipmentRentals(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                <option value="">Select option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Available Courts Section */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-2">Available Courts <span style={{ color: accentColor }}>*</span></h2>
                            <p className="text-[20px] font-medium text-[#686868] mb-6">List the specific courts or spaces available at your venue.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                            {courts.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    {courts.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between border border-[#AEAEAE] rounded-[10px] p-6">
                                            <div className="flex gap-10 flex-1">
                                                <div className="min-w-[150px]">
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Name</p>
                                                    <p className="text-[22px] font-semibold text-black">{c.name || 'Court ' + (i + 1)}</p>
                                                </div>
                                                <div className="min-w-[120px]">
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Type</p>
                                                    <p className="text-[22px] font-semibold text-black">{c.type}</p>
                                                </div>
                                                <div className="min-w-[150px]">
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Price</p>
                                                    <p className="text-[22px] font-semibold text-black">₹{c.price} / hr</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {isViewMode ? (
                                                    <>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                setEditingCourtIndex(i);
                                                                setNewCourt({ ...c });
                                                                setIsViewMode(false);
                                                            }} 
                                                            className="text-blue-500 font-bold uppercase tracking-tight text-[16px] hover:text-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCourts(courts.filter((_, idx) => idx !== i))} 
                                                            className="text-red-500 font-bold uppercase tracking-tight text-[16px] hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setCourts(courts.filter((_, idx) => idx !== i))} 
                                                        className="text-red-500 font-bold uppercase tracking-tight text-[16px] hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add/Edit Court Form - Only in Edit Mode */}
                            {!isViewMode && (
                                <div className="border border-[#E7C200] rounded-[15px] p-6 bg-[#FFFCED]/30">
                                    <h3 className="text-[24px] font-medium text-black mb-4">
                                        {editingCourtIndex !== null ? 'Edit Court' : 'Add New Court'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Court Name</label>
                                            <input 
                                                type="text" 
                                                value={newCourt.name} 
                                                onChange={e => setNewCourt({ ...newCourt, name: e.target.value })} 
                                                placeholder="e.g. Court 1" 
                                                className="w-full border border-[#AEAEAE] rounded-[10px] h-[56px] px-4 text-[18px] text-black" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Court Type</label>
                                            <input 
                                                type="text" 
                                                value={newCourt.type} 
                                                onChange={e => setNewCourt({ ...newCourt, type: e.target.value })} 
                                                placeholder="e.g. Indoor Synthetic" 
                                                className="w-full border border-[#AEAEAE] rounded-[10px] h-[56px] px-4 text-[18px] text-black" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Price per Hour (₹)</label>
                                            <input 
                                                type="number" 
                                                value={newCourt.price} 
                                                onChange={e => setNewCourt({ ...newCourt, price: e.target.value })} 
                                                placeholder="e.g. 500" 
                                                className="w-full border border-[#AEAEAE] rounded-[10px] h-[56px] px-4 text-[18px] text-black" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Court Image</label>
                                            <div className="flex items-center gap-3">
                                                {newCourt.image_url && (
                                                    <div className="relative w-[50px] h-[50px] rounded-[8px] overflow-hidden border border-[#AEAEAE]">
                                                        <Image src={newCourt.image_url} alt="Court" fill className="object-cover" />
                                                    </div>
                                                )}
                                                <label htmlFor="upload-court_image" className="cursor-pointer flex-1">
                                                    <div className="border border-[#AEAEAE] border-dashed rounded-[10px] h-[56px] flex items-center justify-center px-4 hover:bg-zinc-50 transition-colors">
                                                        {uploading.court_image ? (
                                                            <span className="text-[16px] text-zinc-400">Uploading...</span>
                                                        ) : newCourt.image_url ? (
                                                            <span className="text-[16px] text-green-600 font-medium">✓ Image Set - Click to Change</span>
                                                        ) : (
                                                            <span className="text-[16px] text-[#686868]">+ Upload Court Image</span>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newCourt.name && newCourt.type && newCourt.price && newCourt.image_url) {
                                                    if (editingCourtIndex !== null) {
                                                        // Update existing court
                                                        setCourts(courts.map((c, idx) => idx === editingCourtIndex ? newCourt : c));
                                                        setEditingCourtIndex(null);
                                                    } else {
                                                        // Add new court
                                                        setCourts([...courts, newCourt]);
                                                    }
                                                    setNewCourt({ name: '', type: '', price: '', image_url: '' });
                                                } else {
                                                    toast.warning('Please fill all court details including image.');
                                                }
                                            }}
                                            className="flex-1 bg-black text-white rounded-[10px] h-[56px] text-[20px] font-medium hover:bg-zinc-800 transition-colors"
                                        >
                                            {editingCourtIndex !== null ? 'Update Court' : 'Add Court'}
                                        </button>
                                        {editingCourtIndex !== null && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingCourtIndex(null);
                                                    setNewCourt({ name: '', type: '', price: '', image_url: '' });
                                                }}
                                                className="px-6 border border-[#686868] rounded-[10px] h-[56px] text-[18px] font-medium hover:bg-zinc-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Images */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2">Card images <span style={{ color: accentColor }}>*</span></h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            <div className="space-y-6">
                                {[{ key: 'portrait', label: 'Portrait', size: '3:4 (900×1200px)', url: portraitUrl }, { key: 'landscape', label: 'Landscape', size: '16:9 (1600×900px)', url: landscapeUrl }].map(({ key, label, size, url }) => (
                                    <div key={key} className="bg-[#EBEBEB] rounded-[10px] py-3 px-6 flex items-center justify-between gap-6">
                                        <div>
                                            <p className="text-[20px] font-semibold text-[#686868]">{label}</p>
                                            <p className="text-[18px] text-black">{size}</p>
                                        </div>
                                        {url && (
                                            <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-[#AEAEAE]">
                                                <Image src={url} alt={label} fill className="object-cover" />
                                            </div>
                                        )}
                                        {!isViewMode && (
                                            <label htmlFor={`upload-${key}`} className="cursor-pointer">
                                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-white">
                                                    <span className="px-5 text-[15px] font-medium text-black">{uploading[key] ? 'Uploading...' : url ? 'Replace' : 'Upload'}</span>
                                                    <div className="bg-[#FFF8D6] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                ))}
                                {/* Secondary Banner */}
                                <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6 flex items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <p className="text-[20px] font-semibold text-[#686868]">Secondary Banner</p>
                                        <p className="text-[18px] text-black">16:9 aspect ratio (1600px by 900px)</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#686868]">
                                        <span className="text-[17px] font-medium">optional</span>
                                        <p className="text-[18px] text-black">Max 1.5MB</p>
                                    </div>
                                    {secondaryBannerUrl && (
                                        <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-[#AEAEAE]">
                                            <Image src={secondaryBannerUrl} alt="Secondary Banner" fill className="object-cover" />
                                        </div>
                                    )}
                                    {!isViewMode && (
                                        <label htmlFor="upload-secondary_banner" className="cursor-pointer">
                                            <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-white">
                                                <span className="px-5 text-[15px] font-medium text-black">{uploading['secondary_banner'] ? 'Uploading...' : secondaryBannerUrl ? 'Replace' : 'Upload'}</span>
                                                <div className="bg-[#FFF8D6] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Video + Gallery */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2">Media</h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            <div className="space-y-6">
                                <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6 flex items-center justify-between">
                                    <div><p className="text-[20px] font-semibold text-[#686868]">Card Video</p><p className="text-[18px] text-black">mp4 / mov · max 5MB</p></div>
                                    {videoUrl && <p className="text-[13px] text-green-600 font-medium">✓ Uploaded</p>}
                                    {!isViewMode && (
                                        <label htmlFor="upload-video" className="cursor-pointer">
                                            <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-white">
                                                <span className="px-5 text-[15px] font-medium text-black">{uploading.video ? 'Uploading...' : videoUrl ? 'Replace' : 'Upload'}</span>
                                                <div className="bg-[#FFF8D6] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                {/* Gallery Images */}
                                <div className="bg-[#EBEBEB] rounded-[10px] py-4 px-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[20px] font-semibold text-[#686868]">Gallery Images <span className="text-[#E7C200]">*</span></p>
                                            <p className="text-[16px] text-black">Upload at least 3 images (max 1.5MB each)</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[17px] font-medium text-[#E7C200]">{galleryUrls.length}/∞ uploaded (min 3)</span>
                                            {!isViewMode && (
                                                <>
                                                    <label htmlFor="upload-gallery" className="cursor-pointer">
                                                        <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                                            <span className="px-5 text-[15px] font-medium text-black">{uploading.gallery ? 'Uploading...' : '+ Add Image'}</span>
                                                            <div className="bg-[#FFF8D6] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                        </div>
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {galleryUrls.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-2">
                                            {galleryUrls.map((url, i) => (
                                                <div key={i} className="relative group aspect-square rounded-[8px] overflow-hidden border border-[#686868]">
                                                    <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                                                    {!isViewMode && (
                                                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-2 pb-2">
                                                            <label
                                                                htmlFor="upload-gallery-replace"
                                                                onClick={() => setReplacingGalleryIndex(i)}
                                                                className="cursor-pointer text-[11px] bg-white text-black px-2 py-1 rounded"
                                                            >
                                                                {uploading.gallery_replace && replacingGalleryIndex === i ? 'Uploading...' : 'Replace'}
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                                                                className="text-[11px] bg-red-600 text-white px-2 py-1 rounded"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {galleryUrls.length < 3 && (
                                        <p className="text-[14px] text-red-500 font-medium">Please upload at least {3 - galleryUrls.length} more image{3 - galleryUrls.length > 1 ? 's' : ''}.</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Optional Sections */}
                        <section className="bg-[#D8D8D8] rounded-[15px] p-6">
                            <h3 className="text-[25px] font-semibold text-black mb-4">Optional sections</h3>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { name: 'Venue Instructions', toggle: () => setShowInstructions(!showInstructions), active: showInstructions },
                                    { name: 'Youtube Video', toggle: () => setShowYoutube(!showYoutube), active: showYoutube },
                                    { name: 'Prohibited Items', toggle: () => setShowProhibited(!showProhibited), active: showProhibited },
                                    { name: 'FAQs', toggle: () => setShowFaqs(!showFaqs), active: showFaqs },
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={btn.toggle} className="flex items-center bg-white rounded-[6px] h-[42px] overflow-hidden">
                                        <span className="px-4 text-[19px] font-medium text-black">{btn.name}</span>
                                        <div className={`w-[42px] h-full flex items-center justify-center ${btn.active ? 'bg-black' : 'bg-[#FFF8D6]'}`}>
                                            <PlusCircle size={20} className={btn.active ? 'text-white' : 'text-black'} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {showInstructions && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-4">Venue Instructions</h2>
                                <div className="border border-[#686868] rounded-[10px] p-4">
                                    <textarea value={playInstructions} onChange={e => setPlayInstructions(e.target.value)} placeholder="Enter instructions..." className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE] min-h-[100px] resize-y" />
                                </div>
                            </section>
                        )}
                        {showYoutube && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-4">YouTube Video</h2>
                                <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" placeholder="YouTube URL" value={youtubeVideoUrl} onChange={e => setYoutubeVideoUrl(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </section>
                        )}
                        {showProhibited && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-4">Prohibited Items</h2>
                                <div className="flex gap-4 mb-4">
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6">
                                        <input type="text" placeholder="Add item" value={newProhibitedItem} onChange={e => setNewProhibitedItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addProhibitedItem()} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                    <button onClick={addProhibitedItem} className="bg-black text-white px-8 rounded-[10px] font-medium text-[20px]">Add</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {prohibitedItems.map((item, i) => (
                                        <div key={i} className="bg-zinc-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <span>{item}</span><button onClick={() => setProhibitedItems(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {showFaqs && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-4">FAQs</h2>
                                <div className="space-y-4 mb-4">
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" placeholder="Answer" value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} onKeyDown={e => e.key === 'Enter' && addFaq()} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                    <button onClick={addFaq} className="bg-black text-white w-full h-[64px] rounded-[10px] font-medium text-[20px]">Add FAQ</button>
                                </div>
                                {faqs.map((faq, i) => (
                                    <div key={i} className="bg-zinc-100 p-4 rounded-lg relative mb-2">
                                        <p className="font-semibold text-[18px]">Q: {faq.question}</p>
                                        <p className="text-[18px] text-zinc-600">A: {faq.answer}</p>
                                        <button onClick={() => setFaqs(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-500 text-[14px]">Remove</button>
                                    </div>
                                ))}
                            </section>
                        )}

                        {/* Payment */}
                        <h2 className="text-[30px] font-medium text-black mb-6 ml-[25px]">Confirm your payment and contact details</h2>
                        <section className="bg-white rounded-[15px] p-8">
                            {paymentVerified && (
                                <div className="flex items-center justify-between mb-6 px-4 py-2 bg-green-50 border border-green-200 rounded-[10px]">
                                    <span className="text-green-600 text-[15px] font-semibold">✓ Verified details loaded from your play setup</span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const session = getOrganizerSession();
                                            if (!session) return;
                                            try {
                                                const setup = await organizerApi.getExistingSetup('play');
                                                setPayment(p => ({
                                                    ...p,
                                                    organizerName: setup.accountHolder || setup.panName || p.organizerName,
                                                    gstin: setup.gstNumber || setup.pan || p.gstin,
                                                    accountNumber: setup.bankAccountNo || p.accountNumber,
                                                    ifsc: setup.bankIfsc || p.ifsc,
                                                }));
                                                setPaymentVerified(true);
                                            } catch { /* silent */ }
                                        }}
                                        className="text-[14px] font-medium text-green-700 underline"
                                    >
                                        Refresh from setup
                                    </button>
                                </div>
                            )}
                            {!paymentVerified && (
                                <div className="flex items-center justify-between mb-6 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px]">
                                    <span className="text-[15px] text-zinc-500">No verified details loaded yet</span>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const session = getOrganizerSession();
                                            if (!session) return;
                                            try {
                                                const setup = await organizerApi.getExistingSetup('play');
                                                const hasSetup = !!(setup.bankAccountNo || setup.bankIfsc || setup.gstNumber || setup.pan);
                                                setPayment(p => ({
                                                    ...p,
                                                    organizerName: setup.accountHolder || setup.panName || p.organizerName,
                                                    gstin: setup.gstNumber || setup.pan || p.gstin,
                                                    accountNumber: setup.bankAccountNo || p.accountNumber,
                                                    ifsc: setup.bankIfsc || p.ifsc,
                                                }));
                                                setPaymentVerified(hasSetup);
                                            } catch { /* silent */ }
                                        }}
                                        className="text-[14px] font-medium text-[#E7C200] underline"
                                    >
                                        Fetch from verified setup
                                    </button>
                                </div>
                            )}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Organiser *</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] ${paymentVerified && payment.organizerName ? 'border-green-300 bg-green-50/40 opacity-70 cursor-not-allowed' : 'border-[#686868]'}`}>
                                        <input type="text" placeholder="Organiser Name" value={payment.organizerName} disabled={paymentVerified && !!payment.organizerName} onChange={e => setPayment({ ...payment, organizerName: e.target.value })} className={`w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] ${paymentVerified && payment.organizerName ? 'cursor-not-allowed' : ''}`} />
                                        {paymentVerified && payment.organizerName && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">GSTIN / PAN:</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] ${paymentVerified && payment.gstin ? 'border-green-300 bg-green-50/40 opacity-70 cursor-not-allowed' : 'border-[#686868]'}`}>
                                        <input type="text" placeholder="GSTIN or PAN" value={payment.gstin} disabled={paymentVerified && !!payment.gstin} onChange={e => setPayment({ ...payment, gstin: e.target.value })} className={`w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] ${paymentVerified && payment.gstin ? 'cursor-not-allowed' : ''}`} />
                                        {paymentVerified && payment.gstin && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Account Number:</label>
                                        <div className={`border rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] ${paymentVerified && payment.accountNumber ? 'border-green-300 bg-green-50/40 opacity-70 cursor-not-allowed' : 'border-[#686868]'}`}>
                                            <input type="text" placeholder="Account Number" value={payment.accountNumber} disabled={paymentVerified && !!payment.accountNumber} onChange={e => setPayment({ ...payment, accountNumber: e.target.value })} className={`w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] ${paymentVerified && payment.accountNumber ? 'cursor-not-allowed' : ''}`} />
                                            {paymentVerified && payment.accountNumber && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">IFSC:</label>
                                        <div className={`border rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] ${paymentVerified && payment.ifsc ? 'border-green-300 bg-green-50/40 opacity-70 cursor-not-allowed' : 'border-[#686868]'}`}>
                                            <input type="text" placeholder="IFSC Code" value={payment.ifsc} disabled={paymentVerified && !!payment.ifsc} onChange={e => setPayment({ ...payment, ifsc: e.target.value })} className={`w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] ${paymentVerified && payment.ifsc ? 'cursor-not-allowed' : ''}`} />
                                            {paymentVerified && payment.ifsc && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Account Type:</label>
                                        <div className={`border rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] ${paymentVerified && payment.accountType ? 'border-green-300 bg-green-50/40 opacity-70 cursor-not-allowed' : 'border-[#686868]'}`}>
                                            <select value={payment.accountType} onChange={e => setPayment({ ...payment, accountType: e.target.value })} disabled={paymentVerified && !!payment.accountType} className={`w-full bg-transparent outline-none text-[20px] ${paymentVerified && payment.accountType ? 'cursor-not-allowed' : ''}`}>
                                                <option value="">Select type</option>
                                                <option value="Savings">Savings</option>
                                                <option value="Current">Current</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8">
                            <div>
                                <h2 className="text-[30px] font-medium text-black">Point of Contact <span className="text-[#FFF8D6]">*</span></h2>
                                <p className="text-[20px] text-[#AEAEAE] mt-1">Please add the POC with whom play venue feedback will be shared</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]">Name</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newPoc.name} onChange={e => setNewPoc({ ...newPoc, name: e.target.value })} placeholder="Enter name" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]">Mail</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newPoc.email} onChange={e => setNewPoc({ ...newPoc, email: e.target.value })} placeholder="Enter email address" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]">Mobile</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newPoc.mobile} onChange={e => setNewPoc({ ...newPoc, mobile: e.target.value })} placeholder="Enter mobile number" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 items-center">
                                {pocs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPocs([]);
                                            setNewPoc({ name: '', email: '', mobile: '' });
                                        }}
                                        className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-tight text-[18px]"
                                    >
                                        <Trash2 size={24} /> Remove POC
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (newPoc.name && newPoc.email && newPoc.mobile) {
                                            setPocs([newPoc]);
                                        }
                                    }}
                                    className="bg-black text-white rounded-[15px] h-[65px] px-8 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <span className="text-[30px] font-medium">{pocs.length > 0 ? 'UPDATE' : 'SAVE'}</span>
                                    <PlusCircle size={28} />
                                </button>
                            </div>
                        </section>

                        {/* Sales Notifications */}
                        <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8">
                            <div>
                                <h2 className="text-[30px] font-medium text-black">Sales Notifications <span className="text-[#AEAEAE] text-[18px] ml-2">(Optional)</span></h2>
                                <p className="text-[20px] text-[#AEAEAE] mt-1">Add details of who should receive a copy of every sale</p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]">Mail</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newSales.email} onChange={e => setNewSales({ ...newSales, email: e.target.value })} placeholder="Enter email address" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]">Mobile</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newSales.mobile} onChange={e => setNewSales({ ...newSales, mobile: e.target.value })} placeholder="Enter mobile number" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 items-center">
                                {salesNotifs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSalesNotifs([]);
                                            setNewSales({ email: '', mobile: '' });
                                        }}
                                        className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-tight text-[18px]"
                                    >
                                        <Trash2 size={24} /> Remove
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (newSales.email) {
                                            setSalesNotifs([newSales]);
                                        }
                                    }}
                                    className="bg-black text-white rounded-[15px] h-[65px] px-8 flex items-center gap-3 active:scale-95 transition-transform"
                                >
                                    <span className="text-[30px] font-medium">{salesNotifs.length > 0 ? 'UPDATE' : 'SAVE'}</span>
                                    <PlusCircle size={28} />
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="flex gap-4 pb-20 mt-12">
                        {isViewMode ? (
                            <button
                                onClick={() => router.push(`/play/edit/${id}/format`)}
                                className="bg-black text-white px-12 h-14 rounded-[12px] text-[20px] font-medium hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
                            >
                                Next: Pricing Format
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                    className="bg-black text-white px-12 h-14 rounded-[12px] text-[20px] font-medium hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitLoading ? 'Saving...' : 'Save & Continue'}
                                </button>
                                {submitMsg && <p className={`text-[18px] font-medium self-center ${submitMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{submitMsg}</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
