'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Info, PlusCircle, ExternalLink, Bold, Italic, Underline, Search, Upload } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

import { CATEGORIES, CITIES, CATEGORY_DATA } from './data';
import { useRouter } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { uploadMedia } from '@/lib/api/admin';
import { eventsApi } from '@/lib/api/events';
import { organizerApi } from '@/lib/api/organizer';

type EventPoc = { name: string; email: string; mobile: string };
type EventSalesNotif = { email: string; mobile: string };
type EventArtist = { name: string; image_url: string; description: string };
type EventTicketCategory = { id?: string | number; name: string; price: string; capacity: string; image_url: string; has_image: boolean };

const normalizeKeyPart = (value: string | undefined) => (value ?? '').trim().toLowerCase();
const contactKey = (contact: { email?: string; mobile?: string }) => `${normalizeKeyPart(contact.email)}|${normalizeKeyPart(contact.mobile)}`;

const dedupePocs = (items: EventPoc[]) => {
    const seen = new Map<string, EventPoc>();
    items.forEach(item => {
        const next = { name: item.name?.trim() ?? '', email: item.email?.trim() ?? '', mobile: item.mobile?.trim() ?? '' };
        if (!next.email && !next.mobile) return;
        const key = contactKey(next);
        const existing = seen.get(key);
        if (existing) {
            if (!existing.name && next.name) existing.name = next.name;
            return;
        }
        seen.set(key, next);
    });
    return Array.from(seen.values());
};

