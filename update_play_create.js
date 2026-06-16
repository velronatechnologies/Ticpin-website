const fs = require('fs');

const path = 'src/app/play/create/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add store import
content = content.replace("import { organizerApi } from '@/lib/api/organizer';", "import { organizerApi } from '@/lib/api/organizer';\nimport { usePlayCreateStore } from '@/store/playCreateStore';");

// Replace all local states
const statesToReplace = `
    const [venueName, setVenueName] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');
    const [landscapeUrl, setLandscapeUrl] = useState('');
    const [secondaryBannerUrl, setSecondaryBannerUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [instagramLink, setInstagramLink] = useState('');
    const [googleMapLink, setGoogleMapLink] = useState('');
    const [venueAddress, setVenueAddress] = useState('');

    const [timeHour, setTimeHour] = useState('');
    const [timeMinute, setTimeMinute] = useState('');
    const [timePeriod, setTimePeriod] = useState('AM');
    const [closeHour, setCloseHour] = useState('');
    const [closeMinute, setCloseMinute] = useState('');
    const [closePeriod, setClosePeriod] = useState('PM');
    const [facilities, setFacilities] = useState<string[]>([]);
    const [petFriendly, setPetFriendly] = useState('');
    const [outsideFood, setOutsideFood] = useState('');
    const [venueLocationType, setVenueLocationType] = useState('');
    const [surfaceType, setSurfaceType] = useState('');
    const [cancellations, setCancellations] = useState('');
    const [changingRooms, setChangingRooms] = useState('');
    const [equipmentRentals, setEquipmentRentals] = useState('');
    const [maxDuration, setMaxDuration] = useState('');

    const [payment, setPayment] = useState({
        organizerName: '',
        gstin: '',
        accountNumber: '',
        ifsc: '',
        accountType: ''
    });

    const [pocs, setPocs] = useState<{ name: string; email: string; mobile: string }[]>([]);
    const [salesNotifs, setSalesNotifs] = useState<{ email: string; mobile: string }[]>([]);

    const [playInstructions, setPlayInstructions] = useState('');
    const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
    const [prohibitedItems, setProhibitedItems] = useState<string[]>([]);
    const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>([]);
    const [courts, setCourts] = useState<{ name: string; type: string; price: string; image_url: string }[]>([]);

    const [selections, setSelections] = useState({
        category: 'Select Sport',
        subCategory: 'Select Court Type',
        city: 'Select City'
    });
`;

const linesToRemove = statesToReplace.split('\n').map(l => l.trim()).filter(l => l.length > 0);

for (const line of linesToRemove) {
    // Just simple string replace
    content = content.replace(line, `// ${line} (moved to store)`);
}

const zustandInjection = `
    const {
        venueName, portraitUrl, landscapeUrl, secondaryBannerUrl, videoUrl, galleryUrls, instagramLink, googleMapLink, venueAddress,
        timeHour, timeMinute, timePeriod, closeHour, closeMinute, closePeriod,
        facilities, petFriendly, outsideFood, venueLocationType, surfaceType, cancellations, changingRooms, equipmentRentals, maxDuration,
        payment, pocs, salesNotifs, playInstructions, youtubeVideoUrl, prohibitedItems, faqs, courts, selections, description,
        setField, setPaymentField, setSelection, toggleFacility, addGalleryUrl, addProhibitedItem, removeProhibitedItem,
        addFaq, removeFaq, addPoc, removePoc, addSalesNotif, removeSalesNotif, clearDraft
    } = usePlayCreateStore();

    // Map legacy setters to zustand setters
    const setVenueName = (v) => setField('venueName', typeof v === 'function' ? v(venueName) : v);
    const setPortraitUrl = (v) => setField('portraitUrl', v);
    const setLandscapeUrl = (v) => setField('landscapeUrl', v);
    const setSecondaryBannerUrl = (v) => setField('secondaryBannerUrl', v);
    const setVideoUrl = (v) => setField('videoUrl', v);
    const setGalleryUrls = (v) => typeof v === 'function' ? setField('galleryUrls', v(galleryUrls)) : setField('galleryUrls', v);
    const setInstagramLink = (v) => setField('instagramLink', v);
    const setGoogleMapLink = (v) => setField('googleMapLink', v);
    const setVenueAddress = (v) => setField('venueAddress', v);
    
    const setTimeHour = (v) => setField('timeHour', v);
    const setTimeMinute = (v) => setField('timeMinute', v);
    const setTimePeriod = (v) => setField('timePeriod', v);
    const setCloseHour = (v) => setField('closeHour', v);
    const setCloseMinute = (v) => setField('closeMinute', v);
    const setClosePeriod = (v) => setField('closePeriod', v);
    
    // Facilities handled manually
    const setPetFriendly = (v) => setField('petFriendly', v);
    const setOutsideFood = (v) => setField('outsideFood', v);
    const setVenueLocationType = (v) => setField('venueLocationType', v);
    const setSurfaceType = (v) => setField('surfaceType', v);
    const setCancellations = (v) => setField('cancellations', v);
    const setChangingRooms = (v) => setField('changingRooms', v);
    const setEquipmentRentals = (v) => setField('equipmentRentals', v);
    const setMaxDuration = (v) => setField('maxDuration', v);
    
    const setPayment = (v) => {
        if (typeof v === 'function') {
            const newP = v(payment);
            for (const key in newP) { setPaymentField(key, newP[key]); }
        } else {
            for (const key in v) { setPaymentField(key, v[key]); }
        }
    };
    
    const setPlayInstructions = (v) => setField('playInstructions', v);
    const setYoutubeVideoUrl = (v) => setField('youtubeVideoUrl', v);
    
    const setCourts = (v) => setField('courts', typeof v === 'function' ? v(courts) : v);
    
    const setSelections = (v) => {
        if (typeof v === 'function') {
            const newS = v(selections);
            for (const key in newS) { setSelection(key, newS[key]); }
        } else {
            for (const key in v) { setSelection(key, v[key]); }
        }
    };
`;

content = content.replace("const CreatePlayPage = () => {", "const CreatePlayPage = () => {\n" + zustandInjection);

// Replace facilities toggle
content = content.replace(
    "const toggleFacility = (f: string) => setFacilities(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);",
    "// const toggleFacility = (f: string) => handled by store"
);

// clearAllDraft
content = content.replace(
    "const clearAllDraft = useCallback(() => {",
    "const clearAllDraft = useCallback(() => {\n        clearDraft();"
);

// Payment disabled fields
content = content.replace(
    /disabled={paymentVerified}/g,
    "disabled={true}"
);
content = content.replace(
    /className={`w-full bg-transparent outline-none text-\[20px\] placeholder-\[#AEAEAE\] \${paymentVerified \? 'cursor-not-allowed opacity-70' : ''}`}/g,
    'className="w-full bg-transparent outline-none text-[20px] placeholder-[#AEAEAE] cursor-not-allowed opacity-70"'
);

// Payment visual ticks
content = content.replace(/\{paymentVerified && payment\./g, '{payment.');

// Store content
fs.writeFileSync(path, content, 'utf8');
console.log('Done modifying page.tsx');
