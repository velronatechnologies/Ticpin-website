'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Map as MapIcon } from 'lucide-react';

interface MapSelectorProps {
    onSelect: (address: string, link: string, city: string) => void;
    initialAddress?: string;
    className?: string;
}

declare global {
    interface Window {
        google: any;
    }
}

const GOOGLE_MAPS_API_KEY = "google-map-key";

export default function MapSelector({ onSelect, initialAddress, className = "" }: MapSelectorProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [selectedPlace, setSelectedPlace] = useState<{ address: string; lat: number; lng: number } | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load Script
    useEffect(() => {
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
    }, []);

    // Initialize Map
    useEffect(() => {
        if (isLoaded && mapRef.current && !map) {
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
                    updateMarker(loc, newMap, geocoder, place.formatted_address, place.address_components);
                });
            }
        }
    }, [isLoaded, map]);

    const updateMarker = (location: any, targetMap: any, geocoder: any, knownAddress?: string, knownComponents?: any[]) => {
        const google = window.google;

        if (marker) marker.setMap(null);

        const newMarker = new google.maps.Marker({
            position: location,
            map: targetMap,
            draggable: true,
            animation: google.maps.Animation.DROP,
        });

        setMarker(newMarker);

        const handleResult = (addr: string, components?: any[]) => {
            const lat = location.lat();
            const lng = location.lng();
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

            let city = "";
            if (components) {
                const cityComp = components.find(c =>
                    c.types.includes('locality') ||
                    c.types.includes('administrative_area_level_2') ||
                    c.types.includes('sublocality_level_1')
                );
                if (cityComp) city = cityComp.longName;
            }

            setSelectedPlace({ address: addr, lat, lng });
            onSelect(addr, mapsLink, city);
        };

        if (knownAddress) {
            handleResult(knownAddress, knownComponents);
        } else {
            geocoder.geocode({ location: location }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    handleResult(results[0].formatted_address, results[0].address_components);
                } else {
                    handleResult("Unknown Location");
                }
            });
        }

        newMarker.addListener('dragend', () => {
            const pos = newMarker.getPosition();
            geocoder.geocode({ location: pos }, (results: any, status: string) => {
                if (status === 'OK' && results[0]) {
                    const addr = results[0].formatted_address;
                    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${pos.lat()},${pos.lng()}`;

                    let city = "";
                    const cityComp = results[0].address_components.find((c: any) =>
                        c.types.includes('locality') ||
                        c.types.includes('administrative_area_level_2') ||
                        c.types.includes('sublocality_level_1')
                    );
                    if (cityComp) city = cityComp.longName;

                    setSelectedPlace({ address: addr, lat: pos.lat(), lng: pos.lng() });
                    onSelect(addr, mapsLink, city);
                }
            });
        });
    };

    return (
        <div className={`flex flex-col border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm ${className}`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-100 bg-[#FBFBFB]">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search location to pinpoint..."
                        className="w-full h-12 pl-12 pr-4 bg-white rounded-xl border border-zinc-200 text-[16px] outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Map Area */}
            <div className="relative h-[400px] w-full bg-[#f0f0f0]" ref={mapRef}>
                {!isLoaded && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm z-10">
                        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Loading Map...</p>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-50 z-10 p-6 text-center">
                        <p className="text-red-500 font-semibold">{error}</p>
                        <p className="text-xs text-red-400">Please check your internet connection or API key.</p>
                    </div>
                )}
            </div>

            {/* Selected Info Footer */}
            {selectedPlace && (
                <div className="p-4 bg-[#FFFCED]/50 border-t border-zinc-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                        <MapPin size={16} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Selected Location</p>
                        <p className="text-[15px] font-semibold text-black leading-snug line-clamp-2">
                            {selectedPlace.address}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-[11px] font-medium text-zinc-400 font-mono">
                                {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
                            </p>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Verified</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