const dedupeSalesNotifs = (items: EventSalesNotif[]) => {
    const seen = new Set<string>();
    return items
        .map(item => ({ email: item.email?.trim() ?? '', mobile: item.mobile?.trim() ?? '' }))
        .filter(item => {
            if (!item.email && !item.mobile) return false;
            const key = contactKey(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const dedupeArtists = (items: EventArtist[]) => {
    const seen = new Set<string>();
    return items
        .map(item => ({ name: item.name?.trim() ?? '', image_url: item.image_url?.trim() ?? '', description: item.description?.trim() ?? '' }))
        .filter(item => {
            const key = normalizeKeyPart(item.name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const dedupeTicketCategories = (items: EventTicketCategory[]) => {
    const seen = new Set<string>();
    return items
        .map(item => ({ ...item, name: item.name?.trim() ?? '', image_url: item.image_url?.trim() ?? '' }))
        .filter(item => {
            const key = normalizeKeyPart(item.name);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const CreateEventPage = () => {
    const router = useRouter();
    const editorRef = useRef<HTMLDivElement>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    // Form fields
    const [eventName, setEventName] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');
    const [landscapeUrl, setLandscapeUrl] = useState('');
    const [venueAddress, setVenueAddress] = useState('');
    const [venueName, setVenueName] = useState('');
    const [googleMapLink, setGoogleMapLink] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('12:00');
    const [duration, setDuration] = useState('');

    const [ticketOpenDate, setTicketOpenDate] = useState('');
    const [ticketOpenHour, setTicketOpenHour] = useState('12');
    const [ticketOpenMinute, setTicketOpenMinute] = useState('00');
    const [ticketOpenAmpm, setTicketOpenAmpm] = useState('AM');

    const [ticketCloseDate, setTicketCloseDate] = useState('');
    const [ticketCloseHour, setTicketCloseHour] = useState('12');
    const [ticketCloseMinute, setTicketCloseMinute] = useState('00');
    const [ticketCloseAmpm, setTicketCloseAmpm] = useState('AM');

    const [eventEndDate, setEventEndDate] = useState('');
    const [eventEndHour, setEventEndHour] = useState('12');
    const [eventEndMinute, setEventEndMinute] = useState('00');
    const [eventEndAmpm, setEventEndAmpm] = useState('AM');

    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [totalTicketsAvailable, setTotalTicketsAvailable] = useState('0');

    // Event Guide State
    const [guide, setGuide] = useState({
        languages: [] as string[],
        minAge: 0,
        ticketRequiredAboveAge: 0,
        venueType: 'Indoor',
        audienceType: 'Seated',
        isKidFriendly: false,
        isPetFriendly: false,
        gatesOpenBefore: false,
        gatesOpenBeforeValue: 1,
        gatesOpenBeforeUnit: 'Minutes'
    });

    // Payment Details
    const [payment, setPayment] = useState({
        organizerName: '',
        gstin: '',
        accountNumber: '',
        ifsc: '',
        accountType: ''
    });

    // Lists
    const [pocs, setPocs] = useState<EventPoc[]>([]);
    const [salesNotifs, setSalesNotifs] = useState<EventSalesNotif[]>([]);

    // Temp state for adding to lists
    const [newPoc, setNewPoc] = useState({ name: '', email: '', mobile: '' });
    const [newSales, setNewSales] = useState({ email: '', mobile: '' });

    // Optional Sections Toggles
    const [showInstructions, setShowInstructions] = useState(false);
    const [showYoutube, setShowYoutube] = useState(false);
    const [showProhibited, setShowProhibited] = useState(false);
    const [showFaqs, setShowFaqs] = useState(false);

    // Optional Sections Data
    const [eventInstructions, setEventInstructions] = useState('');
    const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
    const [prohibitedItems, setProhibitedItems] = useState<string[]>([]);
    const [newProhibitedItem, setNewProhibitedItem] = useState('');
    const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>([]);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    // Artists
    const [artists, setArtists] = useState<EventArtist[]>([]);

    // Ticket Categories
    const [ticketCategories, setTicketCategories] = useState<EventTicketCategory[]>([]);
    const [description, setDescription] = useState('');
    const [isLayoutBased, setIsLayoutBased] = useState(false);
    const [layoutJson, setLayoutJson] = useState('');
    const [layoutName, setLayoutName] = useState('');

    useEffect(() => {
        if (!authChecked) return;

        // Check if there is layout data returned from layout editor
        const isLayout = sessionStorage.getItem('is-layout-based') === 'true';
        if (isLayout) {
            setIsLayoutBased(true);
            const lJson = sessionStorage.getItem('ticket-layout-json') || '';
            setLayoutJson(lJson);
            const lCats = sessionStorage.getItem('ticket-layout-categories');
            if (lCats) {
                try {
                    setTicketCategories(dedupeTicketCategories(JSON.parse(lCats)));
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // Restore draft fields if they exist
        const draftStr = sessionStorage.getItem('event-create-draft');
        if (draftStr) {
            try {
                const draft = JSON.parse(draftStr);
                if (draft.eventName) setEventName(draft.eventName);
                if (draft.portraitUrl) setPortraitUrl(draft.portraitUrl);
                if (draft.landscapeUrl) setLandscapeUrl(draft.landscapeUrl);
                if (draft.venueAddress) setVenueAddress(draft.venueAddress);
                if (draft.venueName) setVenueName(draft.venueName);
                if (draft.googleMapLink) setGoogleMapLink(draft.googleMapLink);
                if (draft.instagramLink) setInstagramLink(draft.instagramLink);
                if (draft.videoUrl) setVideoUrl(draft.videoUrl);
                if (draft.galleryUrls) setGalleryUrls(draft.galleryUrls);
                if (draft.eventDate) setEventDate(draft.eventDate);
                if (draft.eventTime) setEventTime(draft.eventTime);
                if (draft.duration) setDuration(draft.duration);
                if (draft.ticketOpenDate) setTicketOpenDate(draft.ticketOpenDate);
                if (draft.ticketOpenHour) setTicketOpenHour(draft.ticketOpenHour);
                if (draft.ticketOpenMinute) setTicketOpenMinute(draft.ticketOpenMinute);
                if (draft.ticketOpenAmpm) setTicketOpenAmpm(draft.ticketOpenAmpm);
                if (draft.ticketCloseDate) setTicketCloseDate(draft.ticketCloseDate);
                if (draft.ticketCloseHour) setTicketCloseHour(draft.ticketCloseHour);
                if (draft.ticketCloseMinute) setTicketCloseMinute(draft.ticketCloseMinute);
                if (draft.ticketCloseAmpm) setTicketCloseAmpm(draft.ticketCloseAmpm);
                if (draft.eventEndDate) setEventEndDate(draft.eventEndDate);
                if (draft.eventEndHour) setEventEndHour(draft.eventEndHour);
                if (draft.eventEndMinute) setEventEndMinute(draft.eventEndMinute);
                if (draft.eventEndAmpm) setEventEndAmpm(draft.eventEndAmpm);
                if (draft.timezone) setTimezone(draft.timezone);
                if (draft.totalTicketsAvailable) setTotalTicketsAvailable(draft.totalTicketsAvailable);
                if (draft.guide) setGuide(draft.guide);
                if (draft.payment) setPayment(draft.payment);
                if (draft.pocs) setPocs(dedupePocs(draft.pocs));
                if (draft.salesNotifs) setSalesNotifs(dedupeSalesNotifs(draft.salesNotifs));
                if (draft.eventInstructions) setEventInstructions(draft.eventInstructions);
                if (draft.youtubeVideoUrl) setYoutubeVideoUrl(draft.youtubeVideoUrl);
                if (draft.prohibitedItems) setProhibitedItems(draft.prohibitedItems);
                if (draft.faqs) setFaqs(draft.faqs);
                if (draft.artists) setArtists(dedupeArtists(draft.artists));

                setTimeout(() => {
                    if (editorRef.current && draft.description) {
                        editorRef.current.innerHTML = draft.description;
                        setHasContent(draft.description.replace(/<[^>]*>/g, '').trim().length > 0);
                    }
                }, 100);
            } catch (e) {
                console.error('Failed to parse event draft:', e);
            }
        }
    }, [authChecked]);

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');

    // Dropdown States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState({
        category: '',
        subCategory: '',
        city: ''
    });
    const [selections, setSelections] = useState({
        category: 'Select Category',
        subCategory: 'Select Sub-Category',
        city: 'Select City'
    });

    // Map state
    const [showMap, setShowMap] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const API_KEY = "AIzaSyC2gFDSPGY7wtSFHzYwzbPkP6tcq61Lmt8";

    // Session check on mount (SSR-safe)
    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Check organizer session and redirect if not authenticated
    useEffect(() => {
        if (!hasCheckedSession) return;

        const session = getOrganizerSession();
        if (!session) {
            router.replace('/list-your-events/Login');
            return;
        }

        // Check if organizer has approved events registration
        if (!session.isAdmin && session.categoryStatus?.events !== 'approved') {
            router.replace('/list-your-events/Login');
            return;
        }

        setAuthChecked(true);
    }, [hasCheckedSession, router]);

    useEffect(() => {
        if (!showMap || mapLoaded) return;

        const loadGoogleMaps = () => {
            if (window.google) {
                setMapLoaded(true);
                initMap();
                return;
            }
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setMapLoaded(true);
                initMap();
            };
            document.head.appendChild(script);
        };

        const initMap = () => {
            if (!mapRef.current) return;
            const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India
            
            const map = new window.google.maps.Map(mapRef.current, {
                center: defaultCenter,
                zoom: 5,
                mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            });
            googleMapInstance.current = map;

            // Automatically fetch current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        map.setCenter(pos);
                        map.setZoom(17);
                        placeMarker(pos);
                        reverseGeocode(pos);
                    },
                    (error) => {
                        console.warn("Geolocation error:", error.message);
                    }
                );
            }

            const input = document.getElementById('map-search') as HTMLInputElement;
            if (input) {
                const searchBox = new window.google.maps.places.SearchBox(input);
                map.addListener('bounds_changed', () => searchBox.setBounds(map.getBounds()));
                searchBox.addListener('places_changed', () => {
                    const places = searchBox.getPlaces();
                    if (!places || places.length === 0) return;
                    const place = places[0];
                    if (!place.geometry || !place.geometry.location) return;
                    updateLocationDetails(place);
                    if (place.geometry.viewport) map.fitBounds(place.geometry.viewport);
                    else { map.setCenter(place.geometry.location); map.setZoom(17); }
                    placeMarker(place.geometry.location);
                });
            }

            map.addListener('click', (e: any) => {
                const latLng = e.latLng;
                placeMarker(latLng);
                reverseGeocode(latLng);
            });
        };

        const placeMarker = (location: any) => {
            if (markerInstance.current) markerInstance.current.setMap(null);
            markerInstance.current = new window.google.maps.Marker({
                position: location,
                map: googleMapInstance.current,
            });
        };

        const reverseGeocode = (latLng: any) => {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) updateLocationDetails(results[0]);
            });
        };

        const updateLocationDetails = (place: any) => {
            setVenueAddress(place.formatted_address || '');
            const cityObj = place.address_components?.find((c: any) => 
                c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            if (cityObj) setSelections(prev => ({ ...prev, city: cityObj.long_name }));
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setGoogleMapLink(`https://www.google.com/maps?q=${lat},${lng}`);
        };

        loadGoogleMaps();
    }, [showMap, mapLoaded]);

    useEffect(() => {
        if (!eventDate || !eventTime || !duration) return;

        try {
            const [year, month, day] = eventDate.split('-').map(num => parseInt(num, 10));
            const [h24Str, mStr] = eventTime.split(':');
            const startH24 = parseInt(h24Str, 10);
            const startMin = parseInt(mStr, 10);

            const startDateObj = new Date(year, month - 1, day, startH24, startMin);
            if (isNaN(startDateObj.getTime())) return;

            let durationMinutes = 0;
            const dur = duration.toLowerCase();
            if (dur.includes('min')) {
                const match = dur.match(/(\d+)\s*min/);
                if (match) durationMinutes = parseInt(match[1], 10);
            } else if (dur.includes('hour')) {
                const match = dur.match(/([\d.]+)\s*hour/);
                if (match) {
                    const hrs = parseFloat(match[1]);
                    durationMinutes = Math.round(hrs * 60);
                }
            } else if (dur.includes('all day')) {
                durationMinutes = 24 * 60;
            }

            const endDateObj = new Date(startDateObj.getTime() + durationMinutes * 60 * 1000);
            
            const endYear = endDateObj.getFullYear();
            const endMonth = (endDateObj.getMonth() + 1).toString().padStart(2, '0');
            const endDay = endDateObj.getDate().toString().padStart(2, '0');
            const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;

            const endH24 = endDateObj.getHours();
            let roundedEndMin = endDateObj.getMinutes();
            roundedEndMin = Math.round(roundedEndMin / 5) * 5;
            if (roundedEndMin === 60) {
                endDateObj.setHours(endDateObj.getHours() + 1);
                roundedEndMin = 0;
            }
            const endMin = roundedEndMin.toString().padStart(2, '0');
            const endAmpm = endH24 >= 12 ? 'PM' : 'AM';
            const endH12 = (endH24 % 12 || 12).toString();

            setEventEndDate(formattedEndDate);
            setEventEndHour(endH12);
            setEventEndMinute(endMin);
            setEventEndAmpm(endAmpm);
        } catch (e) {
            console.error('Error auto-calculating event end date:', e);
        }
    }, [eventDate, eventTime, duration]);

    useEffect(() => {
        const checkAuth = async () => {
            let session = getOrganizerSession();
            if (!session) { setAuthChecked(false); return; }

            // If not approved and not admin, re-sync from DB once to be sure
            if (!session.isAdmin && session.categoryStatus?.events !== 'approved') {
                try {
                    const me = await organizerApi.getMe();
                    // Add small delay to ensure cookies are updated
                    await new Promise(resolve => setTimeout(resolve, 100));
                    // Re-read session after cookies are updated
                    session = getOrganizerSession() || session;
                } catch { /* ignore sync error */ }
            }

            if (!session.isAdmin && session.categoryStatus?.events !== 'approved') {
                setAuthChecked(false);
                return;
            }

            setAuthChecked(true);
            // Default organizer name in payment
            setPayment(p => ({ ...p, organizerName: session.email.split('@')[0] }));
            // Pre-fill bank details from saved organizer setup
            try {
                const setup = await organizerApi.getExistingSetup('events');
                if (setup) {
                    setPayment(p => ({
                        ...p,
                        organizerName: setup.accountHolder || p.organizerName,
                        gstin: setup.gstNumber || setup.pan || p.gstin,
                        accountNumber: setup.bankAccountNo || p.accountNumber,
                        ifsc: setup.bankIfsc || p.ifsc,
                        accountType: p.accountType,
                    }));
                } else {
                    // No setup found, using defaults
                }
            } catch (error) {
                // Error fetching events setup, using defaults
            }
        };

        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [router]);

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#D3CBF5]/10">
                <div className="bg-white rounded-[24px] p-10 shadow-lg max-w-md text-center space-y-4">
                    <h2 className="text-[24px] font-semibold text-black">Access Restricted</h2>
                    <p className="text-[16px] text-zinc-500">Your events registration must be approved by the admin before you can create events.</p>
                    <button onClick={() => router.back()} className="bg-black text-white px-6 h-10 rounded-[12px] text-[14px] font-medium">Go Back</button>
                </div>
            </div>
        );
    }

    const handleUpload = async (key: string, file: File) => {
        const maxSizeMB = key === 'video' ? 5 : 1.5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.warning(`File size exceeds the allowable limit. Maximum allowed size is ${maxSizeMB}MB.`);
            return;
        }

        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            if (key === 'portrait') setPortraitUrl(url);
            else if (key === 'landscape') setLandscapeUrl(url);
            else if (key === 'video') setVideoUrl(url);
            else if (key === 'gallery') setGalleryUrls(prev => [...prev, url]);
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const makeUploadInput = (key: string, accept: string) => (
        <input type="file" accept={accept} className="hidden"
            id={`upload-${key}`}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(key, f); }} />
    );

    const handleArtistImageUpload = async (idx: number, file: File) => {
        const key = `artist-${idx}`;
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            setArtists(prev => prev.map((a, i) => i === idx ? { ...a, image_url: url } : a));
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const handleTicketImageUpload = async (idx: number, file: File) => {
        const key = `ticket-${idx}`;
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            setTicketCategories(prev => prev.map((t, i) => i === idx ? { ...t, image_url: url } : t));
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const saveDraftToSessionStorage = () => {
        const draft = {
            eventName,
            portraitUrl,
            landscapeUrl,
            venueAddress,
            venueName,
            googleMapLink,
            instagramLink,
            videoUrl,
            galleryUrls,
            eventDate,
            eventTime,
            duration,
            ticketOpenDate,
            ticketOpenHour,
            ticketOpenMinute,
            ticketOpenAmpm,
            ticketCloseDate,
            ticketCloseHour,
            ticketCloseMinute,
            ticketCloseAmpm,
            eventEndDate,
            eventEndHour,
            eventEndMinute,
            eventEndAmpm,
            timezone,
            totalTicketsAvailable,
            guide,
            payment,
            pocs,
            salesNotifs,
            eventInstructions,
            youtubeVideoUrl,
            prohibitedItems,
            faqs,
            artists,
            description: editorRef.current?.innerHTML ?? '',
        };
        sessionStorage.setItem('event-create-draft', JSON.stringify(draft));
    };

    const handleNavigateToLayoutEditor = () => {
        saveDraftToSessionStorage();
        sessionStorage.setItem('ticket-editor-return-url', '/events/create');
        router.push('/ticket-layout-editor');
    };

    const handleSubmit = async () => {
        const session = getOrganizerSession();
        if (!session) return;
        if (!eventName.trim()) { setSubmitMsg('Event name is required.'); return; }
        if (selections.category === 'Select Category') { setSubmitMsg('Please select a category.'); return; }
        if (selections.city === 'Select City') { setSubmitMsg('Please select a city.'); return; }
        if (!portraitUrl || !landscapeUrl) { setSubmitMsg('Please upload both portrait and landscape card images.'); return; }
        if (pocs.length === 0) { setSubmitMsg('Please add at least one Point of Contact.'); return; }

        const parseDateString = (date: string, hour: string, minute: string, ampm: string) => {
            if (!date) return null;
            let h24 = parseInt(hour) % 12;
            if (ampm === 'PM') h24 += 12;
            const hourStr = h24.toString().padStart(2, '0');
            const minuteStr = minute.padStart(2, '0');
            try {
                // ✅ FIXED: Construct UTC ISO string directly to avoid timezone shift
                // When user enters "Dec 21, 2025 at 12:00 AM", send "2025-12-21T00:00:00Z"
                const utcISO = `${date}T${hourStr}:${minuteStr}:00Z`;
                return utcISO; // Return UTC string directly (no local conversion!)
            } catch (e) {
                return null;
            }
        };

        const tOpen = parseDateString(ticketOpenDate, ticketOpenHour, ticketOpenMinute, ticketOpenAmpm);
        const tClose = parseDateString(ticketCloseDate, ticketCloseHour, ticketCloseMinute, ticketCloseAmpm);
        const eEnd = parseDateString(eventEndDate, eventEndHour, eventEndMinute, eventEndAmpm);

        const startDateTime = eventDate ? new Date(`${eventDate}T${timeParts.hours.padStart(2, '0')}:${timeParts.minutes.padStart(2, '0')}:00`) : null;
        const openTimeObj = tOpen ? new Date(tOpen) : null;
        const closeTimeObj = tClose ? new Date(tClose) : null;
        const endTimeObj = eEnd ? new Date(eEnd) : null;

        if (openTimeObj && closeTimeObj && openTimeObj >= closeTimeObj) {
            setSubmitMsg('Ticket Open Date & Time must be strictly before Ticket Close Date & Time.');
            return;
        }
        if (closeTimeObj && endTimeObj && closeTimeObj > endTimeObj) {
            setSubmitMsg('Ticket Close Date & Time cannot be after Event End Date & Time.');
            return;
        }
        if (startDateTime && endTimeObj && startDateTime >= endTimeObj) {
            setSubmitMsg('Event Start Date & Time must be strictly before Event End Date & Time.');
            return;
        }

        setSubmitLoading(true); setSubmitMsg('');
        try {
            await eventsApi.create({
                name: eventName.trim(),
                description: editorRef.current?.innerHTML ?? '',
                category: selections.category,
                sub_category: selections.subCategory === 'Select Sub-Category' ? '' : selections.subCategory,
                city: selections.city,
                date: eventDate ? `${eventDate}T00:00:00Z` : null,
                time: eventTime,
                duration: duration,
                venue_name: venueName,
                venue_address: venueAddress,
                google_map_link: googleMapLink,
                instagram_link: instagramLink,
                portrait_image_url: portraitUrl,
                landscape_image_url: landscapeUrl,
                card_video_url: videoUrl,
                gallery_urls: galleryUrls,
                ticket_open_date: tOpen,
                ticket_close_date: tClose,
                event_end_date: eEnd,
                timezone: timezone,
                total_tickets_available: parseInt(totalTicketsAvailable) || 0,
                is_sales_paused: false,
                is_canceled: false,
                guide: {
                    languages: guide.languages,
                    min_age: guide.minAge,
                    ticket_required_above_age: guide.ticketRequiredAboveAge,
                    venue_type: guide.venueType,
                    audience_type: guide.audienceType,
                    is_kid_friendly: guide.isKidFriendly,
                    is_pet_friendly: guide.isPetFriendly,
                    gates_open_before: guide.gatesOpenBefore,
                    gates_open_before_value: guide.gatesOpenBefore ? guide.gatesOpenBeforeValue : 0,
                    gates_open_before_unit: guide.gatesOpenBeforeUnit,
                    facilities: []
                },
                event_instructions: eventInstructions,
                youtube_video_url: youtubeVideoUrl,
                prohibited_items: prohibitedItems,
                faqs: faqs,
                artists: dedupeArtists(artists).map(a => ({
                    name: a.name,
                    image_url: a.image_url,
                    description: a.description,
                })),
                // Preserve id if present (for editing existing categories) and guard against NaN
                ticket_categories: dedupeTicketCategories(ticketCategories).map(t => ({
                    id: t.id,
                    name: t.name,
                    price: parseFloat(t.price) || 0,
                    capacity: parseInt(t.capacity) || 0,
                    image_url: t.image_url,
                    has_image: t.has_image,
                })),
                payment: {
                    organizer_name: payment.organizerName,
                    gstin: payment.gstin,
                    account_number: payment.accountNumber,
                    ifsc: payment.ifsc,
                    account_type: payment.accountType
                },
                points_of_contact: dedupePocs(pocs),
                sales_notifications: dedupeSalesNotifs(salesNotifs),
                status: 'pending',
                is_layout_based: isLayoutBased,
                layout_json: layoutJson
            });
            setSubmitMsg('✅ Event created successfully!');
            sessionStorage.removeItem('event-create-draft');
            sessionStorage.removeItem('is-layout-based');
            sessionStorage.removeItem('ticket-layout-json');
            sessionStorage.removeItem('ticket-layout-categories');
            sessionStorage.removeItem('ticket-editor-return-url');
            setTimeout(() => router.push('/organizer/dashboard?category=events'), 2000);
        } catch (err) {
            setSubmitMsg(err instanceof Error ? err.message : 'Submission failed.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Available languages for multi-select
    const AVAILABLE_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi", "Other"];

    // Get today's date for min date attribute
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Convert 24h to 12h format for display
    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    // Handle time change from 12h dropdowns
    const handleTimeChange = (hours: string, minutes: string, ampm: string) => {
        const h24 = ampm === 'PM' ? (parseInt(hours) % 12) + 12 : parseInt(hours) % 12;
        setEventTime(`${h24.toString().padStart(2, '0')}:${minutes}`);
    };

    // Parse current time for 12h dropdowns
    const getTimeParts = () => {
        if (!eventTime) return { hours: '12', minutes: '00', ampm: 'AM' };
        const [h, m] = eventTime.split(':');
        const h24 = parseInt(h);
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        const h12 = (h24 % 12 || 12).toString();
        return { hours: h12, minutes: m, ampm };
    };

    const timeParts = getTimeParts();

    // Toggle language selection
    const toggleLanguage = (lang: string) => {
        setGuide(prev => {
            const currentLangs = prev.languages;
            if (currentLangs.includes(lang)) {
                return { ...prev, languages: currentLangs.filter(l => l !== lang) };
            } else {
                return { ...prev, languages: [...currentLangs, lang] };
            }
        });
    };

    const toggleDropdown = (name: string) => {
        setOpenDropdown(openDropdown === name ? null : name);
        if (openDropdown !== name) {
            setDropdownSearch(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelect = (name: string, value: string) => {
        setSelections(prev => {
            const newSelections = { ...prev, [name]: value };
            if (name === 'category') newSelections.subCategory = 'Select Sub-Category';
            return newSelections;
        });
        setOpenDropdown(null);
        setDropdownSearch(prev => ({ ...prev, [name]: '' }));
    };

    const addPoc = () => {
        if (!newPoc.name || !newPoc.email || !newPoc.mobile) return;
        const nextPoc = { name: newPoc.name.trim(), email: newPoc.email.trim(), mobile: newPoc.mobile.trim() };
        if (pocs.some(poc => contactKey(poc) === contactKey(nextPoc))) {
            setSubmitMsg('This Point of Contact is already added.');
            return;
        }
        setPocs(dedupePocs([...pocs, nextPoc]));
        setNewPoc({ name: '', email: '', mobile: '' });
    };

    const removePoc = (idx: number) => setPocs(pocs.filter((_, i) => i !== idx));

    const addSalesNotif = () => {
        if (!newSales.email.trim()) return;
        const nextSales = { email: newSales.email.trim(), mobile: newSales.mobile.trim() };
        if (salesNotifs.some(sales => contactKey(sales) === contactKey(nextSales))) {
            setSubmitMsg('This sales notification contact is already added.');
            return;
        }
        setSalesNotifs(dedupeSalesNotifs([...salesNotifs, nextSales]));
        setNewSales({ email: '', mobile: '' });
    };

    const removeSalesNotif = (idx: number) => setSalesNotifs(salesNotifs.filter((_, i) => i !== idx));

    const addProhibitedItem = () => {
        if (newProhibitedItem.trim()) {
            setProhibitedItems([...prohibitedItems, newProhibitedItem.trim()]);
            setNewProhibitedItem('');
        }
    };
    const removeProhibitedItem = (idx: number) => setProhibitedItems(prohibitedItems.filter((_, i) => i !== idx));

    const addFaq = () => {
        if (newFaq.question.trim() && newFaq.answer.trim()) {
            setFaqs([...faqs, newFaq]);
            setNewFaq({ question: '', answer: '' });
        }
    };
    const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        // Toggle state for UI feedback if needed
        if (command === 'bold') setIsBold(!isBold);
        if (command === 'italic') setIsItalic(!isItalic);
        if (command === 'underline') setIsUnderline(!isUnderline);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };
    return (
        <div className="min-h-screen bg-[#D3CBF5 opacity-10] overflow-x-hidden">
            <div
                className="w-full"
                style={{
                    zoom: '0.70'
                }}
            >
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    {/* Hidden Inputs for Uploads */}
                    {makeUploadInput('portrait', 'image/*')}
                    {makeUploadInput('landscape', 'image/*')}
                    {makeUploadInput('video', 'video/*')}
                    {makeUploadInput('gallery', 'image/*,video/*')}

                    {/* Title Section */}
                    <div className="mb-12">
                        <h1 className="text-[40px] font-medium leading-[44px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Create an event
                        </h1>
                        <p className="text-[25px] font-medium leading-[28px] text-[#686868] mt-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Only a few steps left to get your event live on Ticpin!
                        </p>
                    </div>
                    <div className="w-[1800px] h-[1.5px] bg-gray-400 mt-[-20px] ml-[25px] mb-2"></div>
                    {/* Event Name */}
                    <div className="mb-12">
                        <label className="block text-[24px] font-medium mb-2 text-black mt-[20px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Event name
                        </label>
                        <input
                            type="text"
                            placeholder="Your event's name"
                            value={eventName}
                            onChange={e => setEventName(e.target.value)}
                            className="w-full text-[30px] font-medium text-[black] placeholder-[#AEAEAE] bg-transparent border-none outline-none mt-[-10px]"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                        />
                        <div className="w-full h-[px] bg-[#AEAEAE] mt-2"></div>
                    </div>

                    <div className="space-y-10 mt-[-30px]">
                        {/* Event Description Section */}
                        <section className="bg-white rounded-[15px] p-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Event Description <span style={{ color: '#5331EA' }}>*</span>
                                </h2>
                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[38px] overflow-hidden">
                                    <span className="px-5 text-[18px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Event description guidelines
                                    </span>
                                    <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                        <ExternalLink size={20} className="text-black" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-6"></div>

                            <div className="flex gap-1 mb-4 mt-[-10px]">
                                <button
                                    onClick={() => handleFormat('bold')}
                                    className={`p-2 rounded ${isBold ? 'bg-gray-200' : ''}`}
                                >
                                    <Image src="/create event/bold.svg" alt="Bold" width={40} height={40} />
                                </button>
                                <button
                                    onClick={() => handleFormat('italic')}
                                    className={`p-2 rounded ${isItalic ? 'bg-gray-200' : ''}`}
                                >
                                    <Image src="/create event/italic.svg" alt="Italic" width={40} height={40} />
                                </button>
                                <button
                                    onClick={() => handleFormat('underline')}
                                    className={`p-2 rounded ${isUnderline ? 'bg-gray-200' : ''}`}
                                >
                                    <Image src="/create event/underline.svg" alt="Underline" width={40} height={40} />
                                </button>
                            </div>
                            <div className="border border-[#AEAEAE] rounded-[10px] p-6 min-h-[326px] relative">
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    onInput={(e) => {
                                        setHasContent(e.currentTarget.innerText.length > 0);
                                    }}
                                    className="w-full h-full text-[30px] font-medium text-[black] outline-none min-h-[278px]"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                />
                                {!hasContent && (
                                    <div className="absolute top-6 left-6 text-[#AEAEAE] text-[25px] font-medium pointer-events-none" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Your event's description
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Event Type Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Event type <span style={{ color: '#5331EA' }}>*</span>
                            </h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6 " style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Add category tags to help your event reach the right audience.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868] ml-[1px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Category <span style={{ color: '#5331EA' }}>*</span></label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('category')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.category === 'Select Category' ? 'text-[#686868]' : 'text-black'}`}>{selections.category}</span>
                                            {openDropdown === 'category' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'category' && (
                                            <div className="dropdown-menu">
                                                <div className="p-2 border-b border-[#E1E1E1]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search category..."
                                                        value={dropdownSearch.category}
                                                        onChange={(e) => setDropdownSearch(prev => ({ ...prev, category: e.target.value }))}
                                                        className="w-full px-3 py-2 text-[16px] border border-[#686868] rounded-[8px] outline-none"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                                                    {CATEGORIES.filter(opt => opt.toLowerCase().includes(dropdownSearch.category.toLowerCase())).map((opt) => (
                                                        <div key={opt} onClick={() => handleSelect('category', opt)} className="dropdown-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868] ml-[1px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Sub-Category <span style={{ color: '#5331EA' }}>*</span></label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('subCategory')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.subCategory === 'Select Sub-Category' ? 'text-[#686868]' : 'text-black'}`}>{selections.subCategory}</span>
                                            {openDropdown === 'subCategory' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'subCategory' && (
                                            <div className="dropdown-menu">
                                                <div className="p-2 border-b border-[#E1E1E1]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search sub-category..."
                                                        value={dropdownSearch.subCategory}
                                                        onChange={(e) => setDropdownSearch(prev => ({ ...prev, subCategory: e.target.value }))}
                                                        className="w-full px-3 py-2 text-[16px] border border-[#686868] rounded-[8px] outline-none"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                                                    {(CATEGORY_DATA[selections.category] || []).filter(opt => opt.toLowerCase().includes(dropdownSearch.subCategory.toLowerCase())).length > 0 ? (
                                                        CATEGORY_DATA[selections.category].filter(opt => opt.toLowerCase().includes(dropdownSearch.subCategory.toLowerCase())).map((opt) => (
                                                            <div key={opt} onClick={() => handleSelect('subCategory', opt)} className="dropdown-item">{opt}</div>
                                                        ))
                                                    ) : (
                                                        <div className="dropdown-item text-[#AEAEAE]">Nil</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Location Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Location <span style={{ color: '#5331EA' }}>*</span>
                            </h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Help local audiences discover your event and find the venue easily.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
                            <div className="space-y-8">
                                {/* City */}
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>City</label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('city')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.city === 'Select City' ? 'text-[#686868]' : 'text-black'}`}>{selections.city}</span>
                                            {openDropdown === 'city' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'city' && (
                                            <div className="dropdown-menu">
                                                <div className="p-2 border-b border-[#E1E1E1]">
                                                    <input
                                                        type="text"
                                                        placeholder="Search city..."
                                                        value={dropdownSearch.city}
                                                        onChange={(e) => setDropdownSearch(prev => ({ ...prev, city: e.target.value }))}
                                                        className="w-full px-3 py-2 text-[16px] border border-[#686868] rounded-[8px] outline-none"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[250px] overflow-y-auto scrollbar-hide">
                                                    {CITIES.filter(opt => opt.toLowerCase().includes(dropdownSearch.city.toLowerCase())).map((opt, index) => (
                                                        <div key={`${opt}-${index}`} onClick={() => handleSelect('city', opt)} className="dropdown-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Venue Name */}
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Venue Name</label>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                        <input
                                            type="text"
                                            placeholder="Enter venue name"
                                            value={venueName}
                                            onChange={e => setVenueName(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                </div>
                                {/* Venue Address */}
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Search and select your venue address</label>
                                    <div className="flex gap-3 items-center mt-[10px]">
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6 gap-4">
                                            <Search className="text-[#AEAEAE]" size={24} />
                                            <input
                                                type="text"
                                                placeholder="Search address"
                                                value={venueAddress}
                                                onChange={e => setVenueAddress(e.target.value)}
                                                className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowMap(!showMap)}
                                            className="flex items-center gap-2 border border-[#686868] rounded-[10px] h-[64px] px-6 bg-white text-black text-[18px] font-medium whitespace-nowrap hover:bg-zinc-50 transition-colors"
                                        >
                                            {showMap ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            {showMap ? 'Hide Map' : 'Show Map'}
                                        </button>
                                    </div>
                                </div>

                                {showMap && (
                                    <div className="space-y-4">
                                        <div className="relative w-full h-[400px] border border-[#AEAEAE] rounded-[15px] overflow-hidden bg-zinc-50">
                                            {!mapLoaded && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                                                    <span className="text-[20px] text-[#AEAEAE] animate-pulse">Loading Google Maps...</span>
                                                </div>
                                            )}
                                            <div ref={mapRef} className="w-full h-full" />
                                            <div className="absolute top-4 left-4 right-4 z-10">
                                                <input 
                                                    id="map-search"
                                                    type="text" 
                                                    placeholder="Search for your venue location..." 
                                                    className="w-full h-[54px] px-6 bg-white border border-[#AEAEAE] rounded-[10px] shadow-lg text-[18px] outline-none focus:border-black"
                                                />
                                            </div>
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                                                <div className="bg-black text-white px-6 py-3 rounded-full text-[16px] font-medium shadow-xl">
                                                    Click on the map to set location
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Google Map Link */}
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Google Maps Link</label>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                        <input
                                            type="text"
                                            placeholder="Paste Google Maps URL"
                                            value={googleMapLink}
                                            onChange={e => setGoogleMapLink(e.target.value)}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                </div>
                                {/* Date, Time, Duration */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event Date</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                            <input
                                                type="date"
                                                value={eventDate}
                                                min={getTodayDate()}
                                                onChange={e => setEventDate(e.target.value)}
                                                className="w-full bg-transparent outline-none text-[20px] text-black"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Start Time</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] gap-3">
                                            {/* Hours */}
                                            <select
                                                value={timeParts.hours}
                                                onChange={e => handleTimeChange(e.target.value, timeParts.minutes, timeParts.ampm)}
                                                className="bg-transparent outline-none text-[20px] text-black w-[60px]"
                                            >
                                                {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                            <span className="text-[20px] text-black">:</span>
                                            {/* Minutes */}
                                            <select
                                                value={timeParts.minutes}
                                                onChange={e => handleTimeChange(timeParts.hours, e.target.value, timeParts.ampm)}
                                                className="bg-transparent outline-none text-[20px] text-black w-[60px]"
                                            >
                                                {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            {/* AM/PM */}
                                            <select
                                                value={timeParts.ampm}
                                                onChange={e => handleTimeChange(timeParts.hours, timeParts.minutes, e.target.value)}
                                                className="bg-transparent outline-none text-[20px] text-black w-[60px]"
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Duration</label>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                            <select
                                                value={duration}
                                                onChange={e => setDuration(e.target.value)}
                                                className="w-full appearance-none bg-transparent outline-none text-[20px] text-black"
                                            >
                                                <option value="">Select duration</option>
                                                {["30 mins", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "3.5 hours", "4 hours", "5 hours", "6 hours", "All day"].map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={20} className="absolute right-6 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Scheduling & Capacity */}
                                <div className="border-t border-[#EAEAEA] pt-6 mt-6 space-y-6">
                                    <h4 className="text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Scheduling & Capacity</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Timezone & Total Capacity */}
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event Timezone</label>
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                <select
                                                    value={timezone}
                                                    onChange={e => setTimezone(e.target.value)}
                                                    className="w-full appearance-none bg-transparent outline-none text-[20px] text-black font-anek-latin"
                                                >
                                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                    <option value="UTC">UTC</option>
                                                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                                                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                                                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                                </select>
                                                <ChevronDown size={20} className="absolute right-6 pointer-events-none" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Total Tickets Capacity</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                <input
                                                    type="number"
                                                    placeholder="0 (Unlimited)"
                                                    value={totalTicketsAvailable}
                                                    onChange={e => setTotalTicketsAvailable(e.target.value)}
                                                    className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Ticket Open Date & Time */}
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Open Date</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mb-2">
                                                <input
                                                    type="date"
                                                    value={ticketOpenDate}
                                                    onChange={e => setTicketOpenDate(e.target.value)}
                                                    className="w-full bg-transparent outline-none text-[20px] text-black"
                                                />
                                            </div>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-3">
                                                <select value={ticketOpenHour} onChange={e => setTicketOpenHour(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                                <span className="text-[20px] text-black">:</span>
                                                <select value={ticketOpenMinute} onChange={e => setTicketOpenMinute(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select value={ticketOpenAmpm} onChange={e => setTicketOpenAmpm(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Ticket Close Date & Time */}
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Close Date</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mb-2">
                                                <input
                                                    type="date"
                                                    value={ticketCloseDate}
                                                    onChange={e => setTicketCloseDate(e.target.value)}
                                                    className="w-full bg-transparent outline-none text-[20px] text-black"
                                                />
                                            </div>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-3">
                                                <select value={ticketCloseHour} onChange={e => setTicketCloseHour(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                                <span className="text-[20px] text-black">:</span>
                                                <select value={ticketCloseMinute} onChange={e => setTicketCloseMinute(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select value={ticketCloseAmpm} onChange={e => setTicketCloseAmpm(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Event End Date & Time */}
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Event End Date</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mb-2">
                                                <input
                                                    type="date"
                                                    value={eventEndDate}
                                                    onChange={e => setEventEndDate(e.target.value)}
                                                    className="w-full bg-transparent outline-none text-[20px] text-black"
                                                />
                                            </div>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-3">
                                                <select value={eventEndHour} onChange={e => setEventEndHour(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                                <span className="text-[20px] text-black">:</span>
                                                <select value={eventEndMinute} onChange={e => setEventEndMinute(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select value={eventEndAmpm} onChange={e => setEventEndAmpm(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                    <option value="AM">AM</option>
                                                    <option value="PM">PM</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Instagram Link Section */}
                        <div className="mb-12">
                            <label className="block text-[20px] font-medium mb-4 text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Instagram Link
                            </label>
                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                <input
                                    type="text"
                                    placeholder="Enter Valid Instagram Link"
                                    value={instagramLink}
                                    onChange={e => setInstagramLink(e.target.value)}
                                    className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                />
                            </div>
                        </div>

                        {/* Event Card Images Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Event card images <span style={{ color: '#5331EA' }}>*</span>
                                </h2>
                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[38px] overflow-hidden">
                                    <span className="px-5 text-[18px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Card image guidelines
                                    </span>
                                    <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                        <ExternalLink size={20} className="text-black" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Please follow the event card image guidelines and provide images in both formats.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                            <div className="space-y-6">
                                {/* Portrait Image Upload */}
                                <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6">
                                    <div className="flex-1 grid grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[20px] font-semibold text-[#686868]">Portrait</p>
                                            <p className="text-[20px] text-black">3:4 aspect ratio (900px by 1200px)</p>
                                        </div>
                                        <div className="space-y-1 ml-[-250px]">
                                            <p className="text-[20px] font-semibold text-[#686868]">Max Size</p>
                                            <p className="text-[20px] text-black">1.5MB</p>
                                        </div>
                                        <div className="flex items-center justify-end gap-6 text-[#5331EA]">
                                            <span className="text-[17px] font-medium">* required</span>
                                            {portraitUrl && (
                                                <div className="relative w-[50px] h-[50px] rounded-[6px] overflow-hidden border border-[#686868]">
                                                    <Image src={portraitUrl} alt="Portrait preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            <div
                                                onClick={() => document.getElementById('upload-portrait')?.click()}
                                                className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB] cursor-pointer"
                                            >
                                                <span className="px-5 text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {uploading.portrait ? 'Uploading...' : portraitUrl ? 'Replace' : 'Upload'}
                                                </span>
                                                <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                                    <Upload size={20} className="text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Landscape Image Upload */}
                                <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6">
                                    <div className="flex-1 grid grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[20px] font-semibold text-[#686868]">Landscape</p>
                                            <p className="text-[20px] text-black">16:9 aspect ratio (1600px by 900px)</p>
                                        </div>
                                        <div className="space-y-1 ml-[-250px]">
                                            <p className="text-[20px] font-semibold text-[#686868]">Max Size</p>
                                            <p className="text-[20px] text-black">1.5MB</p>
                                        </div>
                                        <div className="flex items-center justify-end gap-6 text-[#5331EA]">
                                            <span className="text-[17px] font-medium">* required</span>
                                            {landscapeUrl && (
                                                <div className="relative w-[70px] h-[40px] rounded-[6px] overflow-hidden border border-[#686868]">
                                                    <Image src={landscapeUrl} alt="Landscape preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            <div
                                                onClick={() => document.getElementById('upload-landscape')?.click()}
                                                className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB] cursor-pointer"
                                            >
                                                <span className="px-5 text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    {uploading.landscape ? 'Uploading...' : landscapeUrl ? 'Replace' : 'Upload'}
                                                </span>
                                                <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                                    <Upload size={20} className="text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Event Card Video Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Event card video
                                </h2>
                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[38px] overflow-hidden">
                                    <span className="px-5 text-[18px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Card video guidelines
                                    </span>
                                    <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                        <ExternalLink size={20} className="text-black" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Please follow the event card video guidelines and provide video in both formats.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                            <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6">
                                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center gap-4">
                                    <div className="space-y-1 ml-[-10px]">
                                        <p className="text-[20px] font-semibold text-[#686868]">Dimensions</p>
                                        <p className="text-[20px] text-black">3:4 aspect ratio (900px by 1200px)</p>
                                    </div>
                                    <div className="space-y-1 ml-[-135px]">
                                        <p className="text-[20px] font-semibold text-[#686868]">Duration</p>
                                        <p className="text-[20px] text-black font-medium">10 to 60 secs</p>
                                    </div>
                                    <div className="space-y-1 ml-[-290px]">
                                        <p className="text-[20px] font-semibold text-[#686868]">Max Size</p>
                                        <p className="text-[20px] text-black font-medium">5MB</p>
                                    </div>
                                    <div className="space-y-1 ml-[-490px]">
                                        <p className="text-[20px] font-semibold text-[#686868]">Format</p>
                                        <p className="text-[20px] text-black font-medium">.mov or .mp4</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <div
                                            onClick={() => document.getElementById('upload-video')?.click()}
                                            className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB] cursor-pointer"
                                        >
                                            <span className="px-5 text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                {uploading.video ? 'Uploading...' : videoUrl ? 'Uploaded' : 'Upload'}
                                            </span>
                                            <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                                <Upload size={20} className="text-black" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#5331EA26] border border-[#5331EA] rounded-[10px] p-4 flex items-center gap-3 mt-6">
                                <div className="flex items-center justify-center w-6 h-6">
                                    <Image src="/create event/info-circle.svg" alt="Info" width={40} height={40} />
                                </div>
                                <span className="text-[19px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Viewable only on mobile and tablet web
                                </span>
                            </div>
                        </section>

                        {/* Gallery Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Gallery <span style={{ color: '#5331EA' }}>*</span>
                            </h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Your event card now supports a gallery, use images and videos to make your event stand out.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                            <div className="bg-[#EBEBEB] rounded-[10px] py-2 px-6">
                                <div className="grid grid-cols-3 gap-4 items-center">
                                    <div className="space-y-1">
                                        <p className="text-[20px] font-semibold text-[#686868]">Format</p>
                                        <p className="text-[20px] text-black">jpeg, png</p>
                                    </div>
                                    <div className="space-y-1 ml-[-450px]">
                                        <p className="text-[20px] font-semibold text-[#686868]">Max size per image</p>
                                        <p className="text-[20px] text-black">1.5MB</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-6 text-[#5331EA]">
                                        <span className="text-[17px] font-medium">* required</span>
                                        <div
                                            onClick={() => document.getElementById('upload-gallery')?.click()}
                                            className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB] cursor-pointer"
                                        >
                                            <span className="px-5 text-[15px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                {uploading.gallery ? 'Adding...' : `Add (${galleryUrls.length})`}
                                            </span>
                                            <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                                <Upload size={20} className="text-black" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Gallery Thumbnails */}
                            {galleryUrls.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-[16px] font-medium text-[#686868] mb-2">Uploaded Images:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {galleryUrls.map((url, idx) => (
                                            <div key={idx} className="relative w-[80px] h-[80px] rounded-[8px] overflow-hidden border border-[#686868] group">
                                                <Image src={url} alt={`Gallery ${idx + 1}`} fill className="object-cover" />
                                                <button
                                                    onClick={() => setGalleryUrls(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Artists Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Artists
                            </h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Add performers or artists for your event. You can add any number of artists.
                            </p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />

                            {artists.map((artist, idx) => (
                                <div key={idx} className="bg-[#F5F5F5] rounded-[12px] p-6 mb-6 space-y-4">
                                    {/* hidden upload input per artist */}
                                    <input type="file" id={`upload-artist-${idx}`} accept="image/*" className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleArtistImageUpload(idx, f); }} />
                                    <div className="flex items-center justify-between">
                                        <span className="text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Artist {idx + 1}</span>
                                        <button onClick={() => setArtists(prev => prev.filter((_, i) => i !== idx))}
                                            className="text-red-500 text-[18px] font-medium hover:underline">Remove</button>
                                    </div>
                                    {/* Name */}
                                    <div>
                                        <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Artist Name <span className="text-[#5331EA]">*</span></label>
                                        <div className="border border-[#686868] rounded-[10px] h-[56px] flex items-center px-6 mt-2 bg-white">
                                            <input type="text" placeholder="Enter artist name" value={artist.name}
                                                onChange={e => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, name: e.target.value } : a))}
                                                className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>About the Artist</label>
                                        <div className="border border-[#686868] rounded-[10px] p-4 mt-2 bg-white">
                                            <textarea value={artist.description}
                                                onChange={e => setArtists(prev => prev.map((a, i) => i === idx ? { ...a, description: e.target.value } : a))}
                                                placeholder="Brief description of the artist..."
                                                className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE] min-h-[80px] resize-y" />
                                        </div>
                                    </div>
                                    {/* Image */}
                                    <div>
                                        <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Artist Image</label>
                                        <div className="flex items-center gap-4 mt-2">
                                            {artist.image_url && (
                                                <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-[#686868]">
                                                    <Image src={artist.image_url} alt={artist.name} fill className="object-cover" />
                                                </div>
                                            )}
                                            <div onClick={() => document.getElementById(`upload-artist-${idx}`)?.click()}
                                                className="flex items-center border border-[#686868] rounded-[8px] h-[40px] overflow-hidden cursor-pointer bg-white">
                                                <span className="px-4 text-[18px] font-medium text-black">
                                                    {uploading[`artist-${idx}`] ? 'Uploading...' : artist.image_url ? 'Replace' : 'Upload Image'}
                                                </span>
                                                <div className="bg-[#AC9BF7] w-[40px] h-full flex items-center justify-center border-l border-[#686868]">
                                                    <Upload size={18} className="text-black" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button onClick={() => setArtists(prev => [...prev, { name: '', image_url: '', description: '' }])}
                                className="flex items-center gap-3 bg-black text-white rounded-[12px] h-[52px] px-6 text-[20px] font-medium">
                                <PlusCircle size={22} />
                                Add Artist
                            </button>
                        </section>

                        {/* Ticket Categories Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Ticket Categories
                                    </h2>
                                    <p className="text-[20px] font-medium text-[#AEAEAE]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Define ticket tiers for your event (e.g. Gold, Silver, General). Choose Standard Tickets or design an Interactive Layout.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />

                            {/* Ticket Mode Toggle */}
                            <div className="mb-8 flex gap-3 max-w-[450px] bg-gray-100 p-1 rounded-[12px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLayoutBased(false);
                                        sessionStorage.removeItem('is-layout-based');
                                        sessionStorage.removeItem('ticket-layout-json');
                                        sessionStorage.removeItem('ticket-layout-categories');
                                        setLayoutJson('');
                                        setTicketCategories([]);
                                    }}
                                    className={`flex-1 py-3 text-[18px] font-semibold rounded-[8px] transition-all duration-200 ${!isLayoutBased ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Standard Tickets
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLayoutBased(true);
                                        setTicketCategories([]);
                                    }}
                                    className={`flex-1 py-3 text-[18px] font-semibold rounded-[8px] transition-all duration-200 ${isLayoutBased ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Interactive Layout
                                </button>
                            </div>

                            {!isLayoutBased ? (
                                <>
                                    {ticketCategories.map((cat, idx) => (
                                        <div key={idx} className="bg-[#F5F5F5] rounded-[12px] p-6 mb-6 space-y-4">
                                            {/* hidden upload input per ticket category */}
                                            <input type="file" id={`upload-ticket-${idx}`} accept="image/*" className="hidden"
                                                onChange={e => { const f = e.target.files?.[0]; if (f) handleTicketImageUpload(idx, f); }} />
                                            <div className="flex items-center justify-between">
                                                <span className="text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Category {idx + 1}</span>
                                                <button onClick={() => setTicketCategories(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-red-500 text-[18px] font-medium hover:underline">Remove</button>
                                            </div>

                                            {/* Type toggle */}
                                            <div className="flex gap-3">
                                                <button onClick={() => setTicketCategories(prev => prev.map((c, i) => i === idx ? { ...c, has_image: false } : c))}
                                                    className={`px-5 py-2 rounded-[8px] text-[18px] font-medium border transition-all ${!cat.has_image ? 'bg-black text-white border-black' : 'bg-white text-[#686868] border-[#686868]'}`}>
                                                    Basic
                                                </button>
                                                <button onClick={() => setTicketCategories(prev => prev.map((c, i) => i === idx ? { ...c, has_image: true } : c))}
                                                    className={`px-5 py-2 rounded-[8px] text-[18px] font-medium border transition-all ${cat.has_image ? 'bg-black text-white border-black' : 'bg-white text-[#686868] border-[#686868]'}`}>
                                                    With Image
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-6">
                                                {/* Name */}
                                                <div>
                                                    <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Category Name <span className="text-[#5331EA]">*</span></label>
                                                    <div className="border border-[#686868] rounded-[10px] h-[56px] flex items-center px-6 mt-2 bg-white">
                                                        <input type="text" placeholder="e.g. Gold, Silver, General" value={cat.name}
                                                            onChange={e => setTicketCategories(prev => prev.map((c, i) => i === idx ? { ...c, name: e.target.value } : c))}
                                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                                    </div>
                                                </div>
                                                {/* Price */}
                                                <div>
                                                    <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Price (₹)</label>
                                                    <div className="border border-[#686868] rounded-[10px] h-[56px] flex items-center px-6 mt-2 bg-white">
                                                        <input type="number" placeholder="0.00" value={cat.price}
                                                            onChange={e => setTicketCategories(prev => prev.map((c, i) => i === idx ? { ...c, price: e.target.value } : c))}
                                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                                    </div>
                                                </div>
                                                {/* Capacity */}
                                                <div>
                                                    <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Capacity</label>
                                                    <div className="border border-[#686868] rounded-[10px] h-[56px] flex items-center px-6 mt-2 bg-white">
                                                        <input type="number" placeholder="Max tickets" value={cat.capacity}
                                                            onChange={e => setTicketCategories(prev => prev.map((c, i) => i === idx ? { ...c, capacity: e.target.value } : c))}
                                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image upload — only when has_image is true */}
                                            {cat.has_image && (
                                                <div>
                                                    <label className="text-[18px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Category Image</label>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        {cat.image_url && (
                                                            <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden border border-[#686868]">
                                                                <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                                                            </div>
                                                        )}
                                                        <div onClick={() => document.getElementById(`upload-ticket-${idx}`)?.click()}
                                                            className="flex items-center border border-[#686868] rounded-[8px] h-[40px] overflow-hidden cursor-pointer bg-white">
                                                            <span className="px-4 text-[18px] font-medium text-black">
                                                                {uploading[`ticket-${idx}`] ? 'Uploading...' : cat.image_url ? 'Replace' : 'Upload Image'}
                                                            </span>
                                                            <div className="bg-[#AC9BF7] w-[40px] h-full flex items-center justify-center border-l border-[#686868]">
                                                                <Upload size={18} className="text-black" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button onClick={() => setTicketCategories(prev => [...prev, { name: '', price: '', capacity: '', image_url: '', has_image: false }])}
                                        className="flex items-center gap-3 bg-black text-white rounded-[12px] h-[52px] px-6 text-[20px] font-medium">
                                        <PlusCircle size={22} />
                                        Add Ticket Category
                                    </button>
                                </>
                            ) : (
                                <div className="border border-dashed border-[#AEAEAE] rounded-[15px] p-10 text-center bg-gray-50/50">
                                    {!layoutJson ? (
                                        <div className="space-y-6">
                                            <div className="max-w-md mx-auto">
                                                <h3 className="text-[24px] font-semibold text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>Interactive Venue Map Design</h3>
                                                <p className="text-[18px] text-[#686868] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    Design a custom visual seating layout with stages, VIP table groups, and color-coded zones. Ticket categories and pricing will be mapped directly from your design.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleNavigateToLayoutEditor}
                                                className="inline-flex items-center gap-3 bg-black text-white rounded-[12px] h-[56px] px-8 text-[20px] font-semibold hover:bg-zinc-800 transition-colors shadow-md"
                                            >
                                                <PlusCircle size={24} />
                                                Design Venue Map Layout
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-[12px] p-4 flex items-center gap-3 justify-center mb-4">
                                                <span className="text-[20px] text-green-700 font-semibold flex items-center gap-2">
                                                    ✓ Seating Layout Mapped
                                                </span>
                                            </div>
                                            <h4 className="text-[22px] font-semibold text-black text-left mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                Categories mapped from layout:
                                            </h4>
                                            <div className="overflow-hidden border border-gray-200 rounded-[12px] bg-white text-left">
                                                <table className="w-full text-[18px] border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-[#686868]">
                                                            <th className="px-6 py-3">Category Name</th>
                                                            <th className="px-6 py-3">Price</th>
                                                            <th className="px-6 py-3">Capacity</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ticketCategories.map((cat, idx) => (
                                                            <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                                <td className="px-6 py-3 font-semibold text-black">{cat.name}</td>
                                                                <td className="px-6 py-3 text-black">₹{cat.price}</td>
                                                                <td className="px-6 py-3 text-black">{cat.capacity} seats</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex justify-center gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleNavigateToLayoutEditor}
                                                    className="inline-flex items-center gap-2 border border-black text-black bg-white rounded-[12px] h-[52px] px-6 text-[18px] font-semibold hover:bg-gray-50 transition-colors"
                                                >
                                                    Edit Venue Map Layout
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm("Are you sure you want to clear the layout map? This will delete all mapped categories.")) {
                                                            setLayoutJson('');
                                                            setTicketCategories([]);
                                                            sessionStorage.removeItem('ticket-layout-json');
                                                            sessionStorage.removeItem('ticket-layout-categories');
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-2 border border-red-200 text-red-600 bg-white rounded-[12px] h-[52px] px-6 text-[18px] font-semibold hover:bg-red-50 transition-colors"
                                                >
                                                    Clear Layout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Event Guide Section */}
                        <div className="mt-12">
                            <h2 className="text-[30px] font-medium text-black ml-[25px] mb-4" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Clearly define event details
                            </h2>
                            <section className="bg-white rounded-[15px] p-8 ">
                                <h3 className="text-[30px] font-medium text-black mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Event Guide
                                </h3>
                                <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                                <div className="space-y-6">
                                    {/* Q1 - Multiple Languages */}
                                    <div className="flex items-start justify-between">
                                        <span className="text-[25px] font-medium text-black pt-4">Which languages will your event be performed in? <span className="text-[#5331EA]">*</span></span>
                                        <div className="w-[840px]">
                                            <div className="border border-[#686868] rounded-[10px] p-4 max-h-[200px] overflow-y-auto">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {AVAILABLE_LANGUAGES.map((lang) => (
                                                        <label key={lang} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={guide.languages.includes(lang)}
                                                                onChange={() => toggleLanguage(lang)}
                                                                className="w-5 h-5 accent-[#5331EA]"
                                                            />
                                                            <span className="text-[18px] text-black">{lang}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            {guide.languages.length > 0 && (
                                                <p className="text-[16px] text-[#686868] mt-2">
                                                    Selected: {guide.languages.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Q2 & Q3 with Age select */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">What is the minimum age allowed for entry? <span className="text-[#5331EA]">*</span></span>
                                        <div className="flex items-center gap-4 w-[840px]">
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[280px] flex items-center px-6">
                                                <select
                                                    className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                    value={guide.minAge}
                                                    onChange={e => setGuide({ ...guide, minAge: Number(e.target.value) })}
                                                >
                                                    {[0, 5, 10, 12, 14, 16, 18, 21].map(a => (
                                                        <option key={a} value={a}>{a}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6" />
                                            </div>
                                            <span className="text-[25px] font-medium text-black">& above</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Above what age is a ticket required (paid entry)? <span className="text-[#5331EA]">*</span></span>
                                        <div className="flex items-center gap-4 w-[840px]">
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[280px] flex items-center px-6">
                                                <select
                                                    className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                    value={guide.ticketRequiredAboveAge}
                                                    onChange={e => setGuide({ ...guide, ticketRequiredAboveAge: Number(e.target.value) })}
                                                >
                                                    {[0, 5, 10, 12, 14, 16, 18, 21].map(a => (
                                                        <option key={a} value={a}>{a}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6" />
                                            </div>
                                            <span className="text-[25px] font-medium text-black">& above</span>
                                        </div>
                                    </div>

                                    {/* Q4 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Is your venue indoor or outdoor? <span className="text-[#5331EA]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select
                                                className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                value={guide.venueType}
                                                onChange={e => setGuide({ ...guide, venueType: e.target.value })}
                                            >
                                                {["Indoor", "Outdoor", "Both"].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>
                                    {/* Q5 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Will your audience be seated or standing? <span className="text-[#5331EA]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select
                                                className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                value={guide.audienceType}
                                                onChange={e => setGuide({ ...guide, audienceType: e.target.value })}
                                            >
                                                {["Seated", "Standing", "Seated + Standing"].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>
                                    {/* Q6 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Is your event kid-friendly? <span className="text-[#5331EA]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select
                                                className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                value={guide.isKidFriendly ? "Yes" : "No"}
                                                onChange={e => setGuide({ ...guide, isKidFriendly: e.target.value === "Yes" })}
                                            >
                                                {["Yes", "No"].map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>
                                    {/* Q7 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Is your event pet-friendly? <span className="text-[#5331EA]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select
                                                className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                value={guide.isPetFriendly ? "Yes" : "No"}
                                                onChange={e => setGuide({ ...guide, isPetFriendly: e.target.value === "Yes" })}
                                            >
                                                {["Yes", "No"].map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>
                                    {/* Q8 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">Do gates open before the start time of the event? <span className="text-[#5331EA]">*</span></span>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6">
                                            <select
                                                className="w-full appearance-none bg-transparent outline-none text-[25px]"
                                                value={guide.gatesOpenBefore ? "Yes" : "No"}
                                                onChange={e => setGuide({ ...guide, gatesOpenBefore: e.target.value === "Yes" })}
                                            >
                                                {["Yes", "No"].map(o => (
                                                    <option key={o} value={o}>{o}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={24} className="absolute right-6" />
                                        </div>
                                    </div>

                                    {/* Time Select */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-[#5331EA]">Gates open before <span className="text-[#5331EA]">*</span></span>
                                        <div className="flex items-center gap-4 w-[840px]">
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[412px] flex items-center px-6">
                                                <select
                                                    className="w-full appearance-none bg-transparent outline-none text-[25px] text-[#000]"
                                                    value={guide.gatesOpenBeforeValue}
                                                    onChange={e => setGuide({ ...guide, gatesOpenBeforeValue: Number(e.target.value) })}
                                                >
                                                    {[...Array(60)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6" />
                                            </div>
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] w-[412px] flex items-center px-6">
                                                <select
                                                    className="w-full appearance-none bg-transparent outline-none text-[25px] text-[#000]"
                                                    value={guide.gatesOpenBeforeUnit}
                                                    onChange={e => setGuide({ ...guide, gatesOpenBeforeUnit: e.target.value })}
                                                >
                                                    {["Minutes", "Hours"].map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={24} className="absolute right-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Note Box */}
                                <div className="bg-[#5331EA26] border border-[#5331EA] rounded-[10px] p-4 flex items-center gap-3 mt-6">
                                    <div className="flex items-center justify-center w-6 h-6">
                                        <Image src="/create event/info-circle.svg" alt="Info" width={40} height={40} />
                                    </div>
                                    <span className="text-[19px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                        Can’t find an option that properly describes your event? Email events@ticpin.in and we’ll assist you.
                                    </span>
                                </div>
                            </section>
                        </div>

                        <section className="bg-[#D8D8D8] rounded-[15px] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[25px] font-semibold text-black mt-[-15px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Add more sections</h3>
                            </div>
                            <div className="flex flex-wrap gap-6 mt-[-16px]">
                                {[
                                    { name: 'Event Instructions', toggle: () => setShowInstructions(!showInstructions), active: showInstructions },
                                    { name: 'Youtube Video', toggle: () => setShowYoutube(!showYoutube), active: showYoutube },
                                    { name: 'Prohibited Items', toggle: () => setShowProhibited(!showProhibited), active: showProhibited },
                                    { name: 'FAQs', toggle: () => setShowFaqs(!showFaqs), active: showFaqs }
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={btn.toggle} className="flex items-center bg-white rounded-[6px] h-[42px] overflow-hidden ">
                                        <span className="px-4 text-[19px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            {btn.name}
                                        </span>
                                        <div className={`w-[42px] h-full flex items-center justify-center ${btn.active ? 'bg-black' : 'bg-[#AC9BF7]'}`}>
                                            <PlusCircle size={20} className={btn.active ? 'text-white' : 'text-black'} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Optional Sections Rendering */}
                        {showInstructions && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-2">Event Instructions</h2>
                                <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Add specific instructions for attendees.</p>
                                <div className="border border-[#686868] rounded-[10px] p-4">
                                    <textarea
                                        value={eventInstructions}
                                        onChange={e => setEventInstructions(e.target.value)}
                                        placeholder="Enter instructions here..."
                                        className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE] min-h-[100px] resize-y"
                                    />
                                </div>
                            </section>
                        )}

                        {showYoutube && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-2">YouTube Video</h2>
                                <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Link a promotional YouTube video.</p>
                                <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube Video URL"
                                        value={youtubeVideoUrl}
                                        onChange={e => setYoutubeVideoUrl(e.target.value)}
                                        className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                    />
                                </div>
                            </section>
                        )}

                        {showProhibited && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-2">Prohibited Items</h2>
                                <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">List items that are not allowed at the venue.</p>
                                <div className="flex gap-4 mb-6">
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6">
                                        <input
                                            type="text"
                                            placeholder="Add an item"
                                            value={newProhibitedItem}
                                            onChange={e => setNewProhibitedItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addProhibitedItem()}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                    <button onClick={addProhibitedItem} className="bg-black text-white px-8 rounded-[10px] font-medium text-[20px]">Add</button>
                                </div>
                                {prohibitedItems.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {prohibitedItems.map((item, idx) => (
                                            <div key={idx} className="bg-zinc-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                                <span>{item}</span>
                                                <button onClick={() => removeProhibitedItem(idx)} className="text-red-500">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {showFaqs && (
                            <section className="bg-white rounded-[15px] p-8">
                                <h2 className="text-[30px] font-medium text-black mb-2">FAQs</h2>
                                <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Add frequently asked questions about your event.</p>
                                <div className="space-y-4 mb-6">
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="text"
                                            placeholder="Question"
                                            value={newFaq.question}
                                            onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="text"
                                            placeholder="Answer"
                                            value={newFaq.answer}
                                            onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && addFaq()}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                    <button onClick={addFaq} className="bg-black text-white w-full h-[64px] rounded-[10px] font-medium text-[20px]">Add FAQ</button>
                                </div>
                                {faqs.length > 0 && (
                                    <div className="space-y-3">
                                        {faqs.map((faq, idx) => (
                                            <div key={idx} className="bg-zinc-100 p-4 rounded-lg relative">
                                                <p className="font-semibold text-[18px]">Q: {faq.question}</p>
                                                <p className="text-[18px] text-zinc-600">A: {faq.answer}</p>
                                                <button onClick={() => removeFaq(idx)} className="absolute top-4 right-4 text-red-500 font-medium">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Payment Details Section */}
                        <h2 className="text-[30px] font-medium text-black mb-6 ml-[25px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Confirm your payment and contact details
                        </h2>
                        <section className="bg-white rounded-[15px] p-8">
                            {/* Pre-filled notice */}
                            <div className="bg-[#5331EA1A] border border-[#5331EA] rounded-[10px] px-6 py-4 flex items-center gap-3 mb-8">
                                <Image src="/create event/info-circle.svg" alt="Info" width={32} height={32} className="shrink-0" />
                                <span className="text-[18px] font-medium text-[#5331EA]">Your bank details have been pre-filled from your existing setup. Please review and confirm before submitting.</span>
                            </div>

                            <div className="space-y-8">
                                {/* Organiser */}
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Organiser <span className="text-[#5331EA]">*</span></label>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="text"
                                            placeholder="Organiser Name"
                                            value={payment.organizerName}
                                            onChange={e => setPayment({ ...payment, organizerName: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[22px] font-medium text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                </div>

                                {/* GSTIN */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <label className="text-[20px] font-medium text-[#686868]">GSTIN / PAN:</label>
                                        <span className="text-[16px] text-[#AEAEAE] italic">(One from three can be chosen: GSTIN, PAN, or Aadhaar)</span>
                                    </div>
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="text"
                                            placeholder="Enter GSTIN or PAN number"
                                            value={payment.gstin}
                                            onChange={e => setPayment({ ...payment, gstin: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[22px] font-medium text-black placeholder-[#AEAEAE]"
                                        />
                                    </div>
                                </div>

                                {/* Bank Details Confirmation Row */}
                                <div>
                                    <p className="text-[20px] font-semibold text-black mb-4">Bank Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Account Number:</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 bg-[#F9F9F9]">
                                                <input
                                                    type="text"
                                                    placeholder="Bank account number"
                                                    value={payment.accountNumber}
                                                    onChange={e => setPayment({ ...payment, accountNumber: e.target.value })}
                                                    className="w-full bg-transparent outline-none text-[20px] font-medium text-black placeholder-[#AEAEAE]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">IFSC:</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 bg-[#F9F9F9]">
                                                <input
                                                    type="text"
                                                    placeholder="Bank IFSC code"
                                                    value={payment.ifsc}
                                                    onChange={e => setPayment({ ...payment, ifsc: e.target.value })}
                                                    className="w-full bg-transparent outline-none text-[20px] font-medium text-black placeholder-[#AEAEAE]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[18px] font-medium text-[#686868]">Account Type:</label>
                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 bg-[#F9F9F9]">
                                                <select
                                                    value={payment.accountType}
                                                    onChange={e => setPayment({ ...payment, accountType: e.target.value })}
                                                    className="w-full appearance-none bg-transparent outline-none text-[20px] font-medium text-black"
                                                >
                                                    <option value="">Select account type</option>
                                                    <option value="Savings">Savings</option>
                                                    <option value="Current">Current</option>
                                                </select>
                                                <ChevronDown size={20} className="absolute right-4 pointer-events-none text-[#686868]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Point of Contact Section */}
                        <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8">
                            <div>
                                <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Point of Contact <span className="text-[#5331EA]">*</span>
                                </h2>
                                <p className="text-[20px] text-[#AEAEAE] mt-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Please add POCs with whom event feedback will be shared
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3 ">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Name</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                        <input
                                            type="text"
                                            placeholder="Enter name"
                                            value={newPoc.name}
                                            onChange={e => setNewPoc({ ...newPoc, name: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE] "
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mail</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                        <input
                                            type="text"
                                            placeholder="Enter email address"
                                            value={newPoc.email}
                                            onChange={e => setNewPoc({ ...newPoc, email: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mobile</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                        <input
                                            type="text"
                                            placeholder="Enter mobile number"
                                            value={newPoc.mobile}
                                            onChange={e => setNewPoc({ ...newPoc, mobile: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {pocs.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {pocs.map((p, i) => (
                                        <div key={i} className="bg-zinc-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <span>{p.name} ({p.mobile})</span>
                                            <button onClick={() => removePoc(i)} className="text-red-500">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={addPoc} className="bg-black text-white rounded-[15px] h-[65px] px-3 flex items-center gap-3">
                                    <span className="text-[30px] font-medium" style={{ fontFamily: 'var(--font-anek-tamil)' }}>ADD</span>
                                    <PlusCircle size={28} />
                                </button>
                            </div>
                        </section>

                        {/* Sales Notifications Section */}
                        <section className="bg-white rounded-[15px] p-10 mt-12  flex flex-col gap-8">
                            <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Send a copy of every sale to
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mail</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={newSales.email}
                                            onChange={e => setNewSales({ ...newSales, email: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && addSalesNotif()}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mobile</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input
                                            type="tel"
                                            placeholder="Enter mobile number"
                                            value={newSales.mobile}
                                            onChange={e => setNewSales({ ...newSales, mobile: e.target.value })}
                                            className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {salesNotifs.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {salesNotifs.map((s, i) => (
                                        <div key={i} className="bg-zinc-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <span>{s.email}{s.mobile ? ` — ${s.mobile}` : ''}</span>
                                            <button onClick={() => removeSalesNotif(i)} className="text-red-500">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={addSalesNotif} className="bg-black text-white rounded-[15px] h-[65px] px-3 flex items-center gap-3">
                                    <span className="text-[30px] font-medium" style={{ fontFamily: 'var(--font-anek-tamil)' }}>ADD</span>
                                    <PlusCircle size={28} />
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Final Action Button */}
                    <div className="flex flex-col items-center justify-center mt-8 mb-20 gap-4">
                        {submitMsg && (
                            <p className={`text-[20px] font-medium ${submitMsg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                                {submitMsg}
                            </p>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={submitLoading}
                            className="bg-black text-white rounded-[15px] w-full py-4 text-[25px] font-medium disabled:opacity-50"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                        >
                            {submitLoading ? 'Creating Event...' : 'Save and proceed'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEventPage;
