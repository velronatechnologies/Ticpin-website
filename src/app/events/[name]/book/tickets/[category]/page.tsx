"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { bookingApi } from "@/lib/api/booking";
import { passApi, TicpinPass } from "@/lib/api/pass";
import { useUserSession, clearUserSession, getUserSession } from "@/lib/auth/user";
import {
  useOrganizerSession,
  clearOrganizerSession,
} from "@/lib/auth/organizer";
import dynamic from "next/dynamic";
const ProfileDrawer = dynamic(
  () => import("@/components/layout/Navbar/ProfileDrawer"),
  { ssr: false },
);
import { TicketSkeleton } from "@/components/ui/Skeleton";
import {
  Zap,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Percent,
  Info,
} from "lucide-react";
import { useSlotLock } from "@/hooks/useSlotLock";
import AuthModal from "@/components/modals/AuthModal";
import { useReservationStore } from "@/store/useReservationStore";
import { useRef } from "react";
import { MobileVisualMap, DesktopVisualMap } from "./VisualMap";
import { toast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

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
  status?: string;
}

export default function TicketSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const name = params?.name as string;
  const isAllRoute = useMemo(() => {
    return !params?.category || params.category.toLowerCase() === "all";
  }, [params]);

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [bookedMap, setBookedMap] = useState<Record<string, number>>({});
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pass, setPass] = useState<TicpinPass | null>(null);
  const [usePass, setUsePass] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [showVisualMap, setShowVisualMap] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<
    number | null
  >(null);
  const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
  const isReservingRef = useRef(false);
  const session = useUserSession();
  const reservationStore = useReservationStore();
  const organizerSession = useOrganizerSession();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Enforce logged-in session: redirect to event details if not authenticated
  useEffect(() => {
    const activeSession = getUserSession();
    if (!activeSession?.id) {
      toast.error("Please login to book tickets");
      router.replace(`/events/${name}`);
    }
  }, [name, router]);
  const initialCountsRef = useRef<Record<number, number>>({});
  const hasChanges = useMemo(() => {
    const keys = new Set([...Object.keys(counts), ...Object.keys(initialCountsRef.current)]);
    for (const key of keys) {
      const idx = Number(key);
      const currentVal = counts[idx] ?? 0;
      const initialVal = initialCountsRef.current[idx] ?? 0;
      if (currentVal !== initialVal) return true;
    }
    return false;
  }, [counts]);

  const handleOrganizerLogout = () => {
    clearOrganizerSession();
    setShowAuthModal(true);
  };

  const handleUserLogout = () => {
    clearUserSession();
    setIsProfileDrawerOpen(false);
    router.push("/");
  };

  const zoneStyles = {
    STAGE: { background: "#D9D9D9", borderColor: "#686868", color: "#686868" },
    FANPIT: { background: "#dcfce7", borderColor: "#166534", color: "#166534" },
    RAMP: { background: "#fecaca", borderColor: "#b91c1c", color: "#b91c1c" },
    MIP: { background: "#cffafe", borderColor: "#0369a1", color: "#0369a1" },
    VIP: { background: "rgba(93, 78, 181, 0.5)", borderColor: "#240281", color: "#240281" },
    PLATINUM: {
      background: "#fef9c3",
      borderColor: "#eab308",
      color: "#eab308",
    },
    GOLD: { background: "#fed7aa", borderColor: "#c2410c", color: "#c2410c" },
  };

  const getZoneStyle = (
    zoneKey: string,
    baseStyle: { background: string; borderColor: string; color: string },
  ) => {
    const isSelected = selectedZoneName === zoneKey;
    return {
      backgroundColor: baseStyle.background,
      borderColor: baseStyle.borderColor,
      color: baseStyle.color,
      borderWidth: isSelected ? "3px" : "2px",
      boxShadow: "none",
    };
  };

  // Handle edit mode when user returns from review page
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ticpin_booking_step");
    }
    if (!event) return;
    const isEditingFlag = sessionStorage.getItem("ticpin_edit_selection") === "1";
    const hasCart = !!sessionStorage.getItem("ticpin_cart");
    const hasActiveRes = reservationStore.hasActiveReservation() && reservationStore.eventId === event?.id;

    if (isEditingFlag || (hasCart && hasActiveRes)) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      if (hasCart && !hasActiveRes) {
        sessionStorage.removeItem("ticpin_cart");
        sessionStorage.removeItem("ticpin_restore_counts");
        sessionStorage.removeItem("ticpin_temp_counts");
        sessionStorage.removeItem("ticpin_edit_selection");
      }
    }

    if (isEditingFlag) {
      // User is editing existing selection - clear the flag
      sessionStorage.removeItem("ticpin_edit_selection");

      // Restore existing cart into counts
      const cartData = sessionStorage.getItem("ticpin_cart");
      if (cartData) {
        try {
          const cart = JSON.parse(cartData);
          if (cart.tickets) {
            // We'll update counts when event loads
            // Store temporarily to apply after event fetch
            sessionStorage.setItem(
              "ticpin_restore_counts",
              JSON.stringify(cart.tickets),
            );
          }
        } catch (e) {
          console.error("Failed to parse cart data:", e);
        }
      }

      // Don't perform any auto-redirect - user intentionally came back to edit
      return;
    }
  }, [event, reservationStore]);



  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setCounts({});
    setSelectedCategoryIndex(null);
    setSelectedZoneName(null);
    setUsePass(false);
    fetch(`/backend/api/events/${encodeURIComponent(name)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (eventData) => {
        if (!eventData || eventData.error) {
          setLoading(false);
          return;
        }

        // Check if event booking is closed
        const isClosed = (() => {
          if (eventData.is_sales_paused || eventData.is_canceled) return true;
          if (eventData.ticket_close_date) {
            const closeDate = new Date(eventData.ticket_close_date);
            if (
              !isNaN(closeDate.getTime()) &&
              closeDate.getTime() < Date.now()
            ) {
              return true;
            }
          }
          if (eventData.event_end_date) {
            const endDate = new Date(eventData.event_end_date);
            if (!isNaN(endDate.getTime()) && endDate.getTime() < Date.now()) {
              return true;
            }
          }
          if (eventData.date) {
            const eventDate = new Date(eventData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (eventDate < today && eventData.status !== "unlimited") {
              return true;
            }
          }
          return false;
        })();

        if (isClosed) {
          toast.error("Bookings for this event are closed.");
          router.replace(`/events/${name}`);
          return;
        }

        setEvent(eventData);

        // Reconstruct categories from layout_json if layout-based
        let activeCategories = eventData.ticket_categories || [];
        if (eventData.is_layout_based && eventData.layout_json) {
          try {
            const layout = JSON.parse(eventData.layout_json);
            if (layout && Array.isArray(layout.elements)) {
              const classSections = layout.elements.filter(
                (el: any) => el.type === "section" && el.sectionType === "class"
              );
              if (classSections.length > 0) {
                activeCategories = classSections.map((el: any) => ({
                  name: el.name || "Unnamed Section",
                  price: el.price !== undefined ? Number(el.price) : 0,
                  capacity: el.capacity !== undefined ? Number(el.capacity) : 100,
                  image_url: el.image_url || "",
                  has_image: !!el.image_url,
                }));
              }
            }
          } catch (e) {
            console.error("Error parsing layout_json for activeCategories:", e);
          }
        }

        // Restore counts if user is editing (returning from review)
        let restoreCounts = sessionStorage.getItem("ticpin_restore_counts");
        const hasActiveRes = reservationStore.hasActiveReservation() && reservationStore.eventId === eventData.id;
        const isEditingFlag = (sessionStorage.getItem("ticpin_edit_selection") === "1") && hasActiveRes;

        if (hasActiveRes || isEditingFlag) {
          if (!restoreCounts) {
            const cartData = sessionStorage.getItem("ticpin_cart");
            if (cartData) {
              try {
                const cart = JSON.parse(cartData);
                if (cart.eventId === eventData.id && cart.tickets) {
                  restoreCounts = JSON.stringify(cart.tickets);
                }
              } catch (e) {
                console.error("Failed to parse cart fallback:", e);
              }
            }
          }
        } else {
          sessionStorage.removeItem("ticpin_cart");
          sessionStorage.removeItem("ticpin_restore_counts");
          sessionStorage.removeItem("ticpin_edit_selection");
          sessionStorage.removeItem("ticpin_temp_counts");
          reservationStore.clearReservation();
        }

        let isTemp = false;
        if (!restoreCounts) {
          const temp = sessionStorage.getItem("ticpin_temp_counts");
          if (temp) {
            restoreCounts = temp;
            isTemp = true;
          }
        }

        if (restoreCounts && activeCategories.length > 0) {
          try {
            const tickets = JSON.parse(restoreCounts);
            const initialCounts: Record<number, number> = {};

            tickets.forEach((ticket: any) => {
              const index = activeCategories.findIndex(
                (cat: any) => cat.name === ticket.name,
              );
              if (index !== -1) {
                initialCounts[index] = ticket.quantity;
              }
            });

            setCounts(initialCounts);
            if (!isTemp) {
              initialCountsRef.current = initialCounts;
            }
            sessionStorage.removeItem("ticpin_restore_counts");
          } catch (e) {
            console.error("Failed to restore counts:", e);
          }
        }

        // Auto-select category if set from visual map click or URL category parameter
        let autoSelectIndex = -1;
        const autoSelectIndexStr = sessionStorage.getItem(
          "ticpin_auto_select_category_index",
        );
        if (autoSelectIndexStr) {
          autoSelectIndex = parseInt(autoSelectIndexStr, 10);
          sessionStorage.removeItem("ticpin_auto_select_category_index");
        }

        // If no index in sessionStorage, try to match from URL category param
        if (
          (autoSelectIndex === -1 || isNaN(autoSelectIndex)) &&
          params?.category &&
          typeof params.category === "string" &&
          params.category.toLowerCase() !== "all" &&
          activeCategories.length > 0
        ) {
          const norm = (s: string) => s.toUpperCase().replace(/[-\s]/g, "");
          const rcNorm = norm(decodeURIComponent(params.category));
          autoSelectIndex = activeCategories.findIndex((tc: any) => {
            const tcNorm = norm(tc.name);
            return tcNorm === rcNorm || tcNorm.includes(rcNorm) || rcNorm.includes(tcNorm);
          });
        }

        if (
          autoSelectIndex !== -1 &&
          !isNaN(autoSelectIndex) &&
          activeCategories &&
          activeCategories[autoSelectIndex]
        ) {
          setSelectedCategoryIndex(autoSelectIndex);
        }

        setShowVisualMap(false);
        try {
          const availability = await bookingApi.getEventAvailability(
            eventData.id,
          );
          setBookedMap(availability.booked ?? {});
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (session?.id) {
      passApi
        .getActivePass(session.id)
        .then(setPass)
        .catch(() => setPass(null));
    }
  }, [name, session?.id]);

  useEffect(() => {
    fetch(`/backend/api/coupons/event`)
      .then((r) => r.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch(() => setCoupons([]));
  }, []);

  const categories: TicketCategory[] = useMemo(() => {
    if (!event) return [];
    if (event.is_layout_based && event.layout_json) {
      try {
        const layout = JSON.parse(event.layout_json);
        if (layout && Array.isArray(layout.elements)) {
          const classSections = layout.elements.filter(
            (el: any) => el.type === "section" && el.sectionType === "class"
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
      } catch (e) {
        console.error("Error parsing layout_json for categories:", e);
      }
    }
    return event.ticket_categories && event.ticket_categories.length > 0
      ? event.ticket_categories
      : [{ name: "General Admission", price: event.price_starts_from ?? 0 }];
  }, [event]);

  useEffect(() => {
    if (Object.keys(counts).length > 0) {
      const countsList = categories
        .map((cat, i) => ({
          name: cat.name,
          price: cat.price ?? 0,
          quantity: counts[i] ?? 0,
        }))
        .filter((t) => t.quantity > 0);
      if (countsList.length > 0) {
        sessionStorage.setItem("ticpin_temp_counts", JSON.stringify(countsList));
      } else {
        sessionStorage.removeItem("ticpin_temp_counts");
      }
    }
  }, [counts, categories]);

  const layoutPrices = useMemo(() => {
    if (!event?.layout_json) return {};
    try {
      const layout = JSON.parse(event.layout_json);
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

  const getAvailable = (cat: TicketCategory) => {
    if (!cat.capacity || cat.capacity <= 0) return Infinity;
    const booked = bookedMap[cat.name] ?? 0;
    return Math.max(0, cat.capacity - booked);
  };

  const isZoneSelected = (zoneKey: string) => {
    return selectedZoneName === zoneKey;
  };

  const handleZoneClick = (zoneKey: string) => {
    setSelectedZoneName(zoneKey);
  };

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
      (k) => norm(k) === zNameNorm
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

  const { lockSlot, unlockSlot, timeRemaining } = useSlotLock("event");

  const add = (i: number) => {
    const cat = categories[i];
    const avail = getAvailable(cat);
    const current = counts[i] ?? 0;
    if (current >= avail) return;

    setCounts((c) => ({ ...c, [i]: current + 1 }));
    if (!isAllRoute && selectedCategoryIndex === null) {
      setSelectedCategoryIndex(i);
    }
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

  const handleCheckout = async () => {
    if (!session?.id) {
      setShowAuthModal(true);
      return;
    }

    if (isReservingRef.current) return;
    isReservingRef.current = true;
    setIsCreatingReservation(true);

    const ticketReqs = categories
      .map((cat, i) => ({
        category: cat.name,
        quantity: counts[i] ?? 0,
      }))
      .filter((t) => t.quantity > 0);

    // Double check event date validity before proceeding to review
    if (event?.date) {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        toast.error("Event date has passed. Bookings are closed.");
        router.push(`/events/${name}`);
        return;
      }
    }

    const cart = {
      eventId: event?.id,
      eventName: event?.name,
      city: event?.city,
      tickets: categories
        .map((cat, i) => ({
          name: cat.name,
          price: cat.price ?? 0,
          quantity: counts[i] ?? 0,
        }))
        .filter((t) => t.quantity > 0),
      totalPrice,
      use_pass: usePass,
      pass_id: pass?.id,
      type: "event" as const,
    };
    sessionStorage.setItem("ticpin_cart", JSON.stringify(cart));

    // Start reservation creation in the background
    const reservationPromise = bookingApi
      .createReservation(
        event!.id,
        session.id,
        ticketReqs,
        reservationStore.reservationId || undefined,
      )
      .then((res) => {
        if (res.success) {
          reservationStore.setReservation(
            res.reservation_id,
            event!.id,
            categories
              .map((cat, i) => ({
                name: cat.name,
                price: cat.price ?? 0,
                quantity: counts[i] ?? 0,
              }))
              .filter((t) => t.quantity > 0),
            res.expires_at,
          );
        } else {
          throw new Error("Reservation failed on backend");
        }
        return res;
      })
      .finally(() => {
        setIsCreatingReservation(false);
        isReservingRef.current = false;
      });

    if (typeof window !== "undefined") {
      (window as any).__pendingReservationPromise = reservationPromise;
    }

    if (isAllRoute) {
      const selectedIndices = Object.keys(counts)
        .filter((idx) => (counts[Number(idx)] ?? 0) > 0)
        .map(Number);

      let nextPath = `/events/${name}/book/tickets/selected`;
      if (selectedIndices.length === 1) {
        const cat = categories[selectedIndices[0]];
        const slug = encodeURIComponent(cat.name.toLowerCase().replace(/\s+/g, "-"));
        nextPath = `/events/${name}/book/tickets/${slug}`;
      }

      if (isEditing) {
        sessionStorage.setItem("ticpin_edit_selection", "1");
      }

      window.history.pushState(null, "", nextPath);
    }

    // Instantly transition to the review page
    router.push(`/events/${name}/book/review`);
  };

  if (loading)
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
      </div>
    );

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col font-[family-name:var(--font-anek-latin)] bg-white select-none">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* ====== MOBILE VIEW (md:hidden) ====== */}
      <div
        className="md:hidden min-h-screen bg-white flex flex-col pb-[120px]"
        style={{ fontFamily: "'Anek Latin', sans-serif" }}
      >
        {/* Header Section - Figma Exact Design Match */}
        <div className="w-full h-[68px] bg-white border-b border-[#AEAEAE] flex items-center justify-between px-[16px] relative shrink-0">
          {/* Back button removed */}
          <div className="w-[31px] h-[31px]" />

          {/* Center Event Name & Date */}
          <div className="flex flex-col items-center justify-center max-w-[60%]">
            <h1
              className="text-[14px] font-semibold text-black uppercase leading-tight text-center truncate w-full"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {event?.name || "{EVENT NAME}"}
            </h1>
            <p
              className="text-[10px] font-medium text-[#686868] mt-[1px] uppercase leading-none text-center"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {formattedDateVenue}
            </p>
          </div>

          {/* Right User Ellipse */}
          <button
            onClick={() => {
              if (!session?.id) {
                setShowAuthModal(true);
              } else {
                setIsProfileDrawerOpen(true);
              }
            }}
            className="w-[30px] h-[30px] rounded-full bg-[#E1E1E1] flex items-center justify-center shrink-0"
          >
            <User size={14} className="text-[#686868]" />
          </button>
        </div>

        {timeRemaining > 0 && Object.values(counts).some((v) => v > 0) && (
          <div className="mx-[25px] mt-3 h-[32px] bg-[#F0EDFF] rounded-[8px] flex items-center justify-center gap-2">
            <Clock size={13} className="text-[#5331EA]" />
            <span className="text-[12px] font-medium text-black">
              Reserved for{" "}
              <span className="font-bold">
                {Math.floor(timeRemaining / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>{" "}
              mins
            </span>
          </div>
        )}

        {/* Choose Tickets Title */}
        <div className="px-[16px] mt-[12px] mb-[12px]">
          <span
            className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
            style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
          >
            CHOOSE TICKETS
          </span>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-[16px]">
          {showVisualMap ? (
            <MobileVisualMap
              categories={categories}
              counts={counts}
              selectedZoneName={selectedZoneName}
              handleZoneClick={handleZoneClick}
              getZoneStyle={getZoneStyle}
              getZoneQuantity={getZoneQuantity}
              getZonePrice={getZonePrice}
              getAvailable={getAvailable}
              add={add}
              remove={remove}
              zoneStyles={zoneStyles}
            />
          ) : (
            /* Normal Tickets List - EXACT DESIGN MATCH */
            <div className="w-full px-[16px] space-y-[12px]">
              {categories.map((cat, i) => {
                if (!isAllRoute) {
                  const isUrlMatch = selectedCategoryIndex !== null && i === selectedCategoryIndex;
                  const hasQty = (counts[i] ?? 0) > 0;
                  if (!isUrlMatch && !hasQty) return null;
                }
                const available = getAvailable(cat);
                const isSoldOut = available === 0;
                const current = counts[i] ?? 0;

                return (
                  <div
                    key={i}
                    className="w-full border border-[#E1E1E1] rounded-[15px] overflow-hidden flex flex-col bg-white"
                  >
                    <div className="p-[15px] pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <span className="text-[15px] font-medium text-black">Phase 1</span>
                          <div className="w-[1px] h-[15px] bg-black mx-2" />
                          <span className="text-[15px] font-medium text-black">{cat.name}</span>
                        </div>
                        {isSoldOut ? (
                          <div className="w-[61px] h-[23px] bg-red-100 border border-red-500 rounded-[5px] text-[10px] font-medium text-red-600 flex items-center justify-center">
                            SOLD OUT
                          </div>
                        ) : current === 0 ? (
                          <button
                            onClick={() => add(i)}
                            className="w-[61px] h-[23px] bg-[#EFEFEF] border border-[#686868] rounded-[5px] text-[12px] font-medium text-black flex items-center justify-center active:scale-95 transition-transform"
                          >
                            Add
                          </button>
                        ) : (
                          <div className="flex items-center border border-[#686868] rounded-[5px] bg-[#EFEFEF] h-[23px] overflow-hidden">
                            <button
                              onClick={() => remove(i)}
                              className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-2 text-[12px] font-medium text-black min-w-[20px] text-center">
                              {current}
                            </span>
                            <button
                              onClick={() => add(i)}
                              disabled={current >= available}
                              className="px-2 text-[14px] font-bold text-black active:bg-zinc-200 transition-colors disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-[12px] font-normal text-black block mb-4">
                        ₹{formatPrice(cat.price ?? 0)}
                      </span>

                      <div className="w-full h-[0.5px] bg-[#E1E1E1] mb-4" />

                      <ul className="space-y-2 mb-4">
                        <li className="flex gap-2">
                          <span className="text-[#686868] text-[10px] leading-tight">
                            • Each ticket grants entry to one person in the {cat.name} area.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#686868] text-[10px] leading-tight">
                            • Access to food stalls, bars and washrooms in the {cat.name} area.
                          </span>
                        </li>
                      </ul>
                    </div>

                    {coupons.length > 0 && (
                      <div className="w-full h-[26px] bg-[#5331EA] flex items-center justify-between px-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Percent size={10} className="text-white" strokeWidth={3} />
                          <span className="text-[10px] font-normal text-white uppercase tracking-tight">
                            Flat 10% discount on purchase of 3+ tickets
                          </span>
                        </div>
                        <Info size={11} className="text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <footer
          className="fixed bottom-0 left-0 right-0 w-full shrink-0 flex items-center justify-between px-[25px] z-50 bg-[#EFEFEF] border-t border-zinc-200"
          style={{ height: "88px", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex flex-col">
            <span className="text-[12px] font-normal text-black">
              {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
            </span>
            <span className="text-[20px] font-medium text-black leading-tight">
              ₹{formatPrice(totalPrice)}
            </span>
          </div>

          <button
            disabled={totalTickets === 0 || isCreatingReservation}
            onClick={handleCheckout}
            className={`w-[148px] h-[44px] text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center transition-all ${
              totalTickets > 0 && !isCreatingReservation
                ? "bg-black active:scale-95 cursor-pointer"
                : "bg-zinc-400 cursor-not-allowed opacity-60"
            }`}
          >
            {isEditing && hasChanges ? "UPDATE CART" : "ADD TO CART"}
          </button>
        </footer>
      </div>

      {/* ====== DESKTOP VIEW (hidden md:flex) ====== */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Header Section - Figma Exact Design Match */}
        <header className="w-full h-[80px] bg-white border-b border-[#AEAEAE] flex items-center justify-between px-[37px] relative z-10 shrink-0">
          {/* WORDMARK logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <img
                src="/ticpin-logo-black.png"
                alt="TICPIN"
                className="h-[25px] w-auto cursor-pointer"
                onClick={() => router.push('/')}
              />
            </div>
          </div>

          {/* Center Event Name & Date */}
          <div className="flex flex-col items-center justify-center">
            <h1
              className="text-[22px] font-semibold text-black uppercase leading-[26px] text-center"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {event?.name || "{EVENT NAME}"}
            </h1>
            <p
              className="text-[14px] font-medium text-[#686868] mt-[2px] uppercase leading-[18px] text-center"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
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

        {timeRemaining > 0 && Object.values(counts).some((v) => v > 0) && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 px-4 py-3 sticky top-[60px] md:top-[80px] z-40 flex items-center justify-between shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600 animate-pulse" />
              <span className="font-semibold text-[13px] md:text-sm tracking-wide">
                Tickets reserved for{" "}
                <span className="font-bold tabular-nums bg-amber-200 px-1.5 rounded">
                  {Math.floor(timeRemaining / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full max-w-[1000px] mx-auto px-6 md:px-12 pt-8 pb-[120px] space-y-4 flex-grow overflow-y-auto">
          <span
            className="text-[25px] md:text-[27px] font-medium text-[#000000] uppercase tracking-normal"
            style={{ fontFamily: "'Anek Tamil Medium', sans-serif", display: 'inline-block', transform: 'scaleY(1.1)' }}
          >
            CHOOSE TICKETS
          </span>

          {showVisualMap ? (
            <DesktopVisualMap
              categories={categories}
              counts={counts}
              selectedZoneName={selectedZoneName}
              handleZoneClick={handleZoneClick}
              getZoneStyle={getZoneStyle}
              getZoneQuantity={getZoneQuantity}
              getZonePrice={getZonePrice}
              getAvailable={getAvailable}
              add={add}
              remove={remove}
              zoneStyles={zoneStyles}
            />
          ) : (
            <div className="flex flex-col gap-2 mt-1 w-full">
              {categories.map((cat, i) => {
                if (!isAllRoute) {
                  const isUrlMatch = selectedCategoryIndex !== null && i === selectedCategoryIndex;
                  const hasQty = (counts[i] ?? 0) > 0;
                  if (!isUrlMatch && !hasQty) return null;
                }
                const available = getAvailable(cat);
                const isSoldOut = available === 0;
                const current = counts[i] ?? 0;

                return (
                  <div
                    key={i}
                    className="w-full bg-white border-[0.5px] border-[#AEAEAE] rounded-[15px] pt-[16px] px-[24px] pb-[10px] flex flex-col justify-between relative transition-all duration-200"
                    style={{
                      boxSizing: "border-box",
                      width: "100%",
                      maxWidth: "1366px",
                      height: "160px",
                      margin: "0 auto 10px auto",
                    }}
                  >
                    {/* Content Section: Title & Price vs Action Buttons */}
                    <div className="flex justify-between w-full items-stretch">
                      {/* Left Column: Title & Price */}
                      <div className="flex flex-col justify-between py-[1px]">
                        <div className="flex items-center">
                          <span
                            className="text-[20px] font-semibold text-black uppercase leading-[24px]"
                            style={{ fontFamily: "'Anek Latin', sans-serif" }}
                          >
                            Phase 1
                          </span>
                          {/* Vertical Separator */}
                          <div className="w-[1.5px] h-[22px] bg-black mx-4 shrink-0" />
                          <span
                            className="text-[20px] font-semibold text-black uppercase leading-[24px]"
                            style={{ fontFamily: "'Anek Latin', sans-serif" }}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <div
                          className="text-[26px] font-medium text-[#686868] leading-[30px]"
                          style={{ fontFamily: "'Anek Latin', sans-serif" }}
                        >
                          ₹{formatPrice(cat.price ?? 0)}
                        </div>
                      </div>

                      {/* Right Column: Action Buttons stacked with 1px gap */}
                      <div className="shrink-0 flex flex-col gap-[1px] items-end justify-between">
                        {isSoldOut ? (
                          <span
                            className="text-[15px] font-bold text-red-500 uppercase tracking-widest"
                            style={{
                              fontFamily: "'Anek Tamil Medium', sans-serif",
                            }}
                          >
                            SOLD OUT
                          </span>
                        ) : (
                          <>
                            {current === 0 ? (
                              <button
                                onClick={() => add(i)}
                                className="w-[80px] h-[34px] bg-[#D9D9D9] hover:bg-[#c9c9c9] text-black rounded-[7px] flex items-center justify-center active:scale-95 transition-all"
                                style={{
                                  fontFamily: "'Anek Tamil Medium', sans-serif",
                                  fontWeight: 500,
                                  fontSize: "22px",
                                  lineHeight: "1",
                                }}
                              >
                                ADD
                              </button>
                            ) : (
                              <div
                                className="w-[80px] h-[34px] bg-black text-white rounded-[7px] flex items-center justify-between px-2"
                                style={{
                                  fontFamily: "'Anek Tamil Medium', sans-serif",
                                  fontWeight: 500,
                                  fontSize: "22px",
                                  lineHeight: "1",
                                }}
                              >
                                <button
                                  onClick={() => remove(i)}
                                  className="hover:text-zinc-300 transition-colors w-5 h-5 flex items-center justify-center select-none"
                                >
                                  -
                                </button>
                                <span className="font-medium select-none text-[18px]">
                                  {current}
                                </span>
                                <button
                                  onClick={() => add(i)}
                                  disabled={current >= available}
                                  className="hover:text-zinc-300 transition-colors w-5 h-5 flex items-center justify-center disabled:opacity-30 select-none"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Divider & Bullet Points */}
                    <div className="w-full">
                      {/* Horizontal Separator with 1px top and bottom margin */}
                      <div className="w-full h-0 border-t border-[#686868]/40 mt-[1px] mb-[1px]" />

                      <div
                        className="text-[13px] font-medium text-[#686868] space-y-1 leading-[15px]"
                        style={{ fontFamily: "'Anek Latin', sans-serif" }}
                      >
                        <p>• This ticket grants entry to one individual only.</p>
                        <p>
                          • Access to food stalls, bars and washrooms in the{" "}
                          {cat.name} area.
                        </p>
                        <p>• This is a standing section.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ticpass Apply */}
          {pass && pass.benefits.events_discount_active && (
            <div className="w-full bg-[#F5F3FF] border border-[#DDD6FE] rounded-[15px] p-4 flex items-center justify-between shadow-sm mt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center text-white">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold text-[#5B21B6]">
                    Ticpin Pass Member
                  </h3>
                  <p className="text-sm text-[#7C3AED]">
                    Apply your 10% premium discount on this event
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUsePass(!usePass)}
                className={`px-6 h-10 rounded-xl font-bold transition-all ${usePass
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white text-[#7C3AED] border border-[#C4B5FD] hover:bg-[#F5F3FF]"
                  }`}
              >
                {usePass ? "Discount Applied" : "Apply Discount"}
              </button>
            </div>
          )}
        </main>

        {/* Sticky Footer - Figma Exact Design Match */}
        <footer
          className="w-full shrink-0 flex items-center justify-between px-[37px] z-50 mt-auto bg-[#2A2A2A]"
          style={{
            height: "100px",
          }}
        >
          <div className="flex flex-col justify-center gap-1">
            <span
              className="text-[26px] font-medium text-white leading-[30px]"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              ₹{formatPrice(totalPrice)}
            </span>
            <span
              className="text-[16px] font-medium text-white leading-[20px]"
              style={{ fontFamily: "'Anek Latin', sans-serif" }}
            >
              {totalTickets} {totalTickets === 1 ? "Ticket" : "Tickets"}
            </span>
          </div>

          <button
            disabled={totalTickets === 0 || isCreatingReservation}
            onClick={handleCheckout}
            className={`bg-white text-black font-medium rounded-[7px] flex items-center justify-center transition-all whitespace-nowrap ${totalTickets === 0 || isCreatingReservation ? "opacity-40 cursor-not-allowed" : "active:scale-[0.97]"}`}
            style={{
              width: "180px",
              height: "52px",
              fontFamily: "'Anek Tamil Medium', sans-serif",
              fontSize: "24px",
              lineHeight: "1",
            }}
          >
            {isEditing && hasChanges ? "UPDATE CART" : "ADD TO CART"}
          </button>
        </footer>
      </div>
      {isProfileDrawerOpen && (
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
      )}

      <style>{`
        @font-face {
            font-family: 'Anek Tamil Bold';
            src: url('/AnekTamil_Condensed-Bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
        }

        @font-face {
            font-family: 'Anek Tamil Medium';
            src: url('/AnekTamil_Condensed-Medium.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
        }

        @import url('https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700;800&family=Anek+Tamil+Condensed:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
