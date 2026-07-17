"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { bookingApi } from "@/lib/api/booking";
import { passApi, TicpinPass } from "@/lib/api/pass";
import {
  useUserSession,
  getUserSession,
  clearUserSession,
} from "@/lib/auth/user";
import {
  useOrganizerSession,
  clearOrganizerSession,
} from "@/lib/auth/organizer";
import { TicketSkeleton } from "@/components/ui/Skeleton";
import { Zap, Clock, User, ChevronLeft, Percent, Info } from "lucide-react";
import { useReservationStore } from "@/store/useReservationStore";
import AuthModal from "@/components/modals/AuthModal";
import { toast } from "@/components/ui/Toast";
import ProfileDrawer from "@/components/layout/Navbar/ProfileDrawer";
import InteractiveVenueMap from "@/components/events/InteractiveVenueMap";
import { clearEventBookingStorage, readEventCart, safeJsonParse } from "@/lib/bookingFlow";
import { useCurrentTime } from "@/hooks/use-current-time";
import { isEventBookingClosed } from "@/lib/event-booking";

interface TicketCategory {
  name: string;
  price?: number;
  capacity?: number;
  image_url?: string;
  has_image?: boolean;
}

interface EventData {
  id: string;
  name: string;
  date?: string;
  time?: string;
  venue_name?: string;
  city?: string;
  venue_address?: string;
  ticket_categories?: TicketCategory[];
  price_starts_from?: number;
  ticket_layout_type?: string;
  ticket_open_date?: string;
  ticket_close_date?: string;
  event_end_date?: string;
  is_sales_paused?: boolean;
  is_canceled?: boolean;
  is_layout_based?: boolean;
  layout_json?: string;
}

