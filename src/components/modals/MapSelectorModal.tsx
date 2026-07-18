'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Navigation } from 'lucide-react';

interface MapSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (address: string, link: string) => void;
    initialAddress?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyC2gFDSPGY7wtSFHzYwzbPkP6tcq61Lmt8";

export default function MapSelectorModal({ isOpen, onClose, onSelect, initialAddress }: MapSelectorModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [selectedPlace, setSelectedPlace] = useState<{ address: string; lat: number; lng: number } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Script
    useEffect(() => {
        if (!isOpen) return;

        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        const scriptExists = document.querySelector('script[src*="maps.googleapis.com"]');
        if (scriptExists) {
            const checkLoaded = setInterval(() => {
                if (window.google && window.google.maps) {
                    setIsLoaded(true);
                    clearInterval(checkLoaded);
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setError("Failed to load Google Maps");
        document.head.appendChild(script);
    }, [isOpen]);

    // Initialize Map
    useEffect(() => {
        if (isLoaded && isOpen && mapRef.current && !map) {
            const defaultLocation = { lat: 11.0168, lng: 76.9558 }; // Coimbatore

            const google = window.google;
            const newMap = new google.maps.Map(mapRef.current, {
                center: defaultLocation,
                zoom: 13,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
                    }
                ]
            });

            const geocoder = new google.maps.Geocoder();
            setMap(newMap);

            // Click listener
            newMap.addListener('click', (e: any) => {
                const location = e.latLng;
                updateMarker(location, newMap, geocoder);
            });

            // If initial address exists, search for it
            if (initialAddress && initialAddress.trim()) {
                geocoder.geocode({ address: initialAddress }, (results: any, status: string) => {
                    if (status === 'OK' && results[0]) {
                        const loc = results[0].geometry.location;
                        newMap.setCenter(loc);
                        newMap.setZoom(16);
                        updateMarker(loc, newMap, geocoder, results[0].formatted_address);
                    }
                });
            }

            // Autocomplete
            if (searchInputRef.current) {
                const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
                    componentRestrictions: { country: 'in' },
                    fields: ['geometry', 'formatted_address'],
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry) return;

                    const loc = place.geometry.location;
                    newMap.setCenter(loc);
                    newMap.setZoom(16);
                    updateMarker(loc, newMap, geocoder, place.formatted_address);
                });
            }
        }
    }, [isLoaded, isOpen, map]);

    const updateMarker = (location: any, targetMap: any, geocoder: any, knownAddress?: string) => {
        const google = window.google;

        if (marker) marker.setMap(null);

        const newMarker = new google.maps.Marker({
            position: location,
            map: targetMap,
            draggable: true,
            animation: google.maps.Animation.DROP,
        });

        setMarker(newMarker);

        const handleResult = (addr: string) => {
            setSelectedPlace({
                address: addr,
                lat: location.lat(),
                lng: location.lng(),
            });
        };

        if (knownAddress) {
            handleResult(knownAddress);
        } else {
            geocoder.geocode({ location: location }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    handleResult(results[0].formatted_address);
                } else {
                    handleResult("Unknown Location");
                }
            });
        }

        newMarker.addListener('dragend', () => {
            const pos = newMarker.getPosition();
            geocoder.geocode({ location: pos }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    setSelectedPlace({
                        address: results[0].formatted_address,
                        lat: pos.lat(),
                        lng: pos.lng(),
                    });
                }
            });
        });
    };

    const handleConfirm = () => {
        if (!selectedPlace) return;
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`;
        onSelect(selectedPlace.address, mapsLink);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[30px] w-full max-w-[900px] h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-zinc-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FFFCED] rounded-full flex items-center justify-center text-black">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-black uppercase tracking-tight">Select Location</h3>
                            <p className="text-sm text-zinc-500 font-medium">Pin the exact point on the map</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[#AEAEAE] hover:text-black transition-colors p-2">
                        <X size={32} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-[#F9F9F9]">
                    {/* Search Overlay */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search location, area, or landmark..."
                                className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl shadow-lg border border-zinc-100 text-lg outline-none focus:ring-2 focus:ring-black/5"
                            />
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 w-full" ref={mapRef}>
                        {!isLoaded && !error && (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                <p className="text-zinc-500 font-medium">Loading Google Maps...</p>
                            </div>
                        )}
                        {error && (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                <p className="text-red-500 font-medium">{error}</p>
                                <button onClick={onClose} className="text-black underline">Close</button>
                            </div>
                        )}
                    </div>

                    {/* Footer Info Area */}
                    <div className="p-6 md:p-8 bg-white border-t border-zinc-100 shrink-0 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Selected Landmark / Address</label>
                                <div className="flex items-start gap-3">
                                    <Navigation size={18} className="text-black mt-1 shrink-0" />
                                    <p className="text-[17px] font-semibold text-black leading-tight">
                                        {selectedPlace?.address || "Pick a spot or search to get started"}
                                    </p>
                                </div>
                                {selectedPlace && (
                                    <p className="text-xs font-medium text-zinc-400 font-mono">
                                        {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-8 h-14 rounded-2xl text-[16px] font-bold text-zinc-500 hover:bg-zinc-50 transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedPlace}
                                    className="px-10 h-14 bg-black text-white rounded-2xl text-[16px] font-bold uppercase tracking-wider shadow-xl shadow-black/10 active:scale-[0.98] transition-all disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                                >
                                    CONFIRM LOCATION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
