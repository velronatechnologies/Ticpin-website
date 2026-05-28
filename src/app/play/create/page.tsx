'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Info, PlusCircle, ExternalLink, Bold, Italic, Underline, Search, Upload, Trash2, Edit2 } from 'lucide-react';
import { CATEGORIES, CITIES, CATEGORY_DATA } from './data';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/Toast';

import { getOrganizerSession } from '@/lib/auth/organizer';
import { uploadMedia } from '@/lib/api/admin';
import { playApi } from '@/lib/api/play';
import { organizerApi } from '@/lib/api/organizer';
import { usePlayCreateStore, type Selections, type PaymentDetails } from '@/store/playCreateStore';

const CreatePlayPage = () => {
    const router = useRouter();
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const {
        venueName, portraitUrl, landscapeUrl, secondaryBannerUrl, videoUrl, galleryUrls, instagramLink, googleMapLink, venueAddress,
        timeHour, timeMinute, timePeriod, closeHour, closeMinute, closePeriod,
        facilities, petFriendly, outsideFood, venueLocationType, surfaceType, cancellations, changingRooms, equipmentRentals, maxDuration,
        payment, pocs, salesNotifs, playInstructions, youtubeVideoUrl, prohibitedItems, faqs, courts, selections, description,
        setField, setPaymentField, setSelection, toggleFacility, addGalleryUrl, addProhibitedItem, removeProhibitedItem,
        addFaq, removeFaq, addPoc, removePoc, addSalesNotif, removeSalesNotif, clearDraft
    } = usePlayCreateStore();

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
            router.replace('/list-your-play/Login');
            return;
        }

        // Check if organizer has approved play registration
        if (!session.isAdmin && session.categoryStatus?.play !== 'approved') {
            router.replace('/list-your-play/Login');
            return;
        }

        setAuthChecked(true);
    }, [hasCheckedSession, router]);

    // Clear draft on component mount for fresh start
    useEffect(() => {
        if (!authChecked) return;
        clearDraft();
    }, [authChecked, clearDraft]);

    // Map legacy setters to zustand setters
    const setVenueName = (v: any) => setField('venueName', typeof v === 'function' ? v(venueName) : v);
    const setPortraitUrl = (v: any) => setField('portraitUrl', v);
    const setLandscapeUrl = (v: any) => setField('landscapeUrl', v);
    const setSecondaryBannerUrl = (v: any) => setField('secondaryBannerUrl', v);
    const setVideoUrl = (v: any) => setField('videoUrl', v);
    const setGalleryUrls = (v: any) => typeof v === 'function' ? setField('galleryUrls', v(galleryUrls)) : setField('galleryUrls', v);
    const setInstagramLink = (v: any) => setField('instagramLink', v);
    const setGoogleMapLink = (v: any) => setField('googleMapLink', v);
    const setVenueAddress = (v: any) => setField('venueAddress', v);
    
    const setTimeHour = (v: any) => setField('timeHour', v);
    const setTimeMinute = (v: any) => setField('timeMinute', v);
    const setTimePeriod = (v: any) => setField('timePeriod', v);
    const setCloseHour = (v: any) => setField('closeHour', v);
    const setCloseMinute = (v: any) => setField('closeMinute', v);
    const setClosePeriod = (v: any) => setField('closePeriod', v);
    
    // Facilities handled manually
    const setPetFriendly = (v: any) => setField('petFriendly', v);
    const setOutsideFood = (v: any) => setField('outsideFood', v);
    const setVenueLocationType = (v: any) => setField('venueLocationType', v);
    const setSurfaceType = (v: any) => setField('surfaceType', v);
    const setCancellations = (v: any) => setField('cancellations', v);
    const setChangingRooms = (v: any) => setField('changingRooms', v);
    const setEquipmentRentals = (v: any) => setField('equipmentRentals', v);
    const setMaxDuration = (v: any) => setField('maxDuration', v);
    
    const setPayment = (v: any) => {
        if (typeof v === 'function') {
            const newP = v(payment);
            Object.keys(newP).forEach(key => {
                if (key in payment) {
                    setPaymentField(key as keyof PaymentDetails, newP[key]);
                }
            });
        } else {
            Object.keys(v).forEach(key => {
                if (key in payment) {
                    setPaymentField(key as keyof PaymentDetails, v[key]);
                }
            });
        }
    };
    
    const setPlayInstructions = (v: any) => setField('playInstructions', v);
    const setYoutubeVideoUrl = (v: any) => setField('youtubeVideoUrl', v);
    
    const setCourts = (v: any) => setField('courts', typeof v === 'function' ? v(courts) : v);
    const setPocs = (v: any) => setField('pocs', typeof v === 'function' ? v(pocs) : v);
    const setSalesNotifs = (v: any) => setField('salesNotifs', typeof v === 'function' ? v(salesNotifs) : v);
    const setProhibitedItems = (v: any) => setField('prohibitedItems', typeof v === 'function' ? v(prohibitedItems) : v);
    const setFaqs = (v: any) => setField('faqs', typeof v === 'function' ? v(faqs) : v);

    
    const setSelections = (v: any) => {
        if (typeof v === 'function') {
            const newS = v(selections);
            for (const key in newS) { setSelection(key as keyof Selections, newS[key]); }
        } else {
            for (const key in v) { setSelection(key as keyof Selections, v[key]); }
        }
    };

    const editorRef = useRef<HTMLDivElement>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [hasContent, setHasContent] = useState(false);

    // Form fields
    // const [venueName, setVenueName] = useState(''); (moved to store)
    // const [portraitUrl, setPortraitUrl] = useState(''); (moved to store)
    // const [landscapeUrl, setLandscapeUrl] = useState(''); (moved to store)
    // const [secondaryBannerUrl, setSecondaryBannerUrl] = useState(''); (moved to store)
    // const [videoUrl, setVideoUrl] = useState(''); (moved to store)
    // const [galleryUrls, setGalleryUrls] = useState<string[]>([]); (moved to store)
    // const [instagramLink, setInstagramLink] = useState(''); (moved to store)
    // const [googleMapLink, setGoogleMapLink] = useState(''); (moved to store)
    // const [venueAddress, setVenueAddress] = useState(''); (moved to store)

    // Play Guide State
    // const [timeHour, setTimeHour] = useState(''); (moved to store)
    // const [timeMinute, setTimeMinute] = useState(''); (moved to store)
    // const [timePeriod, setTimePeriod] = useState('AM'); (moved to store)
    // const [closeHour, setCloseHour] = useState(''); (moved to store)
    // const [closeMinute, setCloseMinute] = useState(''); (moved to store)
    // const [closePeriod, setClosePeriod] = useState('PM'); (moved to store)
    // const [facilities, setFacilities] = useState<string[]>([]); (moved to store)
    const [showFacilitiesDropdown, setShowFacilitiesDropdown] = useState(false);
    // const [petFriendly, setPetFriendly] = useState(''); (moved to store)
    // const [outsideFood, setOutsideFood] = useState(''); (moved to store)
    // const [venueLocationType, setVenueLocationType] = useState(''); (moved to store)
    // const [surfaceType, setSurfaceType] = useState(''); (moved to store)
    // const [cancellations, setCancellations] = useState(''); (moved to store)
    // const [changingRooms, setChangingRooms] = useState(''); (moved to store)
    // const [equipmentRentals, setEquipmentRentals] = useState(''); (moved to store)
    // const [maxDuration, setMaxDuration] = useState(''); (moved to store)

    // Map state
    const [showMap, setShowMap] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const API_KEY = "AIzaSyC2gFDSPGY7wtSFHzYwzbPkP6tcq61Lmt8";

    const FACILITIES_OPTIONS = ['Parking', 'Changing Rooms', 'Showers', 'Equipment Rental', 'Cafeteria', 'Locker', 'First Aid', 'WiFi', 'Seating Area', 'Restrooms'];
    // const toggleFacility = (f: string) => handled by store

    const openingTime = timeHour && timeMinute ? `${timeHour}:${timeMinute} ${timePeriod}` : '';
    const closingTime = closeHour && closeMinute ? `${closeHour}:${closeMinute} ${closePeriod}` : '';

    // Payment Details
    // const [payment, setPayment] = useState({ (moved to store)
        // organizerName: '', (moved to store)
        // gstin: '', (moved to store)
        // accountNumber: '', (moved to store)
        // ifsc: '', (moved to store)
        // accountType: '' (moved to store)
    // // }); (moved to store) (moved to store)

    // Lists
    // const [pocs, setPocs] = useState<{ name: string; email: string; mobile: string }[]>([]); (moved to store)
    // const [salesNotifs, setSalesNotifs] = useState<{ email: string; mobile: string }[]>([]); (moved to store)
    const [newPoc, setNewPoc] = useState({ name: '', email: '', mobile: '' });
    const [newSales, setNewSales] = useState({ email: '', mobile: '' });
    const [editingPocIndex, setEditingPocIndex] = useState<number | null>(null);
    const [editingSalesIndex, setEditingSalesIndex] = useState<number | null>(null);

    // Optional Sections Toggles
    const [showInstructions, setShowInstructions] = useState(false);
    const [showYoutube, setShowYoutube] = useState(false);
    const [showProhibited, setShowProhibited] = useState(false);
    const [showFaqs, setShowFaqs] = useState(false);

    // Optional Sections Data
    // const [playInstructions, setPlayInstructions] = useState(''); (moved to store)
    // const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(''); (moved to store)
    // const [prohibitedItems, setProhibitedItems] = useState<string[]>([]); (moved to store)
    const [newProhibitedItem, setNewProhibitedItem] = useState('');
    // const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>([]); (moved to store)
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

    // Courts State
    // const [courts, setCourts] = useState<{ name: string; type: string; price: string; image_url: string }[]>([]); (moved to store)
    const [newCourt, setNewCourt] = useState({ name: '', type: '', price: '', image_url: '' });

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState('');
    const [paymentVerified, setPaymentVerified] = useState(false);

    // Dropdown States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState({ city: '' });
    // const [selections, setSelections] = useState({ (moved to store)
        // category: 'Select Sport', (moved to store)
        // subCategory: 'Select Court Type', (moved to store)
        // city: 'Select City' (moved to store)
    // });

    // ── Draft persistence ──────────────────────────────────────────
    const draftKey = useRef('');
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveDraft = useCallback(() => {
        // Draft data is kept in component state only - no localStorage usage
        console.log('Draft data kept in memory only');
    }, []);

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
            if (cityObj) setSelections((prev: Selections) => ({ ...prev, city: cityObj.long_name }));
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setGoogleMapLink(`https://www.google.com/maps?q=${lat},${lng}`);
        };

        loadGoogleMaps();
    }, [showMap, mapLoaded]);

    // Debounced auto-save on every state change (800 ms)
    useEffect(() => {
        if (!draftKey.current) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(saveDraft, 800);
        return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    }, [saveDraft]);

    const clearAllDraft = useCallback(() => {
        clearDraft();
        // Clear all form state - no localStorage to clear
        setVenueName(''); setPortraitUrl(''); setLandscapeUrl(''); setSecondaryBannerUrl('');
        setVideoUrl(''); setGalleryUrls([]); setInstagramLink(''); setGoogleMapLink(''); setVenueAddress('');
        setTimeHour(''); setTimeMinute(''); setTimePeriod('AM');
        setCloseHour(''); setCloseMinute(''); setClosePeriod('PM');
        // Clear facilities using store function
        facilities.forEach(facility => toggleFacility(facility)); setPetFriendly('');
        setSelections({ category: 'Select Sport', subCategory: 'Select Court Type', city: 'Select City' });
        setPayment({ organizerName: '', gstin: '', accountNumber: '', ifsc: '', accountType: '' });
        // Clear arrays using store functions
        pocs.forEach((_, index) => removePoc(0));
        salesNotifs.forEach((_, index) => removeSalesNotif(0));
        setShowInstructions(false); setShowYoutube(false); setShowProhibited(false); setShowFaqs(false);
        setPlayInstructions(''); setYoutubeVideoUrl(''); // Store functions will handle clearing arrays
        // Use store's clearDraft for proper cleanup
        clearDraft();
        setCourts([]);
        setPaymentVerified(false);
        if (editorRef.current) editorRef.current.innerHTML = '';
        setHasContent(false);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            let session = getOrganizerSession();
            if (!session) { setAuthChecked(false); return; }

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
            draftKey.current = `play_create_draft_${session.id}`;

            // Fetch organizer setup data from backend
            try {
                console.log('DEBUG: Fetching play setup...');
                const setup = await organizerApi.getExistingSetup('play');
                console.log('DEBUG: Play setup response:', setup);
                if (setup) {
                    console.log('DEBUG: Setting payment details from setup:', setup);
                    setPayment((p: PaymentDetails) => ({
                        ...p,
                        organizerName: setup.accountHolder || p.organizerName,
                        gstin: setup.gstNumber || setup.pan || p.gstin,
                        accountNumber: setup.bankAccountNo || p.accountNumber,
                        ifsc: setup.bankIfsc || p.ifsc,
                        accountType: p.accountType,
                    }));
                } else {
                    console.log('DEBUG: No setup found for play');
                }
            } catch (error) {
                console.error('DEBUG: Error fetching play setup:', error);
            }
        };

        checkAuth();
        
        // Initialize rich text editor from Zustand store
        if (editorRef.current && description) {
            editorRef.current.innerHTML = description;
            setHasContent(true);
        }

        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [router]);

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFCED] via-white to-white">
                <div className="bg-white rounded-[24px] p-10 shadow-lg max-w-md text-center space-y-4">
                    <h2 className="text-[24px] font-semibold text-black">Access Restricted</h2>
                    <p className="text-[16px] text-zinc-500">Your play registration must be approved by the admin before you can create listings.</p>
                    <button onClick={() => router.back()} className="bg-black text-white px-6 h-10 rounded-[12px] text-[14px] font-medium">Go Back</button>
                </div>
            </div>
        );
    }

    const validateImageDimensions = (file: File, expectedWidth: number, expectedHeight: number): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width > expectedWidth || img.height > expectedHeight) {
                    toast.warning(`Invalid dimensions! Maximum allowed is ${expectedWidth}x${expectedHeight}px, but yours is ${img.width}x${img.height}px.`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve(false);
            };
        });
    };

    const handleUpload = async (key: string, file: File, multi = false) => {
        const maxSizeMB = key === 'video' ? 5 : 1.5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.warning(`File size exceeds the allowable limit. Maximum allowed size is ${maxSizeMB}MB.`);
            return;
        }

        // Dimension Validation
        if (key === 'portrait') {
            const isValid = await validateImageDimensions(file, 900, 1200);
            if (!isValid) return;
        } else if (key === 'landscape') {
            const isValid = await validateImageDimensions(file, 1600, 900);
            if (!isValid) return;
        }

        setUploading(u => ({ ...u, [key]: true }));
        try {
            const url = await uploadMedia(file);
            if (multi) {
                if (key === 'gallery') setGalleryUrls((prev: string[]) => [...prev, url]);
            } else {
                if (key === 'portrait') setPortraitUrl(url);
                if (key === 'landscape') setLandscapeUrl(url);
                if (key === 'secondary_banner') setSecondaryBannerUrl(url);
                if (key === 'video') setVideoUrl(url);
                if (key === 'court_image') setNewCourt(prev => ({ ...prev, image_url: url }));
            }
        } catch { toast.error('Upload failed. Try again.'); }
        finally { setUploading(u => ({ ...u, [key]: false })); }
    };

    const makeUploadInput = (key: string, accept: string, multi = false) => (
        <input type="file" accept={accept} className="hidden"
            id={`upload-${key}`}
            onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                    handleUpload(key, f, multi);
                    // Clear input so same file can be uploaded again if needed
                    e.target.value = '';
                }
            }} />
    );

    const handleSubmit = async () => {
        const session = getOrganizerSession();
        if (!session) return;
        if (!venueName.trim()) { setSubmitMsg('Venue name is required.'); return; }
        if (selections.category === 'Select Sport') { setSubmitMsg('Please select a sport.'); return; }
        if (selections.city === 'Select City') { setSubmitMsg('Please select a city.'); return; }
        if (!portraitUrl || !landscapeUrl) { setSubmitMsg('Please upload both portrait and landscape card images.'); return; }
        if (galleryUrls.length < 3) { setSubmitMsg('Please upload at least 3 gallery images.'); return; }
        
        // Play Guide Validation
        if (!maxDuration) { setSubmitMsg('Maximum booking duration is required.'); return; }
        if (!outsideFood) { setSubmitMsg('Please specify if outside food is allowed.'); return; }
        if (!venueLocationType) { setSubmitMsg('Please specify if the venue is in-door or out-door.'); return; }
        if (!petFriendly) { setSubmitMsg('Please specify if the venue is pet-friendly.'); return; }
        if (!surfaceType) { setSubmitMsg('Please select a surface type.'); return; }
        if (!cancellations) { setSubmitMsg('Please specify cancellation policy.'); return; }
        if (!changingRooms) { setSubmitMsg('Please specify if changing rooms are available.'); return; }
        if (!equipmentRentals) { setSubmitMsg('Please specify if equipment rentals are available.'); return; }

        setField('description', editorRef.current?.innerHTML ?? '');
        
        const venueData = {
            name: venueName.trim(),
            description: editorRef.current?.innerHTML ?? '',
            category: selections.category,
            sub_category: selections.subCategory === 'Select Court Type' ? '' : selections.subCategory,
            city: selections.city,
            time: '',
            opening_time: '',
            closing_time: '',
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
            courts: courts.map(c => ({
                name: c.name,
                type: c.type,
                price: parseFloat(c.price),
                image_url: c.image_url
            })),
            event_instructions: playInstructions,
            youtube_video_url: youtubeVideoUrl,
            prohibited_items: prohibitedItems,
            faqs: faqs,
            artist_name: '',
            artist_image_url: '',
            tickets_needed_for: 'person',
            price_starts_from: courts.length > 0 ? Math.min(...courts.map(c => parseFloat(c.price) || 0)) : 0,
            payment: {
                organizer_name: payment.organizerName,
                gstin: payment.gstin,
                account_number: payment.accountNumber,
                ifsc: payment.ifsc,
                account_type: payment.accountType,
            },
            points_of_contact: pocs,
            sales_notifications: salesNotifs,
        };

        localStorage.setItem('play_create_draft', JSON.stringify(venueData));
        router.push('/play/create/format');
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
        setSelections((prev: Selections) => {
            const newSelections = { ...prev, [name]: value };
            if (name === 'category') {
                newSelections.subCategory = 'Select Court Type';
            }
            return newSelections;
        });
        setOpenDropdown(null);
        // Clear search when selecting an item
        setDropdownSearch(prev => ({ ...prev, [name]: '' }));
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        if (command === 'bold') setIsBold(!isBold);
        if (command === 'italic') setIsItalic(!isItalic);
        if (command === 'underline') setIsUnderline(!isUnderline);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white overflow-x-hidden">
            <div className="w-full" style={{ zoom: '0.70' }}>
                <div className="max-w-[1920px] mx-auto px-10 pt-20">
                    {/* Title Section */}
                    <div className="mb-12 flex items-start justify-between">
                        <div>
                            <h1 className="text-[40px] font-medium leading-[44px] text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                List a play venue
                            </h1>
                            <p className="text-[25px] font-medium leading-[28px] text-[#686868] mt-2" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                Only a few steps left to get your play venue live on Ticpin!
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                // Keep raw confirm for now as per low priority, but alert is the main focus
                                if (window.confirm('Clear all entered data and start fresh?')) clearAllDraft();
                            }}
                            className="flex items-center gap-2 border border-red-300 text-red-500 hover:bg-red-50 rounded-[10px] px-5 h-[42px] text-[18px] font-medium transition-colors shrink-0"
                        >
                            <Trash2 size={18} />
                            Clear All
                        </button>
                    </div>
                    <div className="w-[1800px] h-[1.5px] bg-gray-400 mt-[-20px] ml-[25px] mb-2"></div>

                    {/* Venue Name */}
                    <div className="mb-12">
                        <label className="block text-[24px] font-medium mb-2 text-black mt-[20px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                            Venue name
                        </label>
                        <input
                            type="text"
                            placeholder="Your venue name"
                            value={venueName}
                            onChange={e => setVenueName(e.target.value)}
                            className="w-full text-[30px] font-medium text-[black] placeholder-[#AEAEAE] bg-transparent border-none outline-none mt-[-10px]"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                        />
                        <div className="w-full h-[1px] bg-[#AEAEAE] mt-2"></div>
                    </div>

                    <div className="space-y-10 mt-[-30px]">
                        {/* Venue Description Section */}
                        <section className="bg-white rounded-[15px] p-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[30px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                    Venue Description <span className="text-[#E7C200]">*</span>
                                </h2>
                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[38px] overflow-hidden">
                                    <span className="px-5 text-[18px] font-medium text-black">Venue description guidelines</span>
                                    <div className="bg-[#FFFCED] w-[41px] h-full flex items-center justify-center border-l border-[#686868]">
                                        <ExternalLink size={20} className="text-black" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-6"></div>

                            <div className="flex gap-1 mb-4 mt-[-10px]">
                                <button onClick={() => handleFormat('bold')} className={`p-2 rounded ${isBold ? 'bg-gray-200' : ''}`}><Image src="/create event/bold.svg" alt="Bold" width={40} height={40} /></button>
                                <button onClick={() => handleFormat('italic')} className={`p-2 rounded ${isItalic ? 'bg-gray-200' : ''}`}><Image src="/create event/italic.svg" alt="Italic" width={40} height={40} /></button>
                                <button onClick={() => handleFormat('underline')} className={`p-2 rounded ${isUnderline ? 'bg-gray-200' : ''}`}><Image src="/create event/underline.svg" alt="Underline" width={40} height={40} /></button>
                            </div>
                            <div className="border border-[#AEAEAE] rounded-[10px] p-6 min-h-[326px] relative">
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    onInput={(e) => setHasContent(e.currentTarget.innerText.length > 0)}
                                    className="w-full h-full text-[30px] font-medium text-[black] outline-none min-h-[278px]"
                                    style={{ fontFamily: 'var(--font-anek-latin)' }}
                                />
                                {!hasContent && (
                                    <div className="absolute top-6 left-6 text-[#AEAEAE] text-[25px] font-medium pointer-events-none">Your venue description</div>
                                )}
                            </div>
                        </section>

                        {/* Play Type Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2">Play type <span className="text-[#E7C200]">*</span></h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Add sport and court types to help your venue reach the right audience.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Sport <span className="text-[#E7C200]">*</span></label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('category')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.category === 'Select Sport' ? 'text-[#686868]' : 'text-black'}`}>{selections.category}</span>
                                            {openDropdown === 'category' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'category' && (
                                            <div className="dropdown-menu">
                                                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                                    {CATEGORIES.map((opt) => (
                                                        <div key={opt} onClick={() => handleSelect('category', opt)} className="dropdown-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Court Type <span className="text-[#E7C200]">*</span></label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('subCategory')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.subCategory === 'Select Court Type' ? 'text-[#686868]' : 'text-black'}`}>{selections.subCategory}</span>
                                            {openDropdown === 'subCategory' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'subCategory' && (
                                            <div className="dropdown-menu">
                                                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                                    {(CATEGORY_DATA[selections.category] || []).map((opt) => (
                                                        <div key={opt} onClick={() => handleSelect('subCategory', opt)} className="dropdown-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Location Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2">Location <span className="text-[#E7C200]">*</span></h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Help local audiences discover your venue easily.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">City</label>
                                    <div className="relative w-full">
                                        <div onClick={() => toggleDropdown('city')} className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 mt-[8px] cursor-pointer bg-transparent">
                                            <span className={`text-[20px] ${selections.city === 'Select City' ? 'text-[#686868]' : 'text-black'}`}>{selections.city}</span>
                                            {openDropdown === 'city' ? <ChevronUp className="absolute right-6 text-black" size={24} /> : <ChevronDown className="absolute right-6 text-black" size={24} />}
                                        </div>
                                        {openDropdown === 'city' && (
                                            <div className="dropdown-menu">
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
                                                <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                                    {CITIES.filter(opt => opt.toLowerCase().includes(dropdownSearch.city.toLowerCase())).map((opt, index) => (
                                                        <div key={`${opt}-${index}`} onClick={() => handleSelect('city', opt)} className="dropdown-item">{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Venue Address</label>
                                    <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-4 mt-[10px]">
                                        <input type="text" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} placeholder="Enter venue address" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Google map link</label>
                                    <div className="relative border border-[#686868] rounded-[10px] h-[64px] flex items-center px-6 gap-4 mt-[10px]">
                                        <input type="text" value={googleMapLink} onChange={e => setGoogleMapLink(e.target.value)} placeholder="Google Map Link" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowMap(!showMap)}
                                        className="flex items-center gap-2 text-[#686868] text-[20px] font-medium"
                                    >
                                        Show Map {showMap ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    
                                    {showMap && (
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
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Venue Card Images Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-[30px] font-medium text-black">Venue card images <span className="text-[#E7C200]">*</span></h2>
                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[38px] overflow-hidden">
                                    <span className="px-5 text-[18px] font-medium text-black">Set image guidelines</span>
                                    <div className="bg-[#E7C200] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><ExternalLink size={20} className="text-black" /></div>
                                </div>
                            </div>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Please follow the venue card image guidelines and provide images in both formats.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
                            <div className="space-y-6">
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
                                        <div className="flex items-center justify-end gap-6 text-[#E7C200]">
                                            <span className="text-[17px] font-medium">* required</span>
                                            {portraitUrl && (
                                                <div className="relative w-[50px] h-[50px] rounded-[6px] overflow-hidden border border-[#686868]">
                                                    <Image src={portraitUrl} alt="Portrait preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            {makeUploadInput('portrait', 'image/*')}
                                            <label htmlFor="upload-portrait" className="cursor-pointer">
                                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                                    <span className="px-5 text-[15px] font-medium text-black">{uploading.portrait ? 'Uploading...' : portraitUrl ? 'Replace' : 'Upload'}</span>
                                                    <div className="bg-[#FFFCED] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
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
                                        <div className="flex items-center justify-end gap-6 text-[#E7C200]">
                                            <span className="text-[17px] font-medium">* required</span>
                                            {landscapeUrl && (
                                                <div className="relative w-[70px] h-[40px] rounded-[6px] overflow-hidden border border-[#686868]">
                                                    <Image src={landscapeUrl} alt="Landscape preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            {makeUploadInput('landscape', 'image/*')}
                                            <label htmlFor="upload-landscape" className="cursor-pointer">
                                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                                    <span className="px-5 text-[15px] font-medium text-black">{uploading.landscape ? 'Uploading...' : landscapeUrl ? 'Replace' : 'Upload'}</span>
                                                    <div className="bg-[#FFFCED] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#EBEBEB] rounded-[10px] py-3 px-6">
                                    <div className="flex-1 grid grid-cols-3 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[20px] font-semibold text-[#686868]">Secondary Banner</p>
                                            <p className="text-[20px] text-black">16:9 aspect ratio (1600px by 900px)</p>
                                        </div>
                                        <div className="space-y-1 ml-[-250px]">
                                            <p className="text-[20px] font-semibold text-[#686868]">Max Size</p>
                                            <p className="text-[20px] text-black">1.5MB</p>
                                        </div>
                                        <div className="flex items-center justify-end gap-6 text-[#686868]">
                                            <span className="text-[17px] font-medium">optional</span>
                                            {secondaryBannerUrl && (
                                                <div className="relative w-[70px] h-[40px] rounded-[6px] overflow-hidden border border-[#686868]">
                                                    <Image src={secondaryBannerUrl} alt="Secondary Banner preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            {makeUploadInput('secondary_banner', 'image/*')}
                                            <label htmlFor="upload-secondary_banner" className="cursor-pointer">
                                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                                    <span className="px-5 text-[15px] font-medium text-black">{uploading.secondary_banner ? 'Uploading...' : secondaryBannerUrl ? 'Replace' : 'Upload'}</span>
                                                    <div className="bg-[#FFFCED] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
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
                                            {makeUploadInput('gallery', 'image/*', true)}
                                            <label htmlFor="upload-gallery" className="cursor-pointer">
                                                <div className="flex items-center border border-[#686868] rounded-[5px] h-[35px] overflow-hidden bg-[#EBEBEB]">
                                                    <span className="px-5 text-[15px] font-medium text-black">{uploading.gallery ? 'Uploading...' : '+ Add Image'}</span>
                                                    <div className="bg-[#FFFCED] w-[41px] h-full flex items-center justify-center border-l border-[#686868]"><Upload size={20} className="text-black" /></div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    {galleryUrls.length > 0 && (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-2">
                                            {galleryUrls.map((url, i) => (
                                                <div key={i} className="relative group aspect-square rounded-[8px] overflow-hidden border border-[#686868]">
                                                    <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setGalleryUrls((prev: string[]) => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >×</button>
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

                        {/* Play Guide Section */}
                        <div className="mt-12">
                            <h2 className="text-[30px] font-medium text-black ml-[25px] mb-4">Clearly define play details</h2>
                            <section className="bg-white rounded-[15px] p-8">
                                <h3 className="text-[30px] font-medium text-black mb-6">Play Guide</h3>
                                <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>
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
                                <div className="bg-[#FFFCED] border border-[#686868]/30 rounded-[10px] p-4 flex items-center gap-3 mt-6">
                                    <Info size={40} className="text-black/50" />
                                    <span className="text-[19px] font-medium text-black">Can’t find an option that properly describes your play venue? Email play@ticpin.in and we’ll assist you.</span>
                                </div>
                            </section>
                        </div>

                        {/* Available Courts Section */}
                        <section className="bg-white rounded-[15px] p-8">
                            <h2 className="text-[30px] font-medium text-black mb-2">Available Courts <span className="text-[#E7C200]">*</span></h2>
                            <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">List the specific courts or spaces available at your venue.</p>
                            <div className="w-full h-[1px] bg-[#AEAEAE] mb-8"></div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Court Name</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })} placeholder="e.g. Court 1" className="w-full bg-transparent outline-none text-[22px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Court Type</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="text" value={newCourt.type} onChange={e => setNewCourt({ ...newCourt, type: e.target.value })} placeholder="e.g. Indoor Synthetic" className="w-full bg-transparent outline-none text-[22px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Price per Hour</label>
                                    <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                        <input type="number" value={newCourt.price} onChange={e => setNewCourt({ ...newCourt, price: e.target.value })} placeholder="e.g. 500" className="w-full bg-transparent outline-none text-[22px] text-black placeholder-[#AEAEAE]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Court Image <span className="text-[14px] text-[#AEAEAE]">(3:4, max 1.5MB, 900x1200px)</span></label>
                                    <div className="flex items-center gap-4">
                                        {makeUploadInput('court_image', 'image/*')}
                                        <label htmlFor="upload-court_image" className="cursor-pointer flex-1">
                                            <div className="border border-[#AEAEAE] border-dashed rounded-[10px] h-[64px] flex items-center justify-center px-6 hover:bg-zinc-50 transition-colors">
                                                {uploading.court_image ? (
                                                    <span className="text-[18px] text-zinc-400 animate-pulse">Uploading...</span>
                                                ) : newCourt.image_url ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-[40px] h-[40px] rounded-[6px] overflow-hidden">
                                                            <Image src={newCourt.image_url} alt="Court preview" fill className="object-cover" />
                                                        </div>
                                                        <span className="text-[18px] text-green-600 font-semibold uppercase italic">✓ Image Set</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Upload size={20} className="text-[#AEAEAE]" />
                                                        <span className="text-[18px] text-[#AEAEAE]">Upload image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end mb-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newCourt.name && newCourt.type && newCourt.price && newCourt.image_url) {
                                            setCourts([...courts, newCourt]);
                                            setNewCourt({ name: '', type: '', price: '', image_url: '' });
                                        } else if (!newCourt.image_url) {
                                            toast.warning('Please upload an image for the court.');
                                        }
                                    }}
                                    className="bg-black text-white rounded-[15px] h-[54px] px-8 flex items-center gap-2"
                                >
                                    <span className="text-[20px] font-medium uppercase">Add Court</span>
                                    <PlusCircle size={22} />
                                </button>
                            </div>

                            {courts.length > 0 && (
                                <div className="space-y-4">
                                    {courts.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between bg-[#F5F5F5] rounded-[15px] p-6 border border-zinc-200">
                                            <div className="flex gap-10">
                                                {c.image_url && (
                                                    <div className="relative w-[80px] h-[80px] rounded-[12px] overflow-hidden border border-zinc-300">
                                                        <Image src={c.image_url} alt={c.name} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Name</p>
                                                    <p className="text-[22px] font-semibold text-black uppercase">{c.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Type</p>
                                                    <p className="text-[22px] font-semibold text-black italic uppercase">{c.type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] text-[#686868] uppercase font-bold tracking-wider">Price</p>
                                                    <p className="text-[22px] font-semibold text-black">₹{c.price} / hr</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setCourts(courts.filter((_, idx) => idx !== i))} className="text-red-500 font-bold uppercase tracking-tight text-[16px]">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Add More Sections */}
                        <section className="bg-[#D8D8D8] rounded-[15px] p-6 mb-8 mt-12 pr-[150px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[25px] font-semibold text-black mt-[-15px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Add more sections</h3>
                            </div>
                            <div className="flex flex-wrap gap-6 mt-[-16px]">
                                {[
                                    { name: 'Play Instructions', toggle: () => setShowInstructions(!showInstructions), active: showInstructions },
                                    { name: 'Youtube Video', toggle: () => setShowYoutube(!showYoutube), active: showYoutube },
                                    { name: 'Prohibited Items', toggle: () => setShowProhibited(!showProhibited), active: showProhibited },
                                    { name: 'FAQs', toggle: () => setShowFaqs(!showFaqs), active: showFaqs }
                                ].map((btn, idx) => (
                                    <button key={idx} onClick={btn.toggle} className="flex items-center bg-white border border-[#686868] rounded-[6px] h-[48px] overflow-hidden hover:shadow-sm transition-all">
                                        <span className="px-5 text-[20px] font-medium text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                                            {btn.name}
                                        </span>
                                        <div className={`w-[48px] h-full flex items-center justify-center border-l border-[#686868] ${btn.active ? 'bg-black text-white' : 'bg-[#E7C200] text-black'}`}>
                                            {btn.active ? <PlusCircle size={22} className="rotate-45" /> : <PlusCircle size={22} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Optional Sections Rendering */}
                        <div className="space-y-8 pr-[150px] mb-12">
                            {showInstructions && (
                                <section className="bg-white rounded-[15px] p-8">
                                    <h2 className="text-[30px] font-medium text-black mb-2">Play Instructions</h2>
                                    <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Add specific instructions for attendees.</p>
                                    <div className="border border-[#686868] rounded-[10px] p-4">
                                        <textarea
                                            value={playInstructions}
                                            onChange={e => setPlayInstructions(e.target.value)}
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
                                                onKeyDown={e => e.key === 'Enter' && addProhibitedItem(newProhibitedItem.trim())}
                                                className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                            />
                                        </div>
                                        <button onClick={() => addProhibitedItem(newProhibitedItem.trim())} className="bg-black text-white px-8 rounded-[10px] font-medium text-[20px]">Add</button>
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
                                    <p className="text-[20px] font-medium text-[#AEAEAE] mb-6">Add frequently asked questions about your venue.</p>
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
                                                onKeyDown={e => e.key === 'Enter' && addFaq(newFaq)}
                                                className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]"
                                            />
                                        </div>
                                        <button onClick={() => addFaq(newFaq)} className="bg-black text-white w-full h-[64px] rounded-[10px] font-medium text-[20px]">Add FAQ</button>
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
                        </div>
                    </div>


                    {/* Payment Details Section */}
                    <h2 className="text-[30px] font-medium text-black mb-6 ml-[25px]" style={{ fontFamily: 'var(--font-anek-latin)' }}>Confirm your organisation and contact details</h2>
                    <section className="bg-white rounded-[15px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            {paymentVerified && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-[10px] w-fit">
                                    <span className="text-green-600 text-[15px] font-semibold">✓ Verified details fetched from your setup</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Organiser *</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 ${paymentVerified ? 'border-green-300 bg-green-50/40' : 'border-[#686868]'}`}>
                                        <input
                                            type="text"
                                            value={payment.organizerName}
                                            onChange={e => setPayment((p: PaymentDetails) => ({ ...p, organizerName: e.target.value }))}
                                            placeholder="Organiser name"
                                            disabled={true}
                                            className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] cursor-not-allowed opacity-70"
                                        />
                                        {payment.organizerName && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">GSTIN / PAN:</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 ${payment.gstin ? 'border-green-300 bg-green-50/40' : 'border-[#686868]'}`}>
                                        <input
                                            type="text"
                                            value={payment.gstin}
                                            onChange={e => setPayment((p: PaymentDetails) => ({ ...p, gstin: e.target.value }))}
                                            placeholder="GSTIN or PAN number"
                                            disabled={true}
                                            className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] cursor-not-allowed opacity-70"
                                        />
                                        {payment.gstin && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">Account Number:</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 ${payment.accountNumber ? 'border-green-300 bg-green-50/40' : 'border-[#686868]'}`}>
                                        <input
                                            type="text"
                                            value={payment.accountNumber}
                                            onChange={e => setPayment((p: PaymentDetails) => ({ ...p, accountNumber: e.target.value }))}
                                            placeholder="Bank account number"
                                            disabled={true}
                                            className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] cursor-not-allowed opacity-70"
                                        />
                                        {payment.accountNumber && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[20px] font-medium text-[#686868]">IFSC:</label>
                                    <div className={`border rounded-[10px] h-[64px] flex items-center px-6 ${payment.ifsc ? 'border-green-300 bg-green-50/40' : 'border-[#686868]'}`}>
                                        <input
                                            type="text"
                                            value={payment.ifsc}
                                            onChange={e => setPayment((p: PaymentDetails) => ({ ...p, ifsc: e.target.value }))}
                                            placeholder="Bank IFSC code"
                                            disabled={true}
                                            className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] cursor-not-allowed opacity-70"
                                        />
                                        {payment.ifsc && <span className="text-green-500 text-[18px] ml-2 shrink-0">✓</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[20px] font-medium text-[#686868]">Account Type:</label>
                                <div className={`border rounded-[10px] h-[64px] flex items-center px-6 relative ${paymentVerified ? 'border-green-300 bg-green-50/40' : 'border-[#686868]'}`}>
                                    <select 
                                        value={payment.accountType} 
                                        onChange={e => setPayment((p: PaymentDetails) => ({ ...p, accountType: e.target.value }))} 
                                        disabled={true} 
                                        className={`w-full bg-transparent outline-none text-[20px] appearance-none ${paymentVerified ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                                    >
                                        <option value="">Select type</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Current">Current</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-6 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Point of Contact Section */}
                    <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8">
                        <div>
                            <h2 className="text-[30px] font-medium text-black">Point of Contact <span className="text-[#FFFCED]">*</span></h2>
                            <p className="text-[20px] text-[#AEAEAE] mt-1">Please add the POC with whom play venue feedback will be shared</p>
                        </div>

                        {/* List of Added POCs */}
                        {pocs.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[20px] font-medium text-[#686868]">Added Contacts:</h3>
                                <div className="space-y-3">
                                    {pocs.map((poc, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-[10px] p-4">
                                            <div className="flex-1">
                                                <p className="text-[18px] font-medium text-black">{poc.name}</p>
                                                <p className="text-[16px] text-[#686868]">{poc.email} • {poc.mobile}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewPoc({ name: poc.name, email: poc.email, mobile: poc.mobile });
                                                        setEditingPocIndex(index);
                                                    }}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit2 size={20} />
                                                    <span className="text-[16px] font-medium">Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removePoc(index)}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={20} />
                                                    <span className="text-[16px] font-medium">Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-[#686868]">Name</label>
                                <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" value={newPoc.name} onChange={e => {
                                        setNewPoc({ ...newPoc, name: e.target.value });
                                        if (editingPocIndex !== null) {
                                            const updatedPocs = [...pocs];
                                            updatedPocs[editingPocIndex] = { ...updatedPocs[editingPocIndex], name: e.target.value };
                                            setPocs(updatedPocs);
                                        }
                                    }} placeholder="Enter name" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-[#686868]">Mail</label>
                                <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" value={newPoc.email} onChange={e => {
                                        setNewPoc({ ...newPoc, email: e.target.value });
                                        if (editingPocIndex !== null) {
                                            const updatedPocs = [...pocs];
                                            updatedPocs[editingPocIndex] = { ...updatedPocs[editingPocIndex], email: e.target.value };
                                            setPocs(updatedPocs);
                                        }
                                    }} placeholder="Enter email address" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-[#686868]">Mobile</label>
                                <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" value={newPoc.mobile} onChange={e => {
                                        setNewPoc({ ...newPoc, mobile: e.target.value });
                                        if (editingPocIndex !== null) {
                                            const updatedPocs = [...pocs];
                                            updatedPocs[editingPocIndex] = { ...updatedPocs[editingPocIndex], mobile: e.target.value };
                                            setPocs(updatedPocs);
                                        }
                                    }} placeholder="Enter mobile number" className="w-full bg-transparent outline-none text-[25px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 items-center">
                            {editingPocIndex !== null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewPoc({ name: '', email: '', mobile: '' });
                                        setEditingPocIndex(null);
                                    }}
                                    className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-tight text-[18px]"
                                >
                                    Cancel Edit
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (newPoc.name && newPoc.email && newPoc.mobile) {
                                        if (editingPocIndex !== null) {
                                            // Update existing POC
                                            const updatedPocs = [...pocs];
                                            updatedPocs[editingPocIndex] = newPoc;
                                            setPocs(updatedPocs);
                                            setEditingPocIndex(null);
                                        } else {
                                            // Add new POC
                                            addPoc(newPoc);
                                        }
                                        setNewPoc({ name: '', email: '', mobile: '' });
                                    }
                                }}
                                className="rounded-[15px] h-[65px] px-8 flex items-center gap-3 bg-black text-white active:scale-95"
                            >
                                <span className="text-[30px] font-medium">{editingPocIndex !== null ? 'UPDATE' : 'ADD'}</span>
                                <PlusCircle size={28} />
                            </button>
                        </div>
                    </section>

                    {/* Sales Notifications Section */}
                    <section className="bg-white rounded-[15px] p-10 flex flex-col gap-8">
                        <div>
                            <h2 className="text-[30px] font-medium text-black">Sales Notifications <span className="text-[#AEAEAE] text-[18px] ml-2">(Optional)</span></h2>
                            <p className="text-[20px] text-[#AEAEAE] mt-1">Add details of who should receive a copy of every sale</p>
                        </div>

                        {/* List of Added Sales Notifications */}
                        {salesNotifs.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[20px] font-medium text-[#686868]">Added Recipients:</h3>
                                <div className="space-y-3">
                                    {salesNotifs.map((sales, index) => (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-[10px] p-4">
                                            <div className="flex-1">
                                                <p className="text-[18px] font-medium text-black">{sales.email}</p>
                                                <p className="text-[16px] text-[#686868]">{sales.mobile}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewSales({ email: sales.email, mobile: sales.mobile });
                                                        setEditingSalesIndex(index);
                                                    }}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit2 size={20} />
                                                    <span className="text-[16px] font-medium">Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSalesNotif(index)}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={20} />
                                                    <span className="text-[16px] font-medium">Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-[#686868]">Mail</label>
                                <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" value={newSales.email} onChange={e => {
                                        setNewSales({ ...newSales, email: e.target.value });
                                        if (editingSalesIndex !== null) {
                                            const updatedSales = [...salesNotifs];
                                            updatedSales[editingSalesIndex] = { ...updatedSales[editingSalesIndex], email: e.target.value };
                                            setSalesNotifs(updatedSales);
                                        }
                                    }} placeholder="Enter email address" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[20px] font-medium text-[#686868]">Mobile</label>
                                <div className="border border-[#AEAEAE] rounded-[10px] h-[64px] flex items-center px-6">
                                    <input type="text" value={newSales.mobile} onChange={e => {
                                        setNewSales({ ...newSales, mobile: e.target.value });
                                        if (editingSalesIndex !== null) {
                                            const updatedSales = [...salesNotifs];
                                            updatedSales[editingSalesIndex] = { ...updatedSales[editingSalesIndex], mobile: e.target.value };
                                            setSalesNotifs(updatedSales);
                                        }
                                    }} placeholder="Enter mobile number" className="w-full bg-transparent outline-none text-[20px] text-black placeholder-[#AEAEAE]" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 items-center">
                            {editingSalesIndex !== null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewSales({ email: '', mobile: '' });
                                        setEditingSalesIndex(null);
                                    }}
                                    className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-tight text-[18px]"
                                >
                                    Cancel Edit
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (newSales.email && newSales.mobile) {
                                        if (editingSalesIndex !== null) {
                                            // Update existing sales notification
                                            const updatedSales = [...salesNotifs];
                                            updatedSales[editingSalesIndex] = newSales;
                                            setSalesNotifs(updatedSales);
                                            setEditingSalesIndex(null);
                                        } else {
                                            // Add new sales notification
                                            addSalesNotif(newSales);
                                        }
                                        setNewSales({ email: '', mobile: '' });
                                    }
                                }}
                                className="rounded-[15px] h-[65px] px-8 flex items-center gap-3 bg-black text-white active:scale-95"
                            >
                                <span className="text-[30px] font-medium">{editingSalesIndex !== null ? 'UPDATE' : 'ADD'}</span>
                                <PlusCircle size={28} />
                            </button>
                        </div>
                    </section>

                    <div className="flex flex-col items-center justify-center mt-8 mb-20 gap-4">
                        {submitMsg && (
                            <p className={`text-center text-[18px] font-medium ${submitMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{submitMsg}</p>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={submitLoading}
                            className="bg-black text-white rounded-[15px] w-full py-4 text-[25px] font-medium disabled:opacity-50"
                            style={{ fontFamily: 'var(--font-anek-latin)' }}
                        >
                            {submitLoading ? 'Saving...' : 'Save and proceed'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePlayPage;