export default function TicketSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const name = params?.name as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [initialCounts, setInitialCounts] = useState<Record<number, number>>(
    {},
  );
  const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pass, setPass] = useState<TicpinPass | null>(null);
  const [usePass, setUsePass] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const isReservingRef = useRef(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showVisualMap, setShowVisualMap] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
  const nowMs = useCurrentTime();

  const session = useUserSession();
  const organizerSession = useOrganizerSession();
  const reservationStore = useReservationStore();

  const handleOrganizerLogout = () => {
    clearOrganizerSession();
    setShowAuthModal(true);
  };

  const handleUserLogout = () => {
    clearUserSession();
    setIsProfileDrawerOpen(false);
    router.push("/");
  };

  const hasSelectionChanged = useMemo(() => {
    const allKeys = Array.from(
      new Set([
        ...Object.keys(counts).map(Number),
        ...Object.keys(initialCounts).map(Number),
      ]),
    );
    for (const key of allKeys) {
      const currentVal = counts[key] ?? 0;
      const initialVal = initialCounts[key] ?? 0;
      if (currentVal !== initialVal) {
        return true;
      }
    }
    return false;
  }, [counts, initialCounts]);

  useEffect(() => {
    if (!event) return;
    if (event.is_layout_based) {
      setShowVisualMap(true);
    } else {
      const hasImageLayout =
        event.ticket_categories?.some((cat) => cat.has_image === true) ?? false;
      if ((event as any).ticket_layout_type === "image" || hasImageLayout) {
        setShowVisualMap(true);
      } else {
        setShowVisualMap(false);
      }
    }
  }, [event]);

  const zoneStyles = {
    STAGE: { background: "#d9d9d9", borderColor: "#686868", color: "#686868" },
    FANPIT: { background: "#cdeabf", borderColor: "#208102", color: "#208102" },
    RAMP: { background: "#edd2d2", borderColor: "#810202", color: "#810202" },
    MIP: { background: "#ecd2e3", borderColor: "#81024E", color: "#81024E" },
    VIP: { background: "#dbd5ed", borderColor: "#240281", color: "#240281" },
    PLATINUM: {
      background: "#d0ecf4",
      borderColor: "#025B81",
      color: "#025B81",
    },
    GOLD: { background: "#ececc5", borderColor: "#817202", color: "#817202" },
  };

  const getZoneStyle = (
    zoneKey: string,
    baseStyle: { background: string; borderColor: string; color: string },
  ) => {
    const isSelected = selectedZoneName === zoneKey;
    const soldOut = isZoneSoldOut(zoneKey);
    return {
      backgroundColor: soldOut ? "#e5e7eb" : baseStyle.background,
      borderColor: soldOut ? "#9ca3af" : baseStyle.borderColor,
      color: soldOut ? "#6b7280" : baseStyle.color,
      borderWidth: isSelected ? "3px" : "2px",
      boxShadow: "none",
      opacity: soldOut ? 0.6 : 1,
      cursor: soldOut ? "not-allowed" : "pointer",
    };
  };

  const isZoneSoldOut = (zoneKey: string) => {
    const norm = (s: string) => s.toUpperCase().replace(/[-\s]/g, "");
    const zNorm = norm(zoneKey);
    const cat = categories.find((c) => {
      const cNorm = norm(c.name);
      return zNorm.includes(cNorm) || cNorm.includes(zNorm);
    });
    if (!cat) return false;
    return getAvailable(cat) === 0;
  };

  const isZoneSelected = (zoneKey: string) => {
    return selectedZoneName === zoneKey;
  };

  const handleZoneClick = (zoneKey: string) => {
    if (isZoneSoldOut(zoneKey)) {
      toast.error("No tickets available");
      return;
    }

    // Find category matching the primary zone name using normalized search
    const norm = (s: string) => s.toUpperCase().replace(/[-\s]/g, "");
    const zNorm = norm(zoneKey);
    const foundIndex = categories.findIndex((c) => {
      const cNorm = norm(c.name);
      return zNorm.includes(cNorm) || cNorm.includes(zNorm);
    });

    let categoryRoute = "all";
    if (foundIndex !== -1) {
      sessionStorage.setItem(
        "ticpin_auto_select_category_index",
        String(foundIndex),
      );
      categoryRoute = encodeURIComponent(
        categories[foundIndex].name.toLowerCase(),
      );
    }

    router.push(`/events/${name}/book/tickets/${categoryRoute}`);
  };

  useEffect(() => {
    // BUG FIX #4: Validate role - only users can access booking pages
    const activeSession = getUserSession();
    if (!activeSession) {
      setShowAuthModal(true);
    }
    setIsAuthChecking(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ticpin_booking_step");
    }
  }, []);

  // BUG FIX #4: Check if organizer is trying to access booking flow (enforce user-only)
  useEffect(() => {
    if (isAuthChecking) return;

    const userSession = getUserSession();
    // Use the organizerSession already declared at component level (top-level hook)

    // If user is logged in as organizer, block access
    if (organizerSession && !userSession) {
      toast.error(
        "Only user accounts can book tickets. Please login as a user.",
      );
      router.push("/login");
      return;
    }

    // If user has no session at all after auth check, show auth modal
    if (!userSession && !organizerSession) {
      // This is handled by the first useEffect above
      return;
    }
  }, [isAuthChecking, router, organizerSession]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // User just logged in — stay on this page so they can proceed with booking
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    const activeSession = getUserSession();
    if (!activeSession) {
      // User closed the modal without logging in → go back to event detail
      router.push(`/events/${name}`);
    }
  };

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    // BUG FIX: Clear ticket counts when navigating to a different event
    // This prevents the -1/+ button from showing on new event before user clicks add
    setCounts({});
    setInitialCounts({});

    fetch(`/backend/api/events/${encodeURIComponent(name)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (eventData) => {
        if (isEventBookingClosed(eventData, nowMs)) {
          toast.error("Booking for this event is closed!");
          router.push(`/events/${name}`);
          return;
        }
        if (!eventData.is_layout_based) {
          router.replace(`/events/${name}/book/tickets/all`);
          return;
        }
        setEvent(eventData);
        const availabilityPromise = bookingApi.getEventAvailability(eventData.id);

        // If user came back from review intentionally, start fresh selection.
        const forceNewSelection =
          sessionStorage.getItem("ticpin_force_new_selection") === "1";
        if (forceNewSelection) {
          sessionStorage.removeItem("ticpin_force_new_selection");
          reservationStore.clearReservation();
          clearEventBookingStorage();
          const availability = await availabilityPromise;
          setBookedMap(availability.booked ?? {});
          setLoading(false);
          return;
        }

        // 1. Check Zustand store or sessionStorage cart first
        const hasStoreRes =
          reservationStore.hasActiveReservation() &&
          reservationStore.eventId === eventData.id;
        const rawCart = sessionStorage.getItem("ticpin_cart");
        const parsedCart = readEventCart(eventData.id);

        if (rawCart && !parsedCart) {
          clearEventBookingStorage();
          reservationStore.clearReservation();
        }

        if (parsedCart) {
          let canRestoreCart = hasStoreRes;

          if (!canRestoreCart && session?.id) {
            try {
              const activeRes = await bookingApi.checkActiveReservation(
                eventData.id,
                session.id,
              );
              if (activeRes.active) {
                reservationStore.setReservation(
                  activeRes.reservation_id,
                  activeRes.event_id,
                  parsedCart.tickets,
                  activeRes.expires_at,
                );
                canRestoreCart = true;
              }
            } catch (e) {
              console.error("Error restoring cart reservation:", e);
            }
          }

          if (canRestoreCart && parsedCart.tickets) {
            const initialCountsMap: Record<number, number> = {};
            parsedCart.tickets.forEach((ticket: any) => {
              const index = eventData.ticket_categories?.findIndex(
                (c: any) =>
                  c.name.trim().toLowerCase() ===
                  ticket.name.trim().toLowerCase(),
              );
              if (index !== undefined && index !== -1) {
                initialCountsMap[index] = ticket.quantity;
              }
            });
            setCounts(initialCountsMap);
            setInitialCounts(initialCountsMap);

            // Auto-select the first zone with non-zero tickets to display in visual map panel
            const firstActiveIndex = Object.keys(initialCountsMap).find(
              (idx) => initialCountsMap[Number(idx)] > 0,
            );
            if (firstActiveIndex !== undefined) {
              const cat =
                eventData.ticket_categories?.[Number(firstActiveIndex)];
              if (cat) {
                setSelectedZoneName(cat.name);
              }
            }
            const availability = await availabilityPromise;
            setBookedMap(availability.booked ?? {});
            setLoading(false);
            return;
          }

          clearEventBookingStorage();
          reservationStore.clearReservation();
        }

        // 2. Check backend for active reservation if logged in
        if (session?.id) {
          try {
            const activeRes = await bookingApi.checkActiveReservation(
              eventData.id,
              session.id,
            );
            if (activeRes.active) {
              const mappedTickets = activeRes.tickets.map((t: any) => ({
                name: t.category,
                price:
                  eventData.ticket_categories?.find(
                    (c: any) =>
                      c.name.trim().toLowerCase() ===
                      t.category.trim().toLowerCase(),
                  )?.price ??
                  eventData.price_starts_from ??
                  0,
                quantity: t.quantity,
              }));

              reservationStore.setReservation(
                activeRes.reservation_id,
                activeRes.event_id,
                mappedTickets,
                activeRes.expires_at,
              );

              const initialCountsMap: Record<number, number> = {};
              mappedTickets.forEach((ticket: any) => {
                const index = eventData.ticket_categories?.findIndex(
                  (c: any) =>
                    c.name.trim().toLowerCase() ===
                    ticket.name.trim().toLowerCase(),
                );
                if (index !== undefined && index !== -1) {
                  initialCountsMap[index] = ticket.quantity;
                }
              });
              setCounts(initialCountsMap);
              setInitialCounts(initialCountsMap);

              // Auto-select the first zone with non-zero tickets to display in visual map panel
              const firstActiveIndex = Object.keys(initialCountsMap).find(
                (idx) => initialCountsMap[Number(idx)] > 0,
              );
              if (firstActiveIndex !== undefined) {
                const cat =
                  eventData.ticket_categories?.[Number(firstActiveIndex)];
                if (cat) {
                  setSelectedZoneName(cat.name);
                }
	              }
	            const availability = await availabilityPromise;
	            setBookedMap(availability.booked ?? {});
	            setLoading(false);
	            return;
	          }
	          } catch (e) {
	            console.error("Error checking active reservation:", e);
	          }
	        }

        // 3. No active reservation, load availability
        clearEventBookingStorage();
        reservationStore.clearReservation();
        const availability = await availabilityPromise;
        setBookedMap(availability.booked ?? {});
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [name, nowMs, router, session?.id]);

  useEffect(() => {
    if (session?.id) {
      passApi
        .getActivePass(session.id)
        .then(setPass)
        .catch(() => setPass(null));
    }
  }, [session?.id]);

  useEffect(() => {
    fetch(`/backend/api/coupons/event`)
      .then((r) => r.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setCoupons([]));
  }, []);

  const categories: TicketCategory[] = useMemo(() => {
    if (!event) return [];
    if (event.is_layout_based && event.layout_json) {
      const layout = safeJsonParse<any>(event.layout_json);
      if (layout && Array.isArray(layout.elements)) {
          const classSections = layout.elements.filter(
            (el: any) => el.type === "section" && el.sectionType === "class",
          );
          if (classSections.length > 0) {
            return classSections.map((el: any) => ({
              name: el.name || "Unnamed Section",
              price: el.price !== undefined ? Number(el.price) : 0,
              capacity: el.capacity !== undefined ? Number(el.capacity) : 100,
              image_url: el.image_url || "",
              has_image: !!el.image_url,
            }));
          }
      }
    }
    return event.ticket_categories || [];
  }, [event]);

  const layoutPrices = useMemo(() => {
    if (!event?.layout_json) return {};
    try {
        const layout = safeJsonParse<any>(event.layout_json);
        const map: Record<string, number> = {};
        if (layout && Array.isArray(layout.elements)) {
        layout.elements.forEach((el: any) => {
          if (el.name && el.price !== undefined) {
            map[el.name.toUpperCase()] = el.price;
          }
        });
      }
      return map;
    } catch (e) {
      console.error("Failed to parse layoutPrices:", e);
      return {};
    }
  }, [event?.layout_json]);

  // Filter out any Platinum zones from layout_json so the visual map hides them
  const filteredLayoutJson = useMemo(() => {
    if (!event?.layout_json) return null;
    try {
      const layout = safeJsonParse<any>(event.layout_json);
      if (!layout) return event.layout_json;

      const filterPlatinum = (node: any): any => {
        if (Array.isArray(node)) {
          return node.map(filterPlatinum).filter((n) => {
            if (!n) return false;
            const name = (n.name || n.label || "").toString().toUpperCase();
            return !name.includes("PLATINUM");
          });
        }
        if (node && typeof node === "object") {
          const out: any = {};
          for (const k of Object.keys(node)) {
            out[k] = filterPlatinum(node[k]);
          }
          return out;
        }
        return node;
      };

      const filtered = filterPlatinum(layout);
      return JSON.stringify(filtered);
    } catch (e) {
      console.error("Failed to parse layout_json:", e);
      return event.layout_json;
    }
  }, [event]);

  const getAvailable = (cat: TicketCategory) => {
    if (!cat.capacity || cat.capacity <= 0) return Infinity;
    const booked = bookedMap[cat.name] ?? 0;
    return Math.max(0, cat.capacity - booked);
  };

  const add = (i: number) => {
    const cat = categories[i];
    const avail = getAvailable(cat);
    const current = counts[i] ?? 0;
    if (current >= avail) return;
    setCounts((c) => ({ ...c, [i]: current + 1 }));
  };

  const remove = (i: number) => {
    const current = counts[i] ?? 0;
    if (current === 0) return;
    setCounts((c) => ({ ...c, [i]: current - 1 }));
  };

  const totalTickets = useMemo(
    () => Object.values(counts).reduce((s, v) => s + v, 0),
    [counts],
  );
  const totalPrice = useMemo(
    () =>
      categories.reduce(
        (s, cat, i) => s + (counts[i] ?? 0) * (cat.price ?? 0),
        0,
      ),
    [categories, counts],
  );

  const formattedDateVenue = useMemo(() => {
    const venueFirstSegment = event?.venue_address
      ? event.venue_address.split(",")[0].trim()
      : "";
    const venuePart = venueFirstSegment || event?.venue_name;
    const locationPart =
      venuePart && event?.city
        ? `${venuePart} | ${event.city}`
        : venuePart || event?.city || null;

    return [
      event?.date
        ? new Date(event.date).toLocaleDateString("en-IN", {
          timeZone: "UTC",
          weekday: "short",
          day: "numeric",
          month: "short",
        })
        : null,
      event?.time ?? null,
      locationPart,
    ]
      .filter(Boolean)
      .join(" | ");
  }, [event]);

  if (loading || isAuthChecking || (!session?.id && !getUserSession()))
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: "linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 py-20 space-y-6">
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
        <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} onSuccess={handleAuthSuccess} />
      </div>
    );

  const getZonePrice = (zoneName: string) => {
    // 1. Try to find a match in the ticket categories
    const cat = categories.find((c) => {
      const cName = c.name.toUpperCase();
      const zName = zoneName.toUpperCase();
      return (
        cName.includes(zName) ||
        zName.includes(cName) ||
        (zName === "VIP" && cName === "VIP PASS") ||
        (zName === "PLATINUM" && cName === "PLATINUM PASS") ||
        (zName === "GOLD" && cName === "GOLD PASS") ||
        (zName === "MIP" && cName === "MIP PASS")
      );
    });
    if (cat) return `₹${cat.price}`;

    // 2. Fallback to layout prices if not found in categories
    const norm = (s: string) => s.toUpperCase().replace(/[-\s]/g, "");
    const zNameNorm = norm(zoneName);

    // Try exact or normalized match
    const exactMatchKey = Object.keys(layoutPrices).find(
      (k) => norm(k) === zNameNorm,
    );
    if (exactMatchKey) {
      return `₹${layoutPrices[exactMatchKey]}`;
    }

    // Try partial match (e.g. "VIP FANPIT" matching "VIP-FANPIT-LEFT" or vice versa)
    const partialMatchKey = Object.keys(layoutPrices).find((k) => {
      const kNorm = norm(k);
      return kNorm.includes(zNameNorm) || zNameNorm.includes(kNorm);
    });
    if (partialMatchKey) {
      return `₹${layoutPrices[partialMatchKey]}`;
    }

    return "";
  };

  const getZoneQuantity = (zoneKey: string) => {
    // Return quantity ONLY if this specific subzone/button is selected in the UI
    if (selectedZoneName !== zoneKey) return 0;

    const primaryZone = zoneKey.split(" ")[0].toUpperCase();
    const foundIndex = categories.findIndex((c) => {
      const cName = c.name.toUpperCase();
      return (
        cName.includes(primaryZone) ||
        primaryZone.includes(cName) ||
        (primaryZone === "VIP" && cName === "VIP PASS") ||
        (primaryZone === "PLATINUM" && cName === "PLATINUM PASS") ||
        (primaryZone === "GOLD" && cName === "GOLD PASS") ||
        (primaryZone === "MIP" && cName === "MIP PASS")
      );
    });
    if (foundIndex !== -1) {
      return counts[foundIndex] ?? 0;
    }
    return 0;
  };

  const handleCategorySelectMobile = (index: number) => {
    sessionStorage.setItem("ticpin_auto_select_category_index", String(index));
    const catName = categories[index]?.name || "all";
    router.push(
      `/events/${name}/book/tickets/${encodeURIComponent(catName.toLowerCase())}`,
    );
  };

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-anek-latin)]">
      <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} onSuccess={handleAuthSuccess} />
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        userSession={session}
        session={organizerSession}
        onUserLogout={handleUserLogout}
        onOrganizerLogout={handleOrganizerLogout}
        router={router}
        forceRole="user"
      />

      {/* ====== DESKTOP VIEW ====== */}
      <div className="hidden md:flex h-screen overflow-hidden flex-col bg-white">
        {/* Header */}
        <header className="w-full h-[80px] bg-white flex items-center justify-between px-10 border-b border-[#FFFFFF] shadow-sm relative z-10">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <img
              src="/ticpin-logo-black.png"
              alt="TICPIN"
              className="h-[25px] w-auto"
            />
          </div>

          <div className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <h1
              className="text-[18px] font-semibold text-black leading-tight line-clamp-1"
              style={{ fontFamily: "var(--font-anek-latin)" }}
            >
              {event?.name ?? "—"}
            </h1>
            <p
              className="text-[13px] font-medium text-[#686868] leading-tight"
              style={{ fontFamily: "var(--font-anek-latin)" }}
            >
              {formattedDateVenue}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-[44px] h-[44px] bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-[#E5E7EB] hover:scale-[1.05] active:scale-[0.98]"
              onClick={() => {
                if (!session?.id) {
                  setShowAuthModal(true);
                } else {
                  setIsProfileDrawerOpen(true);
                }
              }}
            >
              <User className="text-[#4B5563]" size={20} />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="w-full max-w-[1000px] mx-auto px-12 pt-3 pb-[120px] flex-grow flex flex-col items-center justify-start overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {event?.is_layout_based ? (
            event.layout_json ? (
              <div className="w-full max-w-[750px] mx-auto bg-white flex flex-col gap-[10px] p-4 select-none shrink-0">
                <InteractiveVenueMap
                  layoutJson={event.layout_json}
                  selectedSectionName={selectedZoneName}
                  onSelectSection={(name) => handleZoneClick(name)}
                  getZonePrice={(name) => getZonePrice(name)}
                  getZoneQuantity={(name) => getZoneQuantity(name)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[14px] text-[#686868] font-medium">
                  Interactive map not available for this event.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 mt-4">
                Redirecting to tickets page...
              </p>
            </div>
          )}
        </main>
      </div>
      {/* ====== MOBILE VIEW (flex md:hidden) ====== */}
      <div
        className="flex md:hidden min-h-screen bg-white flex-col pb-4"
        style={{ fontFamily: "'Anek Latin', sans-serif" }}
      >
        {/* Header Section */}
        <div className="w-full h-[68px] bg-white border-b border-[#AEAEAE] flex items-center justify-between px-[16px] relative shrink-0">
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={() => router.back()}
              className="text-black p-1 hover:bg-[#F3F4F6] rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-[60px]">
            <h1
              className="text-[14px] font-semibold text-black uppercase leading-tight text-center truncate w-full pointer-events-auto"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {event?.name || "—"}
            </h1>
            <p
              className="text-[10px] font-medium text-[#686868] mt-[1px] uppercase leading-none text-center truncate w-full pointer-events-auto"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {formattedDateVenue}
            </p>
          </div>

          <div className="w-[28px] h-[28px] shrink-0 z-10" />
        </div>

        {/* Title */}
        <div className="px-[18px] mt-4 mb-2">
          <h2
            className="text-[16px] font-semibold text-black uppercase"
            style={{ fontFamily: "'Anek Tamil Condensed', sans-serif" }}
          >
            Select a section
          </h2>
        </div>

        {/* Layout Content */}
        <div className="flex-grow overflow-y-auto px-[16px] pb-6">
          {event?.is_layout_based ? (
            event.layout_json ? (
              <div className="w-full max-w-[600px] mx-auto bg-white flex flex-col gap-[8px] p-2 select-none">
                <InteractiveVenueMap
                  layoutJson={event.layout_json}
                  selectedSectionName={selectedZoneName}
                  onSelectSection={(name) => handleZoneClick(name)}
                  getZonePrice={(name) => getZonePrice(name)}
                  getZoneQuantity={(name) => getZoneQuantity(name)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[14px] text-[#686868] font-medium">
                  Interactive map not available for this event.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 mt-4">Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
