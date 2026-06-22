'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, ExternalLink, Upload, Search, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { CATEGORIES, CITIES, CATEGORY_DATA } from '@/app/events/create/data';
import { useRouter, useParams } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { uploadMedia } from '@/lib/api/admin';
import { eventsApi } from '@/lib/api/events';
import { organizerApi } from '@/lib/api/organizer';
import { toast } from '@/components/ui/Toast';
import { ArtistSection, TicketSection } from '@/components/events/shared/FormSections';
import InteractiveVenueMap from '@/components/events/InteractiveVenueMap';
import { EventMediaKind, validateEventMediaFile } from '@/lib/mediaValidation';

type EventPoc = { name: string; email: string; mobile: string };
type EventSalesNotif = { email: string; mobile: string };
type EventArtist = { id?: string | number; name: string; image_url: string; description: string };
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
        .map(item => ({ ...item, name: item.name?.trim() ?? '', image_url: item.image_url?.trim() ?? '', description: item.description?.trim() ?? '' }))
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

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const editorRef = useRef<HTMLDivElement>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [venueName, setVenueName] = useState('');
    const [venueAddress, setVenueAddress] = useState('');
    const [googleMapLink, setGoogleMapLink] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventStartHour, setEventStartHour] = useState('12');
    const [eventStartMinute, setEventStartMinute] = useState('00');
    const [eventStartAmpm, setEventStartAmpm] = useState('AM');
    const [duration, setDuration] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');
    const [landscapeUrl, setLandscapeUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

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
    const [isSalesPaused, setIsSalesPaused] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);

    const [originalEventDate, setOriginalEventDate] = useState<Date | null>(null);
    const [originalEventEndDate, setOriginalEventEndDate] = useState<Date | null>(null);
    const [isExtending, setIsExtending] = useState(false);
    const [guide, setGuide] = useState({
        languages: [''],
        minAge: 0,
        ticketRequiredAboveAge: 0,
        venueType: 'Indoor',
        audienceType: 'Seated',
        isKidFriendly: false,
        isPetFriendly: false,
        gatesOpenBefore: false,
        gatesOpenBeforeValue: 30,
        gatesOpenBeforeUnit: 'Minutes',
    });
    const [payment, setPayment] = useState({ organizerName: '', gstin: '', accountNumber: '', ifsc: '', accountType: '' });
    const [pocs, setPocs] = useState<EventPoc[]>([]);
    const [salesNotifs, setSalesNotifs] = useState<EventSalesNotif[]>([]);
    const [newPoc, setNewPoc] = useState({ name: '', email: '', mobile: '' });
    const [newSales, setNewSales] = useState({ email: '', mobile: '' });
    const [showInstructions, setShowInstructions] = useState(false);
    const [showYoutube, setShowYoutube] = useState(false);
    const [showProhibited, setShowProhibited] = useState(false);
    const [showFaqs, setShowFaqs] = useState(false);
    const [eventInstructions, setEventInstructions] = useState('');
    const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
    const [prohibitedItems, setProhibitedItems] = useState<string[]>([]);
    const [newProhibitedItem, setNewProhibitedItem] = useState('');
    const [faqs, setFaqs] = useState<{ id?: string | number; question: string; answer: string }[]>([]);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    // Artists
    const [artists, setArtists] = useState<EventArtist[]>([]);

    // Ticket Categories
    const [ticketCategories, setTicketCategories] = useState<EventTicketCategory[]>([]);

    // Layout-based event
    const [isLayoutBased, setIsLayoutBased] = useState(false);
    const [layoutJson, setLayoutJson] = useState('');

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selections, setSelections] = useState({ category: 'Select Category', subCategory: 'Select Sub-Category', city: 'Select City' });
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [isViewMode, setIsViewMode] = useState(true);
    const [originalData, setOriginalData] = useState<Record<string, any>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Map state
    const [showMap, setShowMap] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const API_KEY = "AIzaSyC2gFDSPGY7wtSFHzYwzbPkP6tcq61Lmt8";
    const [replacingGalleryIndex, setReplacingGalleryIndex] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasCheckedSession(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let h24 = parseInt(eventStartHour, 10);
        if (eventStartAmpm === 'PM' && h24 !== 12) {
            h24 += 12;
        } else if (eventStartAmpm === 'AM' && h24 === 12) {
            h24 = 0;
        }
        const formattedH24 = h24.toString().padStart(2, '0');
        const formattedMin = eventStartMinute.padStart(2, '0');
        setEventTime(`${formattedH24}:${formattedMin}`);
    }, [eventStartHour, eventStartMinute, eventStartAmpm]);

    useEffect(() => {
        if (!eventDate || !eventStartHour || !eventStartMinute || !eventStartAmpm || !duration) return;

        try {
            const [year, month, day] = eventDate.split('-').map(num => parseInt(num, 10));
            let startH24 = parseInt(eventStartHour, 10);
            if (eventStartAmpm === 'PM' && startH24 !== 12) {
                startH24 += 12;
            } else if (eventStartAmpm === 'AM' && startH24 === 12) {
                startH24 = 0;
            }
            const startMin = parseInt(eventStartMinute, 10);

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
    }, [eventDate, eventStartHour, eventStartMinute, eventStartAmpm, duration]);

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

            // Automatically fetch current location if no address set
            if (!venueAddress && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                        map.setCenter(pos);
                        map.setZoom(17);
                        placeMarker(pos);
                        reverseGeocode(pos);
                    }
                );
            } else if (venueAddress) {
                // If address exists, try to find it on map
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ address: venueAddress }, (results: any, status: any) => {
                    if (status === 'OK' && results[0]) {
                        const loc = results[0].geometry.location;
                        map.setCenter(loc);
                        map.setZoom(17);
                        placeMarker(loc);
                    }
                });
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
    }, [showMap, mapLoaded, venueAddress]);

    // Load existing event data
    useEffect(() => {
        if (!hasCheckedSession) return;
        
        const load = async () => {
            let session = getOrganizerSession();
            if (!session) { router.replace('/'); return; }

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

            try {
                // Load the organizer-owned event record so the editor reflects
                // the same source of truth that the organizer update endpoint writes to.
                const d = await eventsApi.getById(id) as Record<string, unknown>;
                setEventName((d.name as string) ?? '');
                const desc = (d.description as string) ?? '';
                setDescription(desc);
                setHasContent(!!desc);
                setVenueName((d.venue_name as string) ?? '');
                setVenueAddress((d.venue_address as string) ?? '');
                setGoogleMapLink((d.google_map_link as string) ?? '');
                setInstagramLink((d.instagram_link as string) ?? '');
                const timeStr = (d.time as string) ?? '';
                setEventTime(timeStr);
                if (timeStr) {
                    const [h24Str, mStr] = timeStr.split(':');
                    const h24 = parseInt(h24Str, 10);
                    if (!isNaN(h24)) {
                        const ampm = h24 >= 12 ? 'PM' : 'AM';
                        const h12 = (h24 % 12 || 12).toString();
                        setEventStartHour(h12);
                        setEventStartMinute(mStr || '00');
                        setEventStartAmpm(ampm);
                    }
                }
                setDuration((d.duration as string) ?? '');
                setPortraitUrl((d.portrait_image_url as string) ?? '');
                setLandscapeUrl((d.landscape_image_url as string) ?? '');
                setVideoUrl((d.card_video_url as string) ?? '');
                setGalleryUrls((d.gallery_urls as string[]) ?? []);

                if (d.date) {
                    const dt = new Date(d.date as string);
                    if (!isNaN(dt.getTime())) {
                        setEventDate(dt.toISOString().split('T')[0]);
                        setOriginalEventDate(dt);
                    }
                }

                if (d.ticket_open_date) {
                    const dt = new Date(d.ticket_open_date as string);
                    if (!isNaN(dt.getTime())) {
                        const y = dt.getFullYear();
                        const m = (dt.getMonth() + 1).toString().padStart(2, '0');
                        const dayVal = dt.getDate().toString().padStart(2, '0');
                        setTicketOpenDate(`${y}-${m}-${dayVal}`);
                        const h24 = dt.getHours();
                        const ampm = h24 >= 12 ? 'PM' : 'AM';
                        const h12 = (h24 % 12 || 12).toString();
                        setTicketOpenHour(h12);
                        setTicketOpenMinute(dt.getMinutes().toString().padStart(2, '0'));
                        setTicketOpenAmpm(ampm);
                    }
                }

                if (d.ticket_close_date) {
                    const dt = new Date(d.ticket_close_date as string);
                    if (!isNaN(dt.getTime())) {
                        const y = dt.getFullYear();
                        const m = (dt.getMonth() + 1).toString().padStart(2, '0');
                        const dayVal = dt.getDate().toString().padStart(2, '0');
                        setTicketCloseDate(`${y}-${m}-${dayVal}`);
                        const h24 = dt.getHours();
                        const ampm = h24 >= 12 ? 'PM' : 'AM';
                        const h12 = (h24 % 12 || 12).toString();
                        setTicketCloseHour(h12);
                        setTicketCloseMinute(dt.getMinutes().toString().padStart(2, '0'));
                        setTicketCloseAmpm(ampm);
                    }
                }

                if (d.event_end_date) {
                    const dt = new Date(d.event_end_date as string);
                    if (!isNaN(dt.getTime())) {
                        const y = dt.getFullYear();
                        const m = (dt.getMonth() + 1).toString().padStart(2, '0');
                        const dayVal = dt.getDate().toString().padStart(2, '0');
                        setEventEndDate(`${y}-${m}-${dayVal}`);
                        setOriginalEventEndDate(dt);
                        const h24 = dt.getHours();
                        const ampm = h24 >= 12 ? 'PM' : 'AM';
                        const h12 = (h24 % 12 || 12).toString();
                        setEventEndHour(h12);
                        setEventEndMinute(dt.getMinutes().toString().padStart(2, '0'));
                        setEventEndAmpm(ampm);
                    }
                }

                setTimezone((d.timezone as string) ?? 'Asia/Kolkata');
                setTotalTicketsAvailable(String((d.total_tickets_available as number) ?? 0));
                setIsSalesPaused((d.is_sales_paused as boolean) ?? false);
                setIsCanceled((d.is_canceled as boolean) ?? false);

                const g = (d.guide as Record<string, unknown>) ?? {};
                setGuide({
                    languages: (g.languages as string[]) ?? [''],
                    minAge: (g.min_age as number) ?? 0,
                    ticketRequiredAboveAge: (g.ticket_required_above_age as number) ?? 0,
                    venueType: (g.venue_type as string) ?? 'Indoor',
                    audienceType: (g.audience_type as string) ?? 'Seated',
                    isKidFriendly: (g.is_kid_friendly as boolean) ?? false,
                    isPetFriendly: (g.is_pet_friendly as boolean) ?? false,
                    gatesOpenBefore: (g.gates_open_before as boolean) ?? false,
                    gatesOpenBeforeValue: (g.gates_open_before_value as number) ?? 30,
                    gatesOpenBeforeUnit: (g.gates_open_before_unit as string) ?? 'Minutes',
                });
                const p = (d.payment as Record<string, unknown>) ?? {};
                setPayment({
                    organizerName: (p.organizer_name as string) ?? '',
                    gstin: (p.gstin as string) ?? '',
                    accountNumber: (p.account_number as string) ?? '',
                    ifsc: (p.ifsc as string) ?? '',
                    accountType: (p.account_type as string) ?? '',
                });
                const cleanedPocs = dedupePocs(((d.points_of_contact as EventPoc[]) ?? []));
                const cleanedSalesNotifs = dedupeSalesNotifs(((d.sales_notifications as EventSalesNotif[]) ?? []));
                setPocs(cleanedPocs);
                setSalesNotifs(cleanedSalesNotifs);
                const instructions = (d.event_instructions as string) ?? '';
                if (instructions) { setEventInstructions(instructions); setShowInstructions(true); }
                const yt = (d.youtube_video_url as string) ?? '';
                if (yt) { setYoutubeVideoUrl(yt); setShowYoutube(true); }
                const pi = (d.prohibited_items as string[]) ?? [];
                if (pi.length) { setProhibitedItems(pi); setShowProhibited(true); }
                const faqList = (d.faqs as { question: string; answer: string }[]) ?? [];
                if (faqList.length) { setFaqs(faqList); setShowFaqs(true); }
                // Artists
                const artistList = dedupeArtists((d.artists as EventArtist[]) ?? []);
                if (artistList.length) setArtists(artistList);
                // Ticket Categories
                const ticketCatList = dedupeTicketCategories(((d.ticket_categories as (Omit<EventTicketCategory, 'price' | 'capacity'> & { price: number; capacity: number })[]) ?? []).map(t => ({ ...t, price: String(t.price ?? ''), capacity: String(t.capacity ?? '') })));
                if (ticketCatList.length) setTicketCategories(ticketCatList);
                // Layout-based
                const isLayoutBasedVal = (d.is_layout_based as boolean) ?? false;
                const layoutJsonVal = (d.layout_json as string) ?? '';

                // Check if returning from layout editor with draft
                const draftKey = `event-edit-draft-${id}`;
                const savedDraft = sessionStorage.getItem(draftKey);
                if (savedDraft) {
                    try {
                        const draft = JSON.parse(savedDraft);
                        sessionStorage.removeItem(draftKey);
                        setIsLayoutBased(draft.isLayoutBased ?? isLayoutBasedVal);
                        setLayoutJson(draft.layoutJson ?? layoutJsonVal);
                        const savedLayoutJson = sessionStorage.getItem('ticket-layout-json');
                        if (savedLayoutJson) {
                            setLayoutJson(savedLayoutJson);
                            sessionStorage.removeItem('ticket-layout-json');
                        }
                        const lCats = sessionStorage.getItem('ticket-layout-categories');
                        if (lCats) {
                            try {
                                const parsed = JSON.parse(lCats);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                    setTicketCategories(dedupeTicketCategories(parsed));
                                }
                                sessionStorage.removeItem('ticket-layout-categories');
                            } catch (e) {
                                console.error("Error parsing ticket-layout-categories:", e);
                            }
                        }
                        if (draft.ticketCategories?.length) setTicketCategories(dedupeTicketCategories(draft.ticketCategories));
                    } catch { /* ignore */ }
                } else {
                    setIsLayoutBased(isLayoutBasedVal);
                    setLayoutJson(layoutJsonVal);
                }

                const cat = (d.category as string) ?? '';
                const sub = (d.sub_category as string) ?? '';
                const city = (d.city as string) ?? '';
                setSelections({
                    category: cat || 'Select Category',
                    subCategory: sub || 'Select Sub-Category',
                    city: city || 'Select City',
                });

                // Store original data for change detection
                const original = {
                    name: (d.name as string) ?? '',
                    description: (d.description as string) ?? '',
                    venue_name: (d.venue_name as string) ?? '',
                    venue_address: (d.venue_address as string) ?? '',
                    google_map_link: (d.google_map_link as string) ?? '',
                    instagram_link: (d.instagram_link as string) ?? '',
                    time: (d.time as string) ?? '',
                    duration: (d.duration as string) ?? '',
                    portrait_image_url: (d.portrait_image_url as string) ?? '',
                    landscape_image_url: (d.landscape_image_url as string) ?? '',
                    card_video_url: (d.card_video_url as string) ?? '',
                    gallery_urls: (d.gallery_urls as string[]) ?? [],
                    date: d.date ? new Date(d.date as string).toISOString().split('T')[0] : '',
                    guide: {
                        languages: (g.languages as string[]) ?? [''],
                        min_age: (g.min_age as number) ?? 0,
                        ticket_required_above_age: (g.ticket_required_above_age as number) ?? 0,
                        venue_type: (g.venue_type as string) ?? 'Indoor',
                        audience_type: (g.audience_type as string) ?? 'Seated',
                        is_kid_friendly: (g.is_kid_friendly as boolean) ?? false,
                        is_pet_friendly: (g.is_pet_friendly as boolean) ?? false,
                        gates_open_before: (g.gates_open_before as boolean) ?? false,
                        gates_open_before_value: (g.gates_open_before_value as number) ?? 30,
                        gates_open_before_unit: (g.gates_open_before_unit as string) ?? 'Minutes',
                    },
                    payment: {
                        organizer_name: (p.organizer_name as string) ?? '',
                        gstin: (p.gstin as string) ?? '',
                        account_number: (p.account_number as string) ?? '',
                        ifsc: (p.ifsc as string) ?? '',
                        account_type: (p.account_type as string) ?? '',
                    },
                    points_of_contact: cleanedPocs,
                    sales_notifications: cleanedSalesNotifs,
                    event_instructions: instructions,
                    youtube_video_url: yt,
                    prohibited_items: pi,
                    faqs: faqList.map(f => ({ question: f.question, answer: f.answer })),
                    artists: artistList.map(a => ({ name: a.name, image_url: a.image_url, description: a.description })),
                    ticket_categories: ticketCatList.map(t => ({ name: t.name, price: String(t.price ?? ''), capacity: String(t.capacity ?? ''), image_url: t.image_url, has_image: t.has_image })),
                    is_layout_based: isLayoutBasedVal,
                    layout_json: layoutJsonVal,
                    category: cat || '',
                    sub_category: sub || '',
                    city: city || '',
                };
                setOriginalData(original);
            } catch (err) {
                setSubmitMsg(err instanceof Error ? err.message : 'Failed to load event');
            } finally {
                setLoadingData(false);
            }
        };
        load();
    }, [id, router, hasCheckedSession]);

    // Separate effect to handle editor innerHTML once data is loaded and ref is available
    useEffect(() => {
        if (!loadingData && !isViewMode && editorRef.current && description) {
            // Only set if content is different to avoid cursor jump issues
            if (editorRef.current.innerHTML !== description) {
                editorRef.current.innerHTML = description;
            }
            setHasContent(true);
        }
    }, [loadingData, isViewMode, description]);

    const checkChanges = useCallback(() => {
        if (!originalData || Object.keys(originalData).length === 0) return;

        const parseDateString = (date: string, hour: string, minute: string, ampm: string) => {
            if (!date) return null;
            let h24 = parseInt(hour) % 12;
            if (ampm === 'PM') h24 += 12;
            const hourStr = h24.toString().padStart(2, '0');
            const minuteStr = minute.padStart(2, '0');
            try {
                const localISO = `${date}T${hourStr}:${minuteStr}:00`;
                const d = new Date(localISO);
                return d.toISOString();
            } catch (e) {
                return null;
            }
        };

        const currentData = {
            name: eventName,
            description: description,
            venue_name: venueName,
            venue_address: venueAddress,
            google_map_link: googleMapLink,
            instagram_link: instagramLink,
            time: eventTime,
            duration: duration,
            portrait_image_url: portraitUrl,
            landscape_image_url: landscapeUrl,
            card_video_url: videoUrl,
            gallery_urls: galleryUrls,
            date: eventDate,
            ticket_open_date: parseDateString(ticketOpenDate, ticketOpenHour, ticketOpenMinute, ticketOpenAmpm),
            ticket_close_date: parseDateString(ticketCloseDate, ticketCloseHour, ticketCloseMinute, ticketCloseAmpm),
            event_end_date: parseDateString(eventEndDate, eventEndHour, eventEndMinute, eventEndAmpm),
            guide: {
                languages: guide.languages.filter(Boolean),
                min_age: guide.minAge,
                ticket_required_above_age: guide.ticketRequiredAboveAge,
                venue_type: guide.venueType,
                audience_type: guide.audienceType,
                is_kid_friendly: guide.isKidFriendly,
                is_pet_friendly: guide.isPetFriendly,
                gates_open_before: guide.gatesOpenBefore,
                gates_open_before_value: guide.gatesOpenBeforeValue,
                gates_open_before_unit: guide.gatesOpenBeforeUnit,
            },
            payment: {
                organizer_name: payment.organizerName,
                gstin: payment.gstin,
                account_number: payment.accountNumber,
                ifsc: payment.ifsc,
                account_type: payment.accountType,
            },
            points_of_contact: dedupePocs(pocs),
            sales_notifications: dedupeSalesNotifs(salesNotifs),
            event_instructions: eventInstructions,
            youtube_video_url: youtubeVideoUrl,
            prohibited_items: prohibitedItems,
            faqs: faqs.map(f => ({ id: f.id, question: f.question, answer: f.answer })),
            artists: dedupeArtists(artists).map(a => ({ id: a.id, name: a.name, image_url: a.image_url, description: a.description })),
            ticket_categories: dedupeTicketCategories(ticketCategories).map(t => ({
                id: t.id,
                name: t.name,
                price: parseFloat(t.price) || 0,
                capacity: parseInt(t.capacity) || 0,
                image_url: t.image_url,
                has_image: t.has_image,
            })),
            is_layout_based: isLayoutBased,
            layout_json: layoutJson,
            category: selections.category === 'Select Category' ? '' : selections.category,
            sub_category: selections.subCategory === 'Select Sub-Category' ? '' : selections.subCategory,
            city: selections.city === 'Select City' ? '' : selections.city,
        };

        const hasFieldChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);
        setHasChanges(hasFieldChanges);
    }, [originalData, eventName, venueName, venueAddress, googleMapLink, instagramLink, eventTime, duration, portraitUrl, landscapeUrl, videoUrl, galleryUrls, eventDate, ticketOpenDate, ticketOpenHour, ticketOpenMinute, ticketOpenAmpm, ticketCloseDate, ticketCloseHour, ticketCloseMinute, ticketCloseAmpm, eventEndDate, eventEndHour, eventEndMinute, eventEndAmpm, guide, payment, pocs, salesNotifs, eventInstructions, youtubeVideoUrl, prohibitedItems, faqs, artists, ticketCategories, selections, isLayoutBased, layoutJson]);

    useEffect(() => {
        checkChanges();
    }, [checkChanges]);

    if (!authChecked && hasCheckedSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#D3CBF5]/10">
                <div className="bg-white rounded-[24px] p-10 shadow-lg max-w-md text-center space-y-4">
                    <h2 className="text-[24px] font-semibold text-black">Access Restricted</h2>
                    <p className="text-[16px] text-zinc-500">Your events registration must be approved by the admin before you can edit events.</p>
                    <button onClick={() => router.back()} className="bg-black text-white px-6 h-10 rounded-[12px] text-[14px] font-medium">Go Back</button>
                </div>
            </div>
        );
    }

    const handleUpload = async (key: EventMediaKind, file: File, multi = false) => {
        const validation = validateEventMediaFile(file, key);
        if (!validation.ok) {
            toast.warning(validation.message);
            return;
        }
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            if (multi && key === 'gallery') setGalleryUrls(prev => [...prev, url]);
            else if (key === 'portrait') setPortraitUrl(url);
            else if (key === 'landscape') setLandscapeUrl(url);
            else if (key === 'video') setVideoUrl(url);
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const handleArtistImageUpload = async (idx: number, file: File) => {
        const validation = validateEventMediaFile(file, 'artist');
        if (!validation.ok) {
            toast.warning(validation.message);
            return;
        }
        const key = `artist-${idx}`;
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            setArtists(prev => prev.map((a, i) => i === idx ? { ...a, image_url: url } : a));
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const handleTicketImageUpload = async (idx: number, file: File) => {
        const validation = validateEventMediaFile(file, 'ticket');
        if (!validation.ok) {
            toast.warning(validation.message);
            return;
        }
        const key = `ticket-${idx}`;
        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            setTicketCategories(prev => prev.map((t, i) => i === idx ? { ...t, image_url: url } : t));
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const handleReplaceGalleryImage = async (file: File, index: number) => {
        const validation = validateEventMediaFile(file, 'gallery');
        if (!validation.ok) {
            toast.warning(validation.message);
            return;
        }
        setUploading(u => ({ ...u, gallery_replace: true }));
        try {
            const url = await uploadMedia(file);
            setGalleryUrls(prev => prev.map((u, i) => i === index ? url : u));
            setReplacingGalleryIndex(null);
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, gallery_replace: false })); }
    };

    const makeUploadInput = (key: EventMediaKind, accept: string, multi = false) => (
        <input type="file" accept={accept} className="hidden" id={`upload-${key}`}
            onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(key, f, multi);
                e.currentTarget.value = '';
            }} />
    );

    const handleNavigateToLayoutEditor = () => {
        const draftKey = `event-edit-draft-${id}`;
        sessionStorage.setItem(draftKey, JSON.stringify({
            isLayoutBased: true,
            layoutJson,
            ticketCategories,
        }));
        if (layoutJson) sessionStorage.setItem('ticket-layout-json', layoutJson);
        sessionStorage.setItem('is-layout-based', 'true');
        sessionStorage.setItem('ticket-editor-return-url', `/events/edit/${id}`);
        router.push('/ticket-layout-editor');
    };

    const handleSubmit = async () => {
        const session = getOrganizerSession();
        if (!session) return;
        if (!eventName.trim()) { setSubmitMsg('Event name is required.'); return; }
        if (selections.category === 'Select Category') { setSubmitMsg('Please select a category.'); return; }
        if (!portraitUrl || !landscapeUrl) { setSubmitMsg('Please upload both portrait and landscape images.'); return; }

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

        // Get standard event 24-hour string for correct startDateTime ISO construction
        const get24HourTimeStr = () => {
            if (!eventTime) return '00:00';
            const [h, m] = eventTime.split(':');
            return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
        };
        const startDateTime = eventDate ? new Date(`${eventDate}T${get24HourTimeStr()}:00`) : null;
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
            await eventsApi.update(id, {
                name: eventName.trim(),
                description: editorRef.current?.innerHTML ?? '',
                category: selections.category,
                sub_category: selections.subCategory === 'Select Sub-Category' ? '' : selections.subCategory,
                city: selections.city === 'Select City' ? '' : selections.city,
                date: eventDate ? `${eventDate}T00:00:00Z` : eventDate,
                time: eventTime,
                duration,
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
                is_sales_paused: isSalesPaused,
                is_canceled: isCanceled,
                guide: {
                    languages: guide.languages.filter(Boolean),
                    min_age: guide.minAge,
                    ticket_required_above_age: guide.ticketRequiredAboveAge,
                    venue_type: guide.venueType,
                    audience_type: guide.audienceType,
                    is_kid_friendly: guide.isKidFriendly,
                    is_pet_friendly: guide.isPetFriendly,
                    gates_open_before: guide.gatesOpenBefore,
                    gates_open_before_value: guide.gatesOpenBeforeValue,
                    gates_open_before_unit: guide.gatesOpenBeforeUnit,
                    facilities: [],
                },
                event_instructions: eventInstructions,
                youtube_video_url: youtubeVideoUrl,
                prohibited_items: prohibitedItems,
                faqs,
                artists: dedupeArtists(artists).map(a => ({
                    id: a.id,
                    name: a.name,
                    image_url: a.image_url,
                    description: a.description,
                })),
                ticket_categories: dedupeTicketCategories(ticketCategories).map(t => ({
                    id: t.id,
                    name: t.name,
                    price: parseFloat(t.price) || 0,
                    capacity: parseInt(t.capacity) || 0,
                    image_url: t.image_url,
                    has_image: t.has_image,
                })),
                is_layout_based: isLayoutBased,
                layout_json: isLayoutBased ? layoutJson : '',
                payment: {
                    organizer_name: payment.organizerName,
                    gstin: payment.gstin,
                    account_number: payment.accountNumber,
                    ifsc: payment.ifsc,
                    account_type: payment.accountType,
                },
                points_of_contact: dedupePocs(pocs),
                sales_notifications: dedupeSalesNotifs(salesNotifs),
            });
            // cleanup session storage on success
            sessionStorage.removeItem(`event-edit-draft-${id}`);
            sessionStorage.removeItem('ticket-layout-json');
            sessionStorage.removeItem('is-layout-based');
            sessionStorage.removeItem('ticket-editor-return-url');
            setSubmitMsg('✅ Event updated successfully!');
            setTimeout(() => router.push('/organizer/dashboard?category=events'), 1800);
        } catch (err) {
            setSubmitMsg(err instanceof Error ? err.message : 'Update failed.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleDropdown = (name: string) => setOpenDropdown(openDropdown === name ? null : name);
    const handleSelect = (name: string, value: string) => {
        setSelections(prev => {
            const n = { ...prev, [name]: value };
            if (name === 'category') n.subCategory = 'Select Sub-Category';
            return n;
        });
        setOpenDropdown(null);
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
    const removePoc = (i: number) => setPocs(pocs.filter((_, idx) => idx !== i));
    const addSalesNotif = () => {
        if (!newSales.email || !newSales.mobile) return;
        const nextSales = { email: newSales.email.trim(), mobile: newSales.mobile.trim() };
        if (salesNotifs.some(sales => contactKey(sales) === contactKey(nextSales))) {
            setSubmitMsg('This sales notification contact is already added.');
            return;
        }
        setSalesNotifs(dedupeSalesNotifs([...salesNotifs, nextSales]));
        setNewSales({ email: '', mobile: '' });
    };
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

    const accentColor = '#5331EA';

    if (loadingData) return (
        <div className="min-h-screen flex items-center justify-center bg-[#D3CBF5]/10">
            <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#AC9BF7] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[16px] text-zinc-500">Loading event...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#D3CBF5]/10 overflow-x-hidden">
            <div className="w-full" style={{ zoom: '0.70' }}>
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    {/* Back + Title */}
                    <div className="mb-6">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-[18px] text-zinc-500 hover:text-black mb-4">
                            <ArrowLeft size={20} /> Back
                        </button>
                        <h1 className="text-[40px] font-medium leading-[44px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            {isViewMode ? 'View event' : 'Edit event'}
                        </h1>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-[25px] font-medium text-[#686868]">
                                {isViewMode ? 'Overview of your event details on Ticpin.' : 'Make changes and save to update your event on Ticpin.'}
                            </p>
                            <div className="flex items-center gap-4">
                                {isViewMode && hasChanges && (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitLoading}
                                        className="flex items-center gap-2 bg-[#5331EA] text-white px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-[#4326c7] transition-colors disabled:opacity-50"
                                    >
                                        {submitLoading ? 'Updating...' : 'UPDATE'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsViewMode(!isViewMode)}
                                    className="flex items-center gap-2 bg-black text-white px-6 h-10 rounded-[12px] text-[16px] font-medium hover:bg-zinc-800 transition-colors"
                                >
                                    {isViewMode ? 'Edit Details' : 'View Mode'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-[1800px] h-[1.5px] bg-gray-400 ml-[25px] mb-6" />

                    {/* Hidden upload inputs */}
                    {makeUploadInput('portrait', 'image/*')}
                    {makeUploadInput('landscape', 'image/*')}
                    {makeUploadInput('video', 'video/*')}
                    {makeUploadInput('gallery', 'image/*,video/*', true)}
                    <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        id="upload-gallery-replace"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f && replacingGalleryIndex !== null) {
                                handleReplaceGalleryImage(f, replacingGalleryIndex);
                            }
                            e.target.value = '';
                        }}
                    />

                    {/* Event Name */}
                    <div className="mb-12">
                        <label className="block text-[24px] font-medium mb-2 text-black mt-[20px]">Event name</label>
                        {isViewMode ? (
                            <p className="text-[35px] font-semibold text-black">{eventName || 'N/A'}</p>
                        ) : (
                            <>
                                <input type="text" placeholder="Your event's name" value={eventName} onChange={e => setEventName(e.target.value)}
                                    className="w-full text-[30px] font-medium text-black placeholder-[#AEAEAE] bg-transparent border-none outline-none mt-[-10px]" />
                                <div className="w-full h-[1px] bg-[#AEAEAE] mt-2" />
                            </>
                        )}
                    </div>

                    <div className="space-y-10 mt-[-30px]">
                        {/* Description */}
                        <section className="bg-white rounded-[15px] p-8 relative border border-zinc-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[30px] font-medium text-black">Event Description <span style={{ color: accentColor }}>*</span></h2>
                            </div>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-6" />
                            {isViewMode ? (
                                <div 
                                    className="prose prose-xl max-w-none text-[22px] text-zinc-700 min-h-[100px]"
                                    dangerouslySetInnerHTML={{ __html: description || 'No description provided.' }}
                                />
                            ) : (
                                <>
                                    <div className="flex gap-1 mb-4">
                                        <button onClick={() => handleFormat('bold')} className={`p-2 rounded ${isBold ? 'bg-gray-200' : ''}`}><Image src="/create event/bold.svg" alt="Bold" width={40} height={40} /></button>
                                        <button onClick={() => handleFormat('italic')} className={`p-2 rounded ${isItalic ? 'bg-gray-200' : ''}`}><Image src="/create event/italic.svg" alt="Italic" width={40} height={40} /></button>
                                        <button onClick={() => handleFormat('underline')} className={`p-2 rounded ${isUnderline ? 'bg-gray-200' : ''}`}><Image src="/create event/underline.svg" alt="Underline" width={40} height={40} /></button>
                                    </div>
                                    <div className="border border-[#AEAEAE] rounded-[10px] p-6 min-h-[260px] relative">
                                        <div ref={editorRef} contentEditable 
                                            onInput={e => {
                                                setDescription(e.currentTarget.innerHTML);
                                                setHasContent(e.currentTarget.innerText.length > 0);
                                            }}
                                            className="w-full h-full text-[30px] font-medium text-black outline-none min-h-[210px]" />
                                        {!hasContent && <div className="absolute top-6 left-6 text-[#AEAEAE] text-[25px] font-medium pointer-events-none">Your event's description</div>}
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Category */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-6">Event type <span style={{ color: accentColor }}>*</span></h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            {isViewMode ? (
                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Category</label>
                                        <p className="text-[24px] font-semibold text-black">{selections.category}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Sub-Category</label>
                                        <p className="text-[24px] font-semibold text-black">{selections.subCategory}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-12">
                                    {['category', 'subCategory'].map((key) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">{key === 'category' ? 'Category' : 'Sub-Category'} <span style={{ color: accentColor }}>*</span></label>
                                            <div className="relative w-full">
                                                <div onClick={() => toggleDropdown(key)} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer">
                                                    <span className={`text-[20px] ${selections[key as 'category' | 'subCategory'].startsWith('Select') ? 'text-[#686868]' : 'text-black'}`}>{selections[key as 'category' | 'subCategory']}</span>
                                                    {openDropdown === key ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                                </div>
                                                {openDropdown === key && (
                                                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#686868] rounded-[10px] mt-1 max-h-[300px] overflow-y-auto shadow-lg">
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
                                            <label className="text-[20px] font-medium text-[#686868]">Venue Name</label>
                                            <p className="text-[24px] font-semibold text-black">{venueName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Venue Address</label>
                                        <p className="text-[24px] font-semibold text-black">{venueAddress || 'N/A'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
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
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Event Date</label>
                                            <p className="text-[24px] font-semibold text-black">{eventDate || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Start Time</label>
                                            <p className="text-[24px] font-semibold text-black">{eventTime || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Duration</label>
                                            <p className="text-[24px] font-semibold text-black">{duration || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Ticket Scheduling & Capacity View */}
                                    <div className="border-t border-[#EAEAEA] pt-6 mt-6 space-y-6">
                                        <h4 className="text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Scheduling & Capacity</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Event Timezone</label>
                                                <p className="text-[24px] font-semibold text-black">{timezone}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Total Tickets Capacity</label>
                                                <p className="text-[24px] font-semibold text-black">{totalTicketsAvailable === '0' ? 'Unlimited' : totalTicketsAvailable}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Ticket Open Date & Time</label>
                                                <p className="text-[24px] font-semibold text-black font-anek-latin">
                                                    {ticketOpenDate ? `${ticketOpenDate} at ${ticketOpenHour}:${ticketOpenMinute} ${ticketOpenAmpm}` : 'Not scheduled'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Ticket Close Date & Time</label>
                                                <p className="text-[24px] font-semibold text-black font-anek-latin">
                                                    {ticketCloseDate ? `${ticketCloseDate} at ${ticketCloseHour}:${ticketCloseMinute} ${ticketCloseAmpm}` : 'Not scheduled'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Event End Date & Time</label>
                                                <p className="text-[24px] font-semibold text-black font-anek-latin">
                                                    {eventEndDate ? `${eventEndDate} at ${eventEndHour}:${eventEndMinute} ${eventEndAmpm}` : 'Not scheduled'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Sales Status</label>
                                                <p className="text-[24px] font-semibold text-black">{isSalesPaused ? 'Paused' : 'Active'}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">Event Status</label>
                                                <p className="text-[24px] font-semibold text-black">{isCanceled ? 'Canceled' : 'Active'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* City */}
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">City</label>
                                        <div className="relative w-full">
                                            <div onClick={() => toggleDropdown('city')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer">
                                                <span className={`text-[20px] ${selections.city === 'Select City' ? 'text-[#686868]' : 'text-black'}`}>{selections.city}</span>
                                                {openDropdown === 'city' ? <ChevronUp className="absolute right-6" size={24} /> : <ChevronDown className="absolute right-6" size={24} />}
                                            </div>
                                            {openDropdown === 'city' && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-[#686868] rounded-[10px] mt-1 max-h-[300px] overflow-y-auto shadow-lg">
                                                    {CITIES.map((opt, index) => <div key={`${opt}-${index}`} onClick={() => handleSelect('city', opt)} className="px-6 py-3 hover:bg-zinc-50 cursor-pointer text-[18px] transition-colors">{opt}</div>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Venue Name */}
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Venue Name</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                            <input type="text" placeholder="Enter venue name" value={venueName} onChange={e => setVenueName(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    {/* Venue Address */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[20px] font-medium text-[#686868]">Venue Address</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowMap(!showMap)}
                                                className="flex items-center gap-2 border border-[#686868] rounded-[10px] h-[40px] px-4 bg-white text-black text-[14px] font-medium hover:bg-zinc-50 transition-colors"
                                            >
                                                {showMap ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                {showMap ? 'Hide Map' : 'Pick on Map'}
                                            </button>
                                        </div>
                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-4 mt-[10px]">
                                            <Search className="text-[#AEAEAE]" size={24} />
                                            <input type="text" placeholder="Search address" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
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
                                    {/* Google Map + Instagram */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Google Maps Link</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                <input type="text" placeholder="Paste Google Maps URL" value={googleMapLink} onChange={e => setGoogleMapLink(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Instagram Link</label>
                                            <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                <input type="text" placeholder="Instagram link" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Date / Time / Duration */}
                                    {(() => {
                                        const isStartPassed = originalEventDate && originalEventDate.getTime() < Date.now();
                                        const isEndPassed = originalEventEndDate && originalEventEndDate.getTime() < Date.now();
                                        return (
                                            <>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[20px] font-medium text-[#686868]">Event Date</label>
                                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                            <input
                                                                type="date"
                                                                value={eventDate}
                                                                onChange={e => setEventDate(e.target.value)}
                                                                className="w-full bg-transparent outline-none text-[20px] text-black"
                                                            />
                                                        </div>
                                                        {isStartPassed && <span className="text-[14px] text-amber-600 font-medium font-anek-latin">Event has already started. You can reschedule it by selecting a future date.</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[20px] font-medium text-[#686868]">Start Time</label>
                                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px] gap-3">
                                                            <select value={eventStartHour} onChange={e => setEventStartHour(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                                {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                            </select>
                                                            <span className="text-[20px] text-black">:</span>
                                                            <select value={eventStartMinute} onChange={e => setEventStartMinute(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                                {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                            </select>
                                                            <select value={eventStartAmpm} onChange={e => setEventStartAmpm(e.target.value)} className="bg-transparent outline-none text-[20px] text-black w-[60px]">
                                                                <option value="AM">AM</option>
                                                                <option value="PM">PM</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[20px] font-medium text-[#686868]">Duration</label>
                                                        <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full appearance-none bg-transparent outline-none text-[20px] text-black">
                                                                <option value="">Select duration</option>
                                                                {["30 mins", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "3.5 hours", "4 hours", "5 hours", "6 hours", "All day"].map(d => <option key={d} value={d}>{d}</option>)}
                                                            </select>
                                                            <ChevronDown size={20} className="absolute right-6 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ticket Scheduling & Capacity Edit */}
                                                <div className="border-t border-[#EAEAEA] pt-6 mt-6 space-y-6">
                                                    <h4 className="text-[22px] font-semibold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Scheduling & Capacity</h4>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Timezone & Total Capacity */}
                                                        <div className="space-y-2">
                                                            <label className="text-[20px] font-medium text-[#686868]">Event Timezone</label>
                                                            <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                                                <select
                                                                    value={timezone}
                                                                    onChange={e => setTimezone(e.target.value)}
                                                                    className="w-full appearance-none bg-transparent outline-none text-[20px] text-black"
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
                                                            <label className="text-[20px] font-medium text-[#686868]">Total Tickets Capacity</label>
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
                                                            <label className="text-[20px] font-medium text-[#686868]">Ticket Open Date & Time</label>
                                                            <div className="flex gap-3">
                                                                <div className="flex-1 border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4">
                                                                    <input
                                                                        type="date"
                                                                        value={ticketOpenDate}
                                                                        onChange={e => setTicketOpenDate(e.target.value)}
                                                                        className="w-full bg-transparent outline-none text-[18px] text-black"
                                                                    />
                                                                </div>
                                                                <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4 gap-2">
                                                                    <select value={ticketOpenHour} onChange={e => setTicketOpenHour(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                        {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                                    </select>
                                                                    <span className="text-[18px] text-black">:</span>
                                                                    <select value={ticketOpenMinute} onChange={e => setTicketOpenMinute(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                        {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                    <select value={ticketOpenAmpm} onChange={e => setTicketOpenAmpm(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[50px]">
                                                                        <option value="AM">AM</option>
                                                                        <option value="PM">PM</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Ticket Close Date & Time */}
                                                        <div className="space-y-2">
                                                            <label className="text-[20px] font-medium text-[#686868]">Ticket Close Date & Time</label>
                                                            <div className="flex gap-3">
                                                                <div className="flex-1 border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4">
                                                                    <input
                                                                        type="date"
                                                                        value={ticketCloseDate}
                                                                        onChange={e => setTicketCloseDate(e.target.value)}
                                                                        className="w-full bg-transparent outline-none text-[18px] text-black"
                                                                    />
                                                                </div>
                                                                <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4 gap-2">
                                                                    <select value={ticketCloseHour} onChange={e => setTicketCloseHour(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                        {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                                    </select>
                                                                    <span className="text-[18px] text-black">:</span>
                                                                    <select value={ticketCloseMinute} onChange={e => setTicketCloseMinute(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                        {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                    </select>
                                                                    <select value={ticketCloseAmpm} onChange={e => setTicketCloseAmpm(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[50px]">
                                                                        <option value="AM">AM</option>
                                                                        <option value="PM">PM</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Event End Date & Time */}
                                                        <div className="space-y-2">
                                                            <label className="text-[20px] font-medium text-[#686868]">Event End Date & Time</label>
                                                            <div className="space-y-2">
                                                                {isEndPassed && (
                                                                    <p className="text-[16px] text-amber-600 font-semibold font-anek-latin">Event has ended. You can extend it by selecting a future date.</p>
                                                                )}
                                                                <div className="flex gap-3">
                                                                    <div className="flex-1 border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4">
                                                                        <input
                                                                            type="date"
                                                                            value={eventEndDate}
                                                                            onChange={e => setEventEndDate(e.target.value)}
                                                                            className="w-full bg-transparent outline-none text-[18px] text-black"
                                                                        />
                                                                    </div>
                                                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-4 gap-2">
                                                                        <select value={eventEndHour} onChange={e => setEventEndHour(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                            {['12','1','2','3','4','5','6','7','8','9','10','11'].map(h => <option key={h} value={h}>{h}</option>)}
                                                                        </select>
                                                                        <span className="text-[18px] text-black">:</span>
                                                                        <select value={eventEndMinute} onChange={e => setEventEndMinute(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[45px]">
                                                                            {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                        </select>
                                                                        <select value={eventEndAmpm} onChange={e => setEventEndAmpm(e.target.value)} className="bg-transparent outline-none text-[18px] text-black w-[50px]">
                                                                            <option value="AM">AM</option>
                                                                            <option value="PM">PM</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sales Paused and Event Canceled Manual Controls */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#EAEAEA] pt-6 mt-6">
                                                        <div className="flex items-center justify-between border border-[#686868] rounded-[10px] p-6">
                                                            <div>
                                                                <h5 className="text-[20px] font-semibold text-black">Pause Ticket Sales</h5>
                                                                <p className="text-[16px] text-zinc-500">Temporarily stop ticket bookings for this event.</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsSalesPaused(!isSalesPaused)}
                                                                className={`px-6 h-[48px] rounded-[8px] text-[16px] font-medium transition-all ${isSalesPaused ? 'bg-red-500 text-white' : 'bg-zinc-200 text-black hover:bg-zinc-300'}`}
                                                            >
                                                                {isSalesPaused ? 'Resume Sales' : 'Pause Sales'}
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center justify-between border border-[#686868] rounded-[10px] p-6">
                                                            <div>
                                                                <h5 className="text-[20px] font-semibold text-black">Cancel Event</h5>
                                                                <p className="text-[16px] text-zinc-500">Formally cancel the event and block all ticket sales.</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsCanceled(!isCanceled)}
                                                                className={`px-6 h-[48px] rounded-[8px] text-[16px] font-medium transition-all ${isCanceled ? 'bg-red-600 text-white' : 'bg-zinc-200 text-black hover:bg-zinc-300'}`}
                                                            >
                                                                {isCanceled ? 'Re-activate Event' : 'Cancel Event'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </section>

                        {/* Images */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-2">Event card images <span style={{ color: accentColor }}>*</span></h2>
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
                                                    <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Video */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-2">Event card video</h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[20px] font-semibold text-[#686868]">Video</p>
                                    <p className="text-[18px] text-black">3:4 · max 5MB · .mov or .mp4</p>
                                </div>
                                {videoUrl && <p className="text-[13px] text-green-600 font-medium">✓ Uploaded</p>}
                                {!isViewMode && (
                                    <label htmlFor="upload-video" className="cursor-pointer">
                                        <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-white">
                                            <span className="px-5 text-[15px] font-medium text-black">{uploading.video ? 'Uploading...' : videoUrl ? 'Replace' : 'Upload'}</span>
                                            <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </section>

                        {/* Gallery */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black mb-2">Gallery</h2>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            {galleryUrls.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {galleryUrls.map((u, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="relative w-[100px] h-[100px] rounded-[10px] overflow-hidden border border-[#AEAEAE]">
                                                <Image src={u} alt="" fill className="object-cover" />
                                            </div>
                                            {!isViewMode && (
                                                <div className="flex flex-col items-center gap-1 w-full">
                                                    <label
                                                        htmlFor="upload-gallery-replace"
                                                        onClick={() => setReplacingGalleryIndex(i)}
                                                        className="cursor-pointer text-[12px] bg-zinc-100 text-black w-full text-center py-1 rounded-[4px] font-medium hover:bg-zinc-200 transition-colors border border-[#AEAEAE]"
                                                    >
                                                        {uploading.gallery_replace && replacingGalleryIndex === i ? 'Uploading...' : 'Replace'}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGalleryUrls(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="text-[12px] bg-red-50 text-red-600 w-full text-center py-1 rounded-[4px] font-medium hover:bg-red-100 transition-colors border border-red-200"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isViewMode && (
                                <label htmlFor="upload-gallery" className="cursor-pointer inline-flex">
                                    <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                        <span className="px-5 text-[15px] font-medium text-black">{uploading.gallery ? 'Uploading...' : `Add more (${galleryUrls.length})`}</span>
                                        <div className="bg-[#AC9BF7] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                    </div>
                                </label>
                            )}
                        </section>

                        {/* Artists & Tickets */}
                        <ArtistSection artists={artists} onChange={setArtists} onUpload={handleArtistImageUpload} />

                        {/* Ticket Categories - Dual Mode */}
                        <section className="bg-white rounded-[15px] p-8 shadow-sm border border-zinc-100">
                            <h2 className="text-[30px] font-medium text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>Ticket Categories <span style={{ color: '#5331EA' }}>*</span></h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>Define standard ticket tiers, or switch to an interactive visual venue layout.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />

                            {/* Mode Toggle */}
                            <div className="mb-8 flex gap-3 max-w-[420px] bg-gray-100 p-1 rounded-[12px]">
                                <button
                                    type="button"
                                    onClick={() => { setIsLayoutBased(false); setLayoutJson(''); setTicketCategories([]); }}
                                    className={`flex-1 py-3 text-[18px] font-semibold rounded-[8px] transition-all duration-200 ${
                                        !isLayoutBased ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Standard Tickets
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsLayoutBased(true); setTicketCategories([]); }}
                                    className={`flex-1 py-3 text-[18px] font-semibold rounded-[8px] transition-all duration-200 ${
                                        isLayoutBased ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    Interactive Layout
                                </button>
                            </div>

                            {!isLayoutBased ? (
                                <TicketSection categories={ticketCategories} onChange={setTicketCategories} onUpload={handleTicketImageUpload} />
                            ) : (
                                <div className="border border-dashed border-[#AEAEAE] rounded-[15px] p-10 text-center bg-gray-50/50">
                                    {!layoutJson ? (
                                        <div className="space-y-6">
                                            <div className="max-w-md mx-auto">
                                                <h3 className="text-[24px] font-semibold text-black mb-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>Interactive Venue Map</h3>
                                                <p className="text-[18px] text-[#686868] mb-6" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                                    Design a custom visual seating layout. Ticket categories and pricing will be mapped directly from your design.
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
                                            <div className="max-w-md mx-auto bg-green-50 border border-green-200 rounded-[12px] p-4 flex items-center gap-3 justify-center">
                                                <span className="text-[20px] text-green-700 font-semibold">✓ Seating Layout Configured</span>
                                            </div>

                                            {/* Visual Map Preview */}
                                            <div className="w-full max-w-[600px] mx-auto bg-white border border-gray-200 rounded-[15px] p-6 shadow-sm select-none">
                                                <h4 className="text-[20px] font-semibold text-black mb-4 text-center" style={{ fontFamily: 'var(--font-anek-latin)' }}>Seating Layout Visual Map</h4>
                                                <InteractiveVenueMap
                                                    layoutJson={layoutJson}
                                                    selectedSectionName={null}
                                                    onSelectSection={() => {}}
                                                    getZonePrice={(name) => {
                                                        const cat = ticketCategories.find(c => c.name.toUpperCase() === name.toUpperCase());
                                                        return cat ? `₹${cat.price}` : '—';
                                                    }}
                                                    getZoneQuantity={() => 0}
                                                />
                                            </div>

                                            <h4 className="text-[22px] font-semibold text-black text-left" style={{ fontFamily: 'var(--font-anek-latin)' }}>Mapped Ticket Categories:</h4>
                                            <div className="overflow-hidden border border-gray-200 rounded-[12px] bg-white text-left">
                                                <table className="w-full text-[18px] border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-[#686868]">
                                                            <th className="px-6 py-3">Category</th>
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
                                                        if (window.confirm('Clear the layout? This will delete all mapped categories.')) {
                                                            setLayoutJson('');
                                                            setTicketCategories([]);
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

                        {/* Event Guide */}
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            <h3 className="text-[30px] font-medium text-black mb-6">Event Guide</h3>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8" />
                            <div className="space-y-6">
                                {[
                                    { label: 'Language', field: 'languages', type: 'select-lang' },
                                    { label: 'Min Age', field: 'minAge', type: 'select-age' },
                                    { label: 'Ticket required above age', field: 'ticketRequiredAboveAge', type: 'select-age' },
                                    { label: 'Venue type', field: 'venueType', type: 'select', opts: ['Indoor', 'Outdoor', 'Both'] },
                                    { label: 'Audience type', field: 'audienceType', type: 'select', opts: ['Seated', 'Standing', 'Seated + Standing'] },
                                    { label: 'Kid-friendly?', field: 'isKidFriendly', type: 'bool' },
                                    { label: 'Pet-friendly?', field: 'isPetFriendly', type: 'bool' },
                                    { label: 'Gates open before?', field: 'gatesOpenBefore', type: 'bool' },
                                ].map(({ label, field, type, opts }) => (
                                    <div key={field} className="flex items-center justify-between">
                                        <span className="text-[25px] font-medium text-black">{label} <span className="text-[#5331EA]">*</span></span>
                                        <div className={`relative border border-[#686868] rounded-[10px] h-[64px] w-[840px] flex items-center px-6 ${isViewMode ? 'bg-zinc-50 border-zinc-200' : ''}`}>
                                            {isViewMode ? (
                                                <p className="text-[25px] font-semibold text-black">
                                                    {field === 'languages' ? guide.languages.join(', ') : 
                                                     (type === 'bool' ? (guide[field as 'isKidFriendly'|'isPetFriendly'|'gatesOpenBefore'] ? 'Yes' : 'No') : 
                                                     guide[field as 'minAge'|'ticketRequiredAboveAge'|'venueType'|'audienceType'])}
                                                </p>
                                            ) : (
                                                <>
                                                    {type === 'select-lang' && (
                                                        <select value={guide.languages[0] || ''} onChange={e => setGuide({ ...guide, languages: [e.target.value] })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                            <option value="">Select Language</option>
                                                            {["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Punjabi", "Other"].map(l => <option key={l} value={l}>{l}</option>)}
                                                        </select>
                                                    )}
                                                    {type === 'select-age' && (
                                                        <select value={guide[field as 'minAge' | 'ticketRequiredAboveAge']} onChange={e => setGuide({ ...guide, [field]: Number(e.target.value) })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                            {[0, 5, 10, 12, 14, 16, 18, 21].map(a => <option key={a} value={a}>{a}</option>)}
                                                        </select>
                                                    )}
                                                    {type === 'select' && (
                                                        <select value={guide[field as 'venueType' | 'audienceType']} onChange={e => setGuide({ ...guide, [field]: e.target.value })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                            {(opts ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    )}
                                                    {type === 'bool' && (
                                                        <select value={guide[field as 'isKidFriendly' | 'isPetFriendly' | 'gatesOpenBefore'] ? 'Yes' : 'No'} onChange={e => setGuide({ ...guide, [field]: e.target.value === 'Yes' })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                            {['Yes', 'No'].map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    )}
                                                    <ChevronDown size={24} className="absolute right-6" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {/* Gates open before value + unit */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[25px] font-medium text-[#5331EA]">Gates open before <span>*</span></span>
                                    <div className="flex gap-4 w-[840px]">
                                        <div className={`relative border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6 ${isViewMode ? 'bg-zinc-50 border-zinc-200' : ''}`}>
                                            {isViewMode ? (
                                                <p className="text-[25px] font-semibold text-black">{guide.gatesOpenBeforeValue}</p>
                                            ) : (
                                                <>
                                                    <select value={guide.gatesOpenBeforeValue} onChange={e => setGuide({ ...guide, gatesOpenBeforeValue: Number(e.target.value) })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                        {[...Array(60)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-6" />
                                                </>
                                            )}
                                        </div>
                                        <div className={`relative border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6 ${isViewMode ? 'bg-zinc-50 border-zinc-200' : ''}`}>
                                            {isViewMode ? (
                                                <p className="text-[25px] font-semibold text-black">{guide.gatesOpenBeforeUnit}</p>
                                            ) : (
                                                <>
                                                    <select value={guide.gatesOpenBeforeUnit} onChange={e => setGuide({ ...guide, gatesOpenBeforeUnit: e.target.value })} className="w-full appearance-none bg-transparent outline-none text-[25px]">
                                                        {['Minutes', 'Hours'].map(u => <option key={u} value={u}>{u}</option>)}
                                                    </select>
                                                    <ChevronDown size={24} className="absolute right-6" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Optional Sections Toggle */}
                        {!isViewMode && (
                            <section className="bg-[#D8D8D8] rounded-[15px] p-6">
                                <h3 className="text-[25px] font-semibold text-black mb-4">Optional sections</h3>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { name: 'Event Instructions', toggle: () => setShowInstructions(!showInstructions), active: showInstructions },
                                        { name: 'Youtube Video', toggle: () => setShowYoutube(!showYoutube), active: showYoutube },
                                        { name: 'Prohibited Items', toggle: () => setShowProhibited(!showProhibited), active: showProhibited },
                                        { name: 'FAQs', toggle: () => setShowFaqs(!showFaqs), active: showFaqs },
                                    ].map((btn, idx) => (
                                        <button key={idx} onClick={btn.toggle} className="flex items-center bg-white rounded-[6px] h-[42px] overflow-hidden">
                                            <span className="px-4 text-[19px] font-medium text-black">{btn.name}</span>
                                            <div className={`w-[42px] h-full flex items-center justify-center ${btn.active ? 'bg-black' : 'bg-[#AC9BF7]'}`}>
                                                <PlusCircle size={20} className={btn.active ? 'text-white' : 'text-black'} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {showInstructions && (
                            <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                                <h2 className="text-[30px] font-medium text-black mb-4">Event Instructions</h2>
                                {isViewMode ? (
                                    <p className="text-[22px] text-zinc-700 whitespace-pre-wrap">{eventInstructions || 'N/A'}</p>
                                ) : (
                                    <div className="border border-[#686868] rounded-[10px] p-4">
                                        <textarea value={eventInstructions} onChange={e => setEventInstructions(e.target.value)} placeholder="Enter instructions..." className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE] min-h-[100px] resize-y" />
                                    </div>
                                )}
                            </section>
                        )}
                        {showYoutube && (
                            <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                                <h2 className="text-[30px] font-medium text-black mb-4">YouTube Video</h2>
                                {isViewMode ? (
                                    <a href={youtubeVideoUrl} target="_blank" rel="noopener noreferrer" className="text-[22px] text-blue-600 hover:underline">{youtubeVideoUrl || 'N/A'}</a>
                                ) : (
                                    <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" placeholder="YouTube URL" value={youtubeVideoUrl} onChange={e => setYoutubeVideoUrl(e.target.value)} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                )}
                            </section>
                        )}
                        {showProhibited && (
                            <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                                <h2 className="text-[30px] font-medium text-black mb-4">Prohibited Items</h2>
                                {!isViewMode && (
                                    <div className="flex gap-4 mb-4">
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex-1 flex items-center px-6">
                                            <input type="text" placeholder="Add item" value={newProhibitedItem} onChange={e => setNewProhibitedItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addProhibitedItem()} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                        <button onClick={addProhibitedItem} className="bg-black text-white px-8 rounded-[10px] font-medium text-[20px]">Add</button>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-3">
                                    {prohibitedItems.map((item, i) => (
                                        <div key={i} className="bg-zinc-100 px-4 py-2 rounded-lg flex items-center gap-2">
                                            <span>{item}</span>{!isViewMode && <button onClick={() => setProhibitedItems(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500">×</button>}
                                        </div>
                                    ))}
                                    {prohibitedItems.length === 0 && <p className="text-zinc-500 italic">No prohibited items listed.</p>}
                                </div>
                            </section>
                        )}
                        {showFaqs && (
                            <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                                <h2 className="text-[30px] font-medium text-black mb-4">FAQs</h2>
                                {!isViewMode && (
                                    <div className="space-y-4 mb-4">
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                            <input type="text" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6">
                                            <input type="text" placeholder="Answer" value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} onKeyDown={e => e.key === 'Enter' && addFaq()} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                        </div>
                                        <button onClick={addFaq} className="bg-black text-white w-full h-[64px] rounded-[10px] font-medium text-[20px]">Add FAQ</button>
                                    </div>
                                )}
                                {faqs.map((faq, i) => (
                                    <div key={i} className="bg-zinc-100 p-4 rounded-lg relative mb-2">
                                        <p className="font-semibold text-[18px]">Q: {faq.question}</p>
                                        <p className="text-[18px] text-zinc-600">A: {faq.answer}</p>
                                        {!isViewMode && <button onClick={() => setFaqs(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-500 text-[14px]">Remove</button>}
                                    </div>
                                ))}
                                {faqs.length === 0 && <p className="text-zinc-500 italic">No FAQs added.</p>}
                            </section>
                        )}

                        {/* Payment */}
                        <h2 className="text-[30px] font-medium text-black mb-6 ml-[25px]">Confirm your payment and contact details</h2>
                        <section className="bg-white rounded-[15px] p-8 border border-zinc-100 shadow-sm">
                            {isViewMode ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Organiser</label>
                                            <p className="text-[24px] font-semibold text-black">{payment.organizerName || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">GSTIN</label>
                                            <p className="text-[24px] font-semibold text-black">{payment.gstin || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Account Number</label>
                                            <p className="text-[24px] font-semibold text-black">{payment.accountNumber || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">IFSC</label>
                                            <p className="text-[24px] font-semibold text-black">{payment.ifsc || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[20px] font-medium text-[#686868]">Account Type</label>
                                            <p className="text-[24px] font-semibold text-black">{payment.accountType || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">Organiser *</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                            <input type="text" placeholder="Organiser Name" value={payment.organizerName} onChange={e => setPayment({ ...payment, organizerName: e.target.value })} className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[20px] font-medium text-[#686868]">GSTIN:</label>
                                        <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                            <input type="text" placeholder="GSTIN" value={payment.gstin} onChange={e => setPayment({ ...payment, gstin: e.target.value })} className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE]" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-8">
                                        {[['Account Number', 'accountNumber', 'Account Number'], ['IFSC', 'ifsc', 'IFSC Code'], ['Account Type', 'accountType', 'e.g. Current, Savings']].map(([label, key, ph]) => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-[20px] font-medium text-[#686868]">{label}:</label>
                                                <div className="border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[10px]">
                                                    <input type="text" placeholder={ph} value={payment[key as keyof typeof payment]} onChange={e => setPayment({ ...payment, [key]: e.target.value })} className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* POC */}
                        <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8 border border-zinc-100 shadow-sm">
                            <div>
                                <h2 className="text-[30px] font-medium text-black">Point of Contact <span className="text-[#5331EA]">*</span></h2>
                                <p className="text-[20px] text-[#AEAEAE] mt-1">POCs with whom event feedback will be shared</p>
                            </div>
                            {!isViewMode && (
                                <div className="grid grid-cols-3 gap-8">
                                    {[['Name', 'name', 'Enter name'], ['Mail', 'email', 'Enter email'], ['Mobile', 'mobile', 'Enter mobile']].map(([label, key, ph]) => (
                                        <div key={key} className="space-y-3">
                                            <label className="text-[20px] font-medium text-[#686868]">{label}</label>
                                            <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                                <input type="text" placeholder={ph} value={newPoc[key as 'name' | 'email' | 'mobile']} onChange={e => setNewPoc({ ...newPoc, [key]: e.target.value })} className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {pocs.map((poc, i) => (
                                <div key={i} className="flex items-center justify-between bg-[#F5F5F5] rounded-[10px] px-6 py-3">
                                    <span className="text-[20px]">{poc.name} — {poc.email} — {poc.mobile}</span>
                                    {!isViewMode && <button onClick={() => removePoc(i)} className="text-red-500 text-[14px]">Remove</button>}
                                </div>
                            ))}
                            {pocs.length === 0 && <p className="text-zinc-500 italic">No POCs added.</p>}
                            {!isViewMode && (
                                <div className="flex justify-end">
                                    <button onClick={addPoc} className="bg-black text-white rounded-[15px] h-[65px] px-6 flex items-center gap-3 text-[25px] font-medium"><PlusCircle size={24} /> ADD</button>
                                </div>
                            )}
                        </section>

                        {/* Sales Notifications */}
                        <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8 border border-zinc-100 shadow-sm">
                            <h2 className="text-[30px] font-medium text-black">Send a copy of every sale to</h2>
                            {!isViewMode && (
                                <div className="grid grid-cols-2 gap-8">
                                    {[['Mail', 'email', 'Enter email'], ['Mobile', 'mobile', 'Enter mobile']].map(([label, key, ph]) => (
                                        <div key={key} className="space-y-3">
                                            <label className="text-[20px] font-medium text-[#686868]">{label}</label>
                                            <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                                <input type="text" placeholder={ph} value={newSales[key as 'email' | 'mobile']} onChange={e => setNewSales({ ...newSales, [key]: e.target.value })} className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {salesNotifs.map((s, i) => (
                                <div key={i} className="flex items-center justify-between bg-[#F5F5F5] rounded-[10px] px-6 py-3">
                                    <span className="text-[20px]">{s.email} — {s.mobile}</span>
                                    {!isViewMode && <button onClick={() => removeSalesNotif(i)} className="text-red-500 text-[14px]">Remove</button>}
                                </div>
                            ))}
                            {salesNotifs.length === 0 && <p className="text-zinc-500 italic">No sales notifications configured.</p>}
                            {!isViewMode && (
                                <div className="flex justify-end">
                                    <button onClick={addSalesNotif} className="bg-black text-white rounded-[15px] h-[65px] px-6 flex items-center gap-3 text-[25px] font-medium"><PlusCircle size={24} /> ADD</button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Save */}
                    {!isViewMode && (
                        <div className="flex flex-col items-center mt-8 mb-20 gap-4">
                            {submitMsg && <p className={`text-[20px] font-medium ${submitMsg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{submitMsg}</p>}
                            <button onClick={handleSubmit} disabled={submitLoading} className="bg-black text-white rounded-[15px] w-full py-4 text-[25px] font-medium disabled:opacity-50">
                                {submitLoading ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
