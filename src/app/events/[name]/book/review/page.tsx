"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight,
  Trash2,
  X,
  Tag,
  CheckCircle2,
  ChevronDown,
  Clock,
  User,
  ChevronLeft,
  Percent,
  Info,
  Heart,
  Edit2,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useReservationStore } from "@/store/useReservationStore";
import { bookingApi, OfferItem, PaymentOrderResponse } from "@/lib/api/booking";
import { profileApi } from "@/lib/api/profile";
import Link from "next/link";
import { useUserSession, clearUserSession } from "@/lib/auth/user";
import {
  useOrganizerSession,
  clearOrganizerSession,
} from "@/lib/auth/organizer";
import { getBookingStatus } from "@/lib/utils/booking-status";
import { toast } from "@/components/ui/Toast";
import { AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import dynamic from "next/dynamic";
import {
  clearEventBookingStorage,
  isCurrentEventCart,
  safeJsonParse,
} from "@/lib/bookingFlow";

const AuthModal = dynamic(() => import("@/components/modals/AuthModal"), {
  ssr: false,
});
const OrganizerLogoutModal = dynamic(
  () => import("@/components/modals/OrganizerLogoutModal"),
  { ssr: false },
);
const ProfileDrawer = dynamic(
  () => import("@/components/layout/Navbar/ProfileDrawer"),
  { ssr: false },
);
const SuccessView = dynamic(() => import("./SuccessView"), { ssr: false });

import OrderSummary from "./OrderSummary";
import OffersCoupons from "./OffersCoupons";
import BillingDetailsForm from "./BillingDetailsForm";
import MobileReviewBooking from "@/components/mobile/MobileReviewBooking";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentTime } from "@/hooks/use-current-time";
import { isEventBookingClosed } from "@/lib/event-booking";

interface CartData {
  eventId: string;
  eventName: string;
  city: string;
  tickets: { name: string; price: number; quantity: number }[];
  totalPrice: number;
  type?: "event" | "dining" | "play";
  date?: string;
  timeSlot?: string;
  guests?: number;
  slot?: string;
  duration?: number;
  offerId?: string | null;
  offerType?: string | null;
  use_pass?: boolean;
  pass_id?: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/** Dynamically load a third-party payment SDK script (idempotent). */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

export default function ReviewBookingPage() {
  const router = useRouter();
  const params = useParams();
  const name = params?.name as string;
  const session = useUserSession();
  const organizerSession = useOrganizerSession();
  const billingRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<CartData | null>(null);
  const [eventData, setEventData] = useState<any | null>(null);

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<OfferItem | null>(null);
  const [offerDiscount, setOfferDiscount] = useState(0);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Inline UI state
  const [expandedSection, setExpandedSection] = useState<
    "none" | "offers" | "coupons"
  >("none");
  const [showGstDetails, setShowGstDetails] = useState(false);

  // User details
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Billing details
  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    nationality: "Indian resident",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // All required billing fields completed
  const billingComplete =
    (billing.name || "").trim() !== "" &&
    (billing.phone || "").trim().length >= 10 &&
    (billing.nationality || "").trim() !== "" &&
    (billing.state || "").trim() !== "" &&
    acceptedTerms;

  // Flow state
  const [step, setStep] = useState<"review" | "billing" | "success">("review");

  // BUG FIX #4: Validate role on mount - only users can access review pages
  useEffect(() => {
    // If organizer is logged in (has organizerSession), block access
    if (organizerSession && !session) {
      toast.error('Only user accounts can book tickets. Please login as a user.');
      router.push('/login');
      return;
    }

    if (!session) {
      // User not logged in - let them login
      return;
    }
  }, [session, organizerSession, router]);

  // Read saved step on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStep = sessionStorage.getItem("ticpin_booking_step");
      if (savedStep === "billing" || savedStep === "review" || savedStep === "success") {
        setStep(savedStep as any);
      }
    }
  }, []);

  // Save step on change
  useEffect(() => {
    if (typeof window !== "undefined" && step) {
      sessionStorage.setItem("ticpin_booking_step", step);
    }
  }, [step]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showInProgressLoader, setShowInProgressLoader] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pass, setPass] = useState<any>(null);
  const [ticketUpdateInProgress, setTicketUpdateInProgress] = useState(false);

  const isMobile = useIsMobile();
  const nowMs = useCurrentTime(30000);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Split name when billing name loaded
  useEffect(() => {
    if (billing.name) {
      const parts = billing.name.trim().split(/\s+/);
      if (parts.length > 0) {
        const first = parts[0];
        const last = parts.slice(1).join(" ");
        if (first !== firstName) {
          setFirstName(first);
        }
        if (last !== lastName) {
          setLastName(last);
        }
      }
    }
  }, [billing.name, firstName, lastName]);

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [previousBookings, setPreviousBookings] = useState<any[]>([]);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [phoneInputValue, setPhoneInputValue] = useState("");
  const isPayingRef = useRef(false);
  const hasPrefilledRef = useRef(false);
  const timerWarningShownRef = useRef(false);
  const razorpayRef = useRef<any>(null);
  const isBookingCompletedRef = useRef(false);

  const reservationStore = useReservationStore();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(true);

  // Donation States
  const [donationAmount, setDonationAmount] = useState(5);
  const [isDonationAdded, setIsDonationAdded] = useState(false);
  const [isDonationEdited, setIsDonationEdited] = useState(false);

  // Validate reservation on mount ONLY - don't re-validate on every navigation
  useEffect(() => {
    const validateReservation = async () => {
      if (isBookingCompletedRef.current) {
        setIsValidating(false);
        return;
      }
      if (!session?.id) {
        setIsValidating(false);
        return;
      }

      // Check if there's a pending reservation promise from the tickets page
      const pendingPromise = (window as any).__pendingReservationPromise;
      if (typeof window !== "undefined" && pendingPromise) {
        delete (window as any).__pendingReservationPromise;
        setIsValidating(true);
        try {
          await pendingPromise;
        } catch (e: any) {
          console.error("Awaiting pending reservation failed:", e);
          toast.error(e?.message || "Failed to reserve tickets. Please try again.");
          reservationStore.clearReservation();
          sessionStorage.removeItem("ticpin_cart");
          router.replace(`/events/${name}/book`);
          setIsValidating(false);
          return;
        }
      }

      let savedCart = sessionStorage.getItem("ticpin_cart");
      const fetchCurrentEvent = async () => {
        const eRes = await fetch(
          `/backend/api/events/${encodeURIComponent(name)}`,
          { credentials: "include" },
        );
        if (!eRes.ok) throw new Error("Failed to fetch event");
        const current = await eRes.json();
        if (current?.id) {
          setEventData((prev: any) => ({ ...prev, ...current }));
        }
        return current;
      };
      
      // If cart exists in sessionStorage AND Zustand has a reservation, skip backend check
      // (User is navigating back from tickets page - reservation is still valid)
      if (savedCart && reservationStore.reservationId && reservationStore.hasActiveReservation()) {
        const parsedCart = safeJsonParse<CartData>(savedCart);
        const currentEvent = await fetchCurrentEvent();
        if (!parsedCart || !isCurrentEventCart(parsedCart, currentEvent.id)) {
          clearEventBookingStorage();
          reservationStore.clearReservation();
          router.replace(`/events/${name}/book`);
          setIsValidating(false);
          return;
        }
        setCart(parsedCart);
        if (parsedCart.type === "event" && parsedCart.eventId) {
          setEventData((prev: any) => ({ ...prev, id: parsedCart.eventId, name: parsedCart.eventName }));
        }
        setIsValidating(false);
        return;
      }

      let parsedCart: any = null;
      let eventId = "";

      if (savedCart) {
        parsedCart = safeJsonParse<CartData>(savedCart);
        const currentEvent = await fetchCurrentEvent();
        if (!parsedCart || !isCurrentEventCart(parsedCart, currentEvent.id)) {
          clearEventBookingStorage();
          reservationStore.clearReservation();
          router.replace(`/events/${name}/book`);
          setIsValidating(false);
          return;
        }
        eventId = parsedCart.eventId;
        setCart(parsedCart);
      } else {
        // Self-healing: if cart is missing (e.g. copied/duplicated tab),
        // fetch the event details to get eventId and verify active reservation
        try {
          const eventData = await fetchCurrentEvent();

          const activeRes = await bookingApi.checkActiveReservation(
            eventData.id,
            session.id,
          );
          if (activeRes.active) {
            const mappedTickets = activeRes.tickets.map((t: any) => {
              const cat = eventData.ticket_categories?.find(
                (c: any) => c.name === t.category,
              );
              return {
                name: t.category,
                price: cat?.price || eventData.price_starts_from || 0,
                quantity: t.quantity,
              };
            });
            const reconstructedCart = {
              eventId: eventData.id,
              eventName: eventData.name,
              city: eventData.city,
              landscape_image_url: eventData.landscape_image_url,
              portrait_image_url: eventData.portrait_image_url,
              tickets: mappedTickets,
              totalPrice: mappedTickets.reduce(
                (sum: number, t: any) => sum + t.price * t.quantity,
                0,
              ),
              type: "event" as const,
            };
            sessionStorage.setItem(
              "ticpin_cart",
              JSON.stringify(reconstructedCart),
            );
            setCart(reconstructedCart);
            setEventData((prev: any) => ({
              ...prev,
              id: eventData.id,
              name: eventData.name,
              landscape_image_url: eventData.landscape_image_url,
              portrait_image_url: eventData.portrait_image_url,
            }));

            reservationStore.setReservation(
              activeRes.reservation_id,
              activeRes.event_id,
              mappedTickets,
              activeRes.expires_at,
            );
            setIsValidating(false);
            return;
          }
        } catch (e) {
          console.error("Self-healing failed to reconstruct cart:", e);
        }

        // If not found or failed, redirect back to booking
        router.replace(`/events/${name}/book`);
        return;
      }

      setIsValidating(false);
    };

    validateReservation();
  }, [session?.id, name, router]);

  useEffect(() => {
    if (!name) return;
    fetch(`/backend/api/events/${encodeURIComponent(name)}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          // Check if event booking is closed
          const isClosed = isEventBookingClosed(data, nowMs, true);

          if (isClosed) {
            toast.error("Bookings for this event are closed.");
            router.replace(`/events/${name}`);
            return;
          }
          setEventData(data);
        }
      })
      .catch((err) => console.error("Error fetching event details:", err));
  }, [name, nowMs, router]);

  // Timer countdown with 2-min warning for slot lock expiry (10-minute timeout)
  useEffect(() => {
    const expiresAt = reservationStore.expiresAt;
    if (!expiresAt || step === "success") return;

    let interval: any;

    const updateTimer = () => {
      if (isPayingRef.current) return;

      const expiresTime = new Date(expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
      setTimeRemaining(diff);

      // Show warning popup at 2 minutes (120 seconds) - gives users time to complete payment
      if (diff === 120 && !timerWarningShownRef.current) {
        timerWarningShownRef.current = true;
        setShowTimerWarning(true);
        toast.warning("⏰ Your slot lock expires in 2 minutes. Please complete your payment.");
      }

      // Auto-unlock and redirect at 5 minutes remaining (300 seconds = 5 min, so unlock at expiry - 5min)
      // Actually auto-unlock when time reaches 0
      if (diff <= 0) {
        if (interval) clearInterval(interval);
        toast.error("Your ticket reservation has expired. Redirecting...");

        // Close Razorpay popup if open
        if (razorpayRef.current) {
          try {
            razorpayRef.current.close();
          } catch (e) {
            console.error("Failed to close Razorpay popup:", e);
          }
          razorpayRef.current = null;
        }

        // Unlock on backend
        if (reservationStore.reservationId) {
          bookingApi
            .unlockReservation(reservationStore.reservationId)
            .catch(console.error);
        }

        // Clear state
        reservationStore.clearReservation();
        sessionStorage.removeItem("ticpin_cart");
        router.replace(`/events/${name}`);
      }
    };

    updateTimer();
    interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    reservationStore.expiresAt,
    reservationStore.reservationId,
    name,
    router,
    step,
  ]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("ticpin_cart");
    if (saved && eventData?.id) {
      const data = safeJsonParse<CartData>(saved);
      if (!data || !isCurrentEventCart(data, eventData.id)) {
        clearEventBookingStorage();
        reservationStore.clearReservation();
        router.replace(`/events/${name}/book`);
        return;
      }
      // Default to 'event' if not specified
      const cartData = { ...data, type: data.type || "event" };
      setCart(cartData);

      // Set eventData when cart is loaded for events
      if (cartData.type === "event" && cartData.eventId) {
        setEventData((prev: any) => ({
          ...prev,
          id: cartData.eventId,
          name: cartData.eventName,
          landscape_image_url: cartData.landscape_image_url,
          portrait_image_url: cartData.portrait_image_url,
        }));
      }
    }

    const savedEmail = sessionStorage.getItem("ticpin_billing_email");
    if (savedEmail) setEmail(savedEmail);

    const savedBilling = sessionStorage.getItem("ticpin_billing_data");
    if (savedBilling) {
      const parsed = safeJsonParse<any>(savedBilling);
      if (parsed) {
        setBilling((prev) => ({
          ...prev,
          ...parsed,
          nationality:
            parsed.nationality || prev.nationality || "Indian resident",
          state: parsed.state || prev.state || "",
        }));
      }
    }

    // ── Cashfree redirect return ───────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const cfOrderId = urlParams.get("order_id");
    const pendingPaymentStr = sessionStorage.getItem("ticpin_pending_payment");
    // Accept TICPIN_ prefixed IDs (new format) or any order_id if we have a pending payment stored
    if (
      cfOrderId &&
      pendingPaymentStr &&
      (cfOrderId.startsWith("TICPIN_") || cfOrderId.includes("_"))
    ) {
      const pending = pendingPaymentStr;
      if (pending) {
        const p = safeJsonParse<any>(pending);
        if (p?.cart) {
          if (eventData?.id && !isCurrentEventCart(p.cart, eventData.id)) {
            sessionStorage.removeItem("ticpin_pending_payment");
            clearEventBookingStorage();
            router.replace(`/events/${name}/book`);
            return;
          }
            setCart(p.cart);
            if (p.cart.type === "event" && p.cart.eventId) {
              setEventData((prev: any) => ({ ...prev, id: p.cart.eventId, name: p.cart.eventName }));
            }
            window.history.replaceState(null, "", window.location.pathname);
            showSuccessImmediately(p.orderID);
            setTimeout(() => {
              void completeBookingWithData(
                p.orderID,
                "cashfree",
                p.cart,
                p.email,
                p.sessionId,
                p.orderAmount,
                p.bookingFee,
                p.grandTotal,
                p.appliedCoupon || "",
                p.offerId,
                p.cart.use_pass,
                p.donationAmount,
                p.orderID,
              );
            }, 200);
        }
      }
    }

    if (session?.id) {
      import("@/lib/api/pass").then(({ passApi }) => {
        passApi.getActivePass(session.id!).then(setPass);
      });
    }
  }, [router, session?.id, eventData?.id, name, reservationStore]);

  // Also pre-fill with session data if available and state is empty
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.id && !hasPrefilledRef.current) {
        try {
          // Fetch profile and booking history in parallel
          const [profile, history] = await Promise.all([
            profileApi.getProfile(session.id).catch(() => null),
            bookingApi.getUserBookings({ userId: session.id }).catch(() => []),
          ]);

          // Extract and store last 3 confirmed bookings
          const confirmed = (Array.isArray(history) ? history : [])
            ?.filter((b: any) => {
              const s = getBookingStatus(b).toLowerCase();
              return s === "booked" || s === "confirmed";
            })
            ?.sort(
              (a: any, b: any) =>
                new Date(b.booked_at).getTime() -
                new Date(a.booked_at).getTime(),
            )
            ?.slice(0, 3);
          setPreviousBookings(confirmed || []);

          // Find latest successful booking
          const latestBooking = (Array.isArray(history) ? [...history] : [])
            ?.filter((b: any) => {
              const s = getBookingStatus(b).toLowerCase();
              return s === "booked" || s === "confirmed";
            })
            ?.sort(
              (a: any, b: any) =>
                new Date(b.booked_at).getTime() -
                new Date(a.booked_at).getTime(),
            )[0];

          setBilling((prev) => {
            const newBilling = {
              ...prev,
              name:
                prev.name ||
                latestBooking?.user_name ||
                profile?.name ||
                session?.name ||
                "",
              phone:
                prev.phone ||
                latestBooking?.user_phone ||
                profile?.phone ||
                session?.phone ||
                "",
              nationality:
                prev.nationality ||
                latestBooking?.nationality ||
                "Indian resident",
              state: prev.state || latestBooking?.state || profile?.state || "",
              address:
                prev.address ||
                latestBooking?.address ||
                profile?.address ||
                "",
              city:
                prev.city ||
                latestBooking?.city ||
                profile?.city ||
                "",
              pincode:
                prev.pincode ||
                latestBooking?.pincode ||
                (profile as any)?.pincode ||
                "",
            };
            sessionStorage.setItem(
              "ticpin_billing_data",
              JSON.stringify(newBilling),
            );
            return newBilling;
          });

          if (!email) {
            const newEmail =
              latestBooking?.user_email ||
              profile?.email ||
              session?.email ||
              "";
            setEmail(newEmail);
            if (newEmail)
              sessionStorage.setItem("ticpin_billing_email", newEmail);
          }
          hasPrefilledRef.current = true;
        } catch (err) {
          console.error("Failed to load user data", err);
        }
      }
    };
    loadUserData();
  }, [session, email]);

  // Persist changes
  useEffect(() => {
    if (email) sessionStorage.setItem("ticpin_billing_email", email);
  }, [email]);

  useEffect(() => {
    if (billing.name || billing.phone || billing.state) {
      sessionStorage.setItem("ticpin_billing_data", JSON.stringify(billing));
    }
  }, [billing]);

  // Backend Polling Status Check (Fallback & Safety Source of truth per tab session)
  useEffect(() => {
    const checkId = cart?.eventId;
    const userId = session?.id;
    const reservationId = reservationStore.reservationId;
    if (!checkId || !userId || !reservationId || step === "success" || (typeof window !== "undefined" && (window as any).__pendingReservationPromise)) return;

    const interval = setInterval(async () => {
      // Stop polling if booking is done or payment is in progress
      if (isBookingCompletedRef.current || isPayingRef.current) return;
      try {
        const res = await bookingApi.checkActiveReservation(
          checkId,
          userId,
          reservationId,
        );
        if (!res?.active) {
          // Double-check: skip if booking just completed
          if (isBookingCompletedRef.current || isPayingRef.current) return;
          // Clear state locally for this tab
          reservationStore.clearReservation();
          sessionStorage.removeItem("ticpin_cart");
          sessionStorage.removeItem("ticpin_booking_step");
          sessionStorage.removeItem("ticpin_pending_payment");
          toast.info("Your reservation has expired or was cancelled.");
          router.replace(`/events/${name}/book`);
        }
      } catch (err) {
        console.error("Error polling reservation status:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [
    cart?.eventId,
    session?.id,
    reservationStore.reservationId,
    step,
    name,
    router,
    reservationStore,
  ]);

  const clearReservationAndFlow = (
    clearCart: boolean = true,
    markForceRestart: boolean = false,
  ) => {
    if (reservationStore.reservationId && step !== "success") {
      bookingApi
        .unlockReservation(reservationStore.reservationId)
        .catch(console.error);
    }
    if (
      reservationStore.reservationId ||
      reservationStore.eventId ||
      reservationStore.selectedSeats.length ||
      reservationStore.expiresAt
    ) {
      reservationStore.clearReservation();
    }
    timerWarningShownRef.current = false;
    setShowTimerWarning(false);
    setTimeRemaining(0);
    sessionStorage.removeItem("ticpin_booking_step");
    sessionStorage.removeItem("ticpin_pending_payment");
    if (markForceRestart) {
      sessionStorage.setItem("ticpin_force_new_selection", "1");
    }
    if (clearCart) {
      sessionStorage.removeItem("ticpin_cart");
    }
  };

  useEffect(() => {
    const entityId = cart?.eventId;
    const entityType = cart?.type || "event";
    if (!entityId) return;

    // Fetch offers by entity ID and type (same pattern as play review page)
    const fetchOffers =
      entityType === "dining"
        ? bookingApi.getDiningOffers(entityId)
        : entityType === "play"
          ? bookingApi.getPlayOffers(entityId)
          : bookingApi.getEventOffers(entityId);

    fetchOffers
      .then((res) => {
        const arr = Array.isArray(res) ? res : [];
        setOffers(arr);
        // Auto-apply if cart has a pre-selected offer ID
        if (cart?.offerId) {
          const match = arr.find((o: OfferItem) => o.id === cart.offerId);
          if (match) applyOffer(match);
        }
      })
      .catch(() => setOffers([]));

    // Fetch coupons for the entity category — include userId for personalised coupons
    bookingApi
      .getCouponsByCategory(entityType, session?.id)
      .then((res) => {
        setAvailableCoupons(Array.isArray(res) ? res : []);
      })
      .catch(() => setAvailableCoupons([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.eventId, cart?.type, session?.id]);

  const orderAmount = cart?.totalPrice ?? 0;
  const bookingFee = Math.round(orderAmount * 0.06);

  const isPassApplied = cart?.use_pass ?? false;
  const passDiscount =
    isPassApplied && pass?.benefits.events_discount_active
      ? Math.round(orderAmount * 0.1)
      : 0;

  const totalDiscount = offerDiscount + couponDiscount + passDiscount;
  const baseAmount = orderAmount + bookingFee - totalDiscount;
  const defaultDonation = baseAmount % 5 === 0 ? 5 : 5 - (baseAmount % 5);

  // Keep donationAmount in sync with defaultDonation unless user has edited it
  useEffect(() => {
    if (!isDonationEdited) {
      setDonationAmount(defaultDonation);
    }
  }, [baseAmount, defaultDonation, isDonationEdited]);

  const grandTotal = Math.max(
    0,
    baseAmount + (isDonationAdded ? donationAmount : 0),
  );

  const removeTicket = async (i: number) => {
    if (!cart || !session?.id || ticketUpdateInProgress) return;

    setTicketUpdateInProgress(true);
    try {
      const newTickets = cart.tickets.filter((_, idx) => idx !== i);

      if (newTickets.length === 0) {
        // If all tickets removed, release reservation and redirect back
        try {
          if (reservationStore.reservationId) {
            await bookingApi.unlockReservation(reservationStore.reservationId);
          }
        } catch (e) {
          console.error(e);
        }
        reservationStore.clearReservation();
        sessionStorage.removeItem("ticpin_cart");
        router.replace(`/events/${name}/book`);
        return;
      }

      const ticketReqs = newTickets.map((t) => ({
        category: t.name,
        quantity: t.quantity,
      }));

      const res = await bookingApi.createReservation(
        cart.eventId,
        session.id,
        ticketReqs,
        reservationStore.reservationId || undefined,
      );
      if (res.success) {
        // Update Zustand
        reservationStore.setReservation(
          res.reservation_id,
          cart.eventId,
          newTickets,
          res.expires_at,
        );

        const newTotal = newTickets.reduce(
          (s, t) => s + t.price * t.quantity,
          0,
        );
        const newCart = { ...cart, tickets: newTickets, totalPrice: newTotal };
        setCart(newCart);
        sessionStorage.setItem("ticpin_cart", JSON.stringify(newCart));

        if (appliedOffer) applyOffer(appliedOffer, newTotal);
        if (appliedCoupon) validateCoupon(couponInput, newTotal);

        toast.success("Ticket removed!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update reservation.");
    } finally {
      setTicketUpdateInProgress(false);
    }
  };

  const updateTicketQuantity = async (i: number, newQuantity: number) => {
    if (!cart || !session?.id || ticketUpdateInProgress) return;

    setTicketUpdateInProgress(true);
    try {
      const oldQuantity = cart.tickets[i].quantity;

      if (newQuantity < 1) {
        removeTicket(i);
        return;
      }

      // Optimistically calculate new tickets array
      const newTickets = cart.tickets.map((t, idx) =>
        idx === i ? { ...t, quantity: newQuantity } : t,
      );

      // Format for backend
      const ticketReqs = newTickets.map((t) => ({
        category: t.name,
        quantity: t.quantity,
      }));

      // Re-reserve with new quantities. This deletes the old reservation and locks new seats
      const res = await bookingApi.createReservation(
        cart.eventId,
        session.id,
        ticketReqs,
        reservationStore.reservationId || undefined,
      );

      if (res.success) {
        // Update Zustand
        reservationStore.setReservation(
          res.reservation_id,
          cart.eventId,
          newTickets,
          res.expires_at,
        );

        // Update local cart state
        const newTotal = newTickets.reduce(
          (s, t) => s + t.price * t.quantity,
          0,
        );
        const newCart = { ...cart, tickets: newTickets, totalPrice: newTotal };
        setCart(newCart);
        sessionStorage.setItem("ticpin_cart", JSON.stringify(newCart));

        if (appliedOffer) applyOffer(appliedOffer, newTotal);
        if (appliedCoupon) validateCoupon(couponInput, newTotal);

        toast.success("Ticket quantity updated!");
      }
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to update reservation. Selected tickets may not be available.",
      );
    } finally {
      setTicketUpdateInProgress(false);
    }
  };

  const applyOffer = (offer: OfferItem, base?: number) => {
    if (grandTotal === 0 && offer.id !== appliedOffer?.id) {
      toast.warning("The total is already ₹0. No more offers can be applied.");
      return;
    }
    const amount = base ?? orderAmount;
    let disc =
      offer.discount_type === "percent"
        ? Math.round((amount * offer.discount_value) / 100)
        : Math.min(offer.discount_value, amount);
    setOfferDiscount(disc);
    setAppliedOffer(offer);
    setExpandedSection("none");
  };

  const removeOffer = () => {
    setAppliedOffer(null);
    setOfferDiscount(0);
  };

  const validateCoupon = async (code?: string, base?: number) => {
    if (grandTotal === 0 && !appliedCoupon) {
      toast.warning("The total is already ₹0. No coupon needed.");
      return;
    }
    const c = code ?? couponInput;
    if (!c.trim()) return;
    const amount = base ?? orderAmount;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const result = await bookingApi.validateCoupon(
        c.trim(),
        "event",
        amount,
        session?.id,
      );
      setCouponDiscount(Math.round(result.discount_amount));
      setAppliedCoupon(c.toUpperCase());
      setCouponSuccess(
        `✓ Coupon applied! You save ₹${Math.round(result.discount_amount)}`,
      );
      setExpandedSection("none");
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
      setCouponDiscount(0);
      setAppliedCoupon("");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponDiscount(0);
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Handle phone input with +91 prefix - 10 digits only
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    // Keep only last 10 digits
    if (value.length > 10) {
      value = value.slice(-10);
    }
    setPhoneInputValue(value);
    if (value.length === 10) {
      setBilling((b) => ({ ...b, phone: value }));
    }
  };

  const handleContinue = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    const activePhone = (billing.phone || session?.phone || "")
      .trim()
      .replace(/\D/g, "");
    if (activePhone && activePhone.length === 10 && billing.phone !== activePhone) {
      setBilling((b) => ({ ...b, phone: activePhone }));
    }

    setBookingError("");
    setStep("billing");
    setTimeout(() => {
      billingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const showSuccessImmediately = (optimisticBookingId: string) => {
    setBookingId(optimisticBookingId);
    isBookingCompletedRef.current = true;
    isPayingRef.current = true;
    setBookingLoading(false);
    setBookingError("");
    setShowInProgressLoader(true);
  };

  /** Called after payment succeeds (Razorpay callback or Cashfree redirect return).
   *  Accepts all data explicitly so it works even after a page redirect. */
  const completeBookingWithData = async (
    paymentId: string,
    paymentGateway: string,
    cartData: CartData,
    emailData: string,
    sessionId: string | undefined,
    oAmt: number,
    bFee: number,
    gTotal: number,
    coupon: string,
    offerId: string | undefined,
    usePass?: boolean,
    donationAmt?: number,
    orderId?: string,
  ) => {
    setBookingLoading(true);
    setBookingError("");
    isPayingRef.current = true;
    try {
      let result;
      if (cartData.type === "dining") {
        result = await bookingApi.createDiningBooking({
          user_email: emailData,
          user_name: billing.name,
          user_phone: billing.phone,
          address: billing.address,
          city: billing.city,
          pincode: billing.pincode,
          nationality: billing.nationality,
          state: billing.state,
          dining_id: cartData.eventId,
          venue_name: cartData.eventName,
          date: cartData.date || "",
          time_slot: cartData.timeSlot || "",
          guests: cartData.guests || 1,
          order_amount: oAmt,
          booking_fee: bFee,
          coupon_code: coupon || undefined,
          offer_id: offerId,
          user_id: sessionId,
          payment_id: paymentId,
          order_id: orderId,
          payment_gateway: paymentGateway,
          status: "booked",
          use_ticpass: usePass,
        });
      } else if (cartData.type === "play") {
        result = await bookingApi.createPlayBooking({
          user_email: emailData,
          user_name: billing.name,
          user_phone: billing.phone,
          address: billing.address,
          city: billing.city,
          pincode: billing.pincode,
          nationality: billing.nationality,
          state: billing.state,
          play_id: cartData.eventId,
          venue_name: cartData.eventName,
          date: cartData.date || "",
          slot: cartData.slot || "",
          duration: cartData.duration || 1,
          tickets: cartData.tickets.map((t) => ({
            category: t.name,
            price: t.price,
            quantity: t.quantity,
          })),
          order_amount: oAmt,
          booking_fee: bFee,
          coupon_code: coupon || undefined,
          offer_id: offerId,
          user_id: sessionId,
          payment_id: paymentId,
          order_id: orderId,
          payment_gateway: paymentGateway,
          status: "booked",
          use_ticpass: usePass,
        });
      } else {
        result = await bookingApi.createEventBooking({
          user_email: emailData,
          user_name: billing.name,
          user_phone: billing.phone,
          address: billing.address,
          city: billing.city,
          pincode: billing.pincode,
          nationality: billing.nationality,
          state: billing.state,
          event_id: cartData.eventId,
          event_name: cartData.eventName,
          tickets: cartData.tickets.map((t) => ({
            category: t.name,
            price: t.price,
            quantity: t.quantity,
          })),
          order_amount: oAmt,
          booking_fee: bFee,
          coupon_code: coupon || undefined,
          offer_id: offerId,
          user_id: sessionId,
          payment_id: paymentId,
          order_id: orderId,
          payment_gateway: paymentGateway,
          status: "booked",
          use_ticpass: usePass,
          reservation_id: reservationStore.reservationId || undefined,
          donation_amount:
            donationAmt !== undefined
              ? donationAmt
              : isDonationAdded
                ? donationAmount
                : 0,
        });
      }
      if (result?.booking_id) {
        setBookingId(result.booking_id);
      }
      // Mark completed BEFORE clearing reservation so polling/timer see it immediately
      isBookingCompletedRef.current = true;
      isPayingRef.current = true; // keep this true so timer also stops
      reservationStore.clearReservation();
      sessionStorage.removeItem("ticpin_cart");
      sessionStorage.removeItem("ticpin_billing_email");
      sessionStorage.removeItem("ticpin_billing_data");
      sessionStorage.removeItem("ticpin_booking_step");
      sessionStorage.removeItem("ticpin_pending_payment");
      setShowInProgressLoader(false);
      setStep("success");
    } catch (err: unknown) {
      setShowInProgressLoader(false);
      const message =
        err instanceof Error
          ? err.message
          : "Booking failed. Please contact support with your payment ID.";
      setBookingError(message);
      toast.error(message);
      if (!isBookingCompletedRef.current) {
        isPayingRef.current = false;
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!(billing.name || "").trim()) {
      setBookingError("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setBookingError("Please enter a valid email address");
      return;
    }
    if (
      !(billing.phone || "").trim() ||
      billing.phone.replace(/\D/g, "").length < 10
    ) {
      setBookingError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!(billing.nationality || "").trim()) {
      setBookingError("Please select your nationality");
      return;
    }
    if (!(billing.state || "").trim()) {
      setBookingError("Please select your state");
      return;
    }
    if (!acceptedTerms) {
      setBookingError("Please accept the terms and conditions");
      return;
    }

    if (!cart) return;

    if (isPayingRef.current) return;
    isPayingRef.current = true;
    setBookingLoading(true);
    setBookingError("");

    // ────── PRE-PAYMENT VALIDATION: Check if slot locks are still valid ──────
    // This prevents the "slot is expired" error that occurs if the user takes too long
    // filling out billing details (locks expire at 10 minutes)
    try {
      if ((cart.type ?? "event") === "event" && reservationStore.reservationId && session?.id) {
        const activeRes = await bookingApi.checkActiveReservation(
          cart.eventId,
          session.id,
          reservationStore.reservationId,
        );

        if (!activeRes?.active) {
          isPayingRef.current = false;
          setBookingLoading(false);
          setBookingError("Your ticket reservation has expired. Redirecting to reselect tickets...");
          toast.error("Your ticket reservation has expired. Please select tickets again.");
          reservationStore.clearReservation();
          clearEventBookingStorage();

          setTimeout(() => {
            router.replace(`/events/${name}/book`);
          }, 2000);
          return;
        }
      }
    } catch (err) {
      console.error("Pre-payment lock validation failed:", err);
      // Don't block payment if validation fails - backend will handle it
    }

    // Booking email is informational for this booking; no duplicate-account blocking needed.

    if (grandTotal === 0) {
      const freeId = isPassApplied
        ? `PASS_${cart.pass_id}_${Date.now()}`
        : `FREE_BOOKING_${Date.now()}`;
      await completeBookingWithData(
        freeId,
        isPassApplied ? "TICPASS" : "FREE",
        cart,
        email,
        session?.id,
        orderAmount,
        0, // booking fee
        0, // grand total
        appliedCoupon || "",
        appliedOffer?.id,
        isPassApplied,
        0,
        freeId,
      );
      return;
    }

    try {
      // Lock reservation and create payment order in parallel
      const [lockRes, orderRes] = await Promise.all([
        reservationStore.reservationId
          ? fetch("/backend/api/bookings/events/start-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reservation_id: reservationStore.reservationId,
              }),
            })
          : Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as any),
        bookingApi.createPaymentOrder({
          amount: grandTotal,
          customer_phone: billing.phone,
          customer_email: email || `user_${billing.phone}@ticpin.in`,
          customer_id: session?.id || `phone_${billing.phone}`,
          return_url: `${window.location.origin}${window.location.pathname}`,
          type: cart.type || "event",
        }),
      ]);

      if (reservationStore.reservationId && !lockRes.ok) {
        const errorData = await lockRes.json();
        throw new Error(
          errorData.error ||
            "Your ticket reservation lock has expired. Please select tickets again.",
        );
      }

      if (reservationStore.reservationId) {
        const lockData = await lockRes.json();
        if (lockData.payment_expires_at) {
          reservationStore.setExpiresAt(lockData.payment_expires_at);
        }
      }

      // Step 2: Store pending booking data so we can complete after redirect (Cashfree)
      sessionStorage.setItem(
        "ticpin_pending_payment",
        JSON.stringify({
          gateway: orderRes.gateway,
          orderID: orderRes.order_id,
          cart,
          email,
          sessionId: session?.id,
          orderAmount,
          bookingFee,
          grandTotal,
          appliedCoupon,
          offerId: appliedOffer?.id,
          donationAmount: isDonationAdded ? donationAmount : 0,
        }),
      );

      if (orderRes.gateway === "cashfree") {
        // Cashfree — load SDK and redirect to hosted payment page
        await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
        const cashfree = (window as any).Cashfree({
          mode:
            process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
              ? "production"
              : "sandbox",
        });
        cashfree.checkout({
          paymentSessionId: orderRes.payment_session_id,
          redirectTarget: "_self",
        });
        // Page will redirect — do NOT set loading false here
      } else {
        // Razorpay — inline modal, no redirect needed
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        const options = {
          key: orderRes.razorpay_key,
          amount: grandTotal * 100,
          currency: "INR",
          order_id: orderRes.order_id,
          name: "Ticpin",
          description: cart.eventName,
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
          prefill: {
            name: billing.name,
            email,
            contact: billing.phone,
          },
          theme: { color: "#5331EA" },
          handler: (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
          }) => {
            razorpayRef.current = null;
            showSuccessImmediately(
              response.razorpay_order_id ||
                response.razorpay_payment_id ||
                orderRes.order_id,
            );
            void completeBookingWithData(
              response.razorpay_payment_id,
              "razorpay",
              cart,
              email,
              session?.id,
              orderAmount,
              bookingFee,
              grandTotal,
              appliedCoupon,
              appliedOffer?.id,
              isPassApplied,
              isDonationAdded ? donationAmount : 0,
              response.razorpay_order_id || orderRes.order_id,
            );
          },
          modal: {
            ondismiss: async () => {
              razorpayRef.current = null;
              sessionStorage.removeItem("ticpin_pending_payment");
              setBookingLoading(false);
              isPayingRef.current = false;
              setBookingError("Payment was cancelled. Please try again.");

              // Safely revert reservation back to standard PENDING state
              if (reservationStore.reservationId) {
                try {
                  const revertRes = await fetch(
                    "/backend/api/bookings/events/fail-payment",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        reservation_id: reservationStore.reservationId,
                      }),
                    },
                  );
                  if (revertRes.ok) {
                    const checkRes = await fetch(
                      `/backend/api/bookings/events/active-reservation?event_id=${encodeURIComponent(cart.eventId)}&user_id=${encodeURIComponent(session?.id || "")}&reservation_id=${encodeURIComponent(reservationStore.reservationId)}`,
                    );
                    if (checkRes.ok) {
                      const activeData = await checkRes.json();
                      if (activeData.active && activeData.expires_at) {
                        reservationStore.setExpiresAt(activeData.expires_at);
                      } else {
                        reservationStore.clearReservation();
                        sessionStorage.removeItem("ticpin_cart");
                        toast.error("Your reservation duration has elapsed.");
                        router.replace(`/events/${name}`);
                      }
                    }
                  }
                } catch (e) {
                  console.error("Reverting payment status failed:", e);
                }
              }
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        razorpayRef.current = rzp;
        rzp.open();
      }
    } catch (err: unknown) {
      setBookingLoading(false);
      isPayingRef.current = false;
      setBookingError(
        err instanceof Error
          ? err.message
          : "Payment initiation failed. Please try again.",
      );
    }
  };

  const toggleSection = (section: "offers" | "coupons") => {
    setExpandedSection((prev) => (prev === section ? "none" : section));
  };

  const handleOrganizerLogout = () => {
    clearOrganizerSession();
    setShowAuthModal(true);
  };

  const handleUserLogout = () => {
    clearUserSession();
    setIsProfileDrawerOpen(false);
    router.push("/");
  };



  if (showInProgressLoader) {
    const eventDateStr = eventData?.date
      ? new Date(eventData.date).toLocaleDateString("en-IN", {
          timeZone: "UTC",
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      : "";
    const eventTimeStr = eventData?.time ? ` | ${eventData.time} onwards` : "";
    const dateTimeStr = `${eventDateStr}${eventTimeStr}`;
    const venueName = eventData?.venue_name || "";
    const venueAddress = eventData?.venue_address || "";
    const venuePart = [venueName, venueAddress].filter(Boolean).join(" | ");
    const ticketSummaryStr = cart?.tickets
      ? cart.tickets.map((t: any) => `${t.quantity} x ${t.name}`).join(", ")
      : "";

    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative"
        style={{
          background: "linear-gradient(180deg, #ECE8FD 0%, #FFFFFF 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-4 max-w-[480px] w-full text-center animate-in fade-in duration-300">
          {/* Spinner */}
          <div className="w-8 h-8 border-[3px] border-[#5331EA] border-t-transparent rounded-full animate-spin" />
          
          <h2 className="text-[18px] font-bold text-black" style={{ fontFamily: 'var(--font-anek-latin)' }}>
            Booking in progress
          </h2>

          {/* Info Card */}
          <div className="w-full bg-white border border-[#E5E7EB] rounded-[20px] p-6 flex flex-col items-start text-left shadow-md mt-2">
            <h3 className="text-[16px] font-bold text-black mb-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
              {eventData?.name || cart?.eventName}
            </h3>
            {dateTimeStr && (
              <p className="text-[13px] text-[#686868] font-medium mb-1" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                {dateTimeStr}
              </p>
            )}
            {venuePart && (
              <p className="text-[13px] text-[#686868] font-medium mb-3" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                {venuePart}
              </p>
            )}
            {ticketSummaryStr && (
              <p className="text-[13px] text-[#686868] font-semibold" style={{ fontFamily: 'var(--font-anek-latin)' }}>
                {ticketSummaryStr}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen w-full flex flex-col relative">
        <SuccessView
          bookingId={bookingId}
          cart={cart}
          grandTotal={grandTotal}
          billing={billing}
          session={session}
          email={email}
          setIsProfileDrawerOpen={setIsProfileDrawerOpen}
        />
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
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileReviewBooking
        cart={cart as any}
        step={step}
        setStep={setStep}
        timeRemaining={timeRemaining}
        formatTimer={(seconds) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }}
        eventData={eventData}
        offers={offers}
        expandedSection={expandedSection}
        toggleSection={(sec) =>
          setExpandedSection((prev) => (prev === sec ? "none" : sec))
        }
        couponInput={couponInput}
        setCouponInput={setCouponInput}
        validateCoupon={async () => {
          if (!couponInput.trim()) {
            setCouponError("Please enter a coupon code");
            return;
          }
          setCouponLoading(true);
          setCouponError("");
          setCouponSuccess("");
          try {
            const res = await bookingApi.validateCoupon(
              couponInput,
              "event",
              orderAmount,
              session?.id,
            );
            if (res.valid) {
              setAppliedCoupon(couponInput);
              setCouponDiscount(res.discount_amount);
              setCouponSuccess(
                `Coupon applied! You save ₹${res.discount_amount}`,
              );
              setAppliedOffer(null);
              setOfferDiscount(0);
            } else {
              setCouponError("Invalid coupon code");
            }
          } catch (err: any) {
            setCouponError(err.message || "Invalid coupon code");
          } finally {
            setCouponLoading(false);
          }
        }}
        couponLoading={couponLoading}
        couponError={couponError}
        couponSuccess={couponSuccess}
        applyOffer={(offer) => {
          setAppliedOffer(offer);
          setOfferDiscount(
            offer.discount_type === "percent"
              ? Math.round((orderAmount * offer.discount_value) / 100)
              : Math.min(offer.discount_value, orderAmount),
          );
          setAppliedCoupon("");
          setCouponDiscount(0);
          setCouponInput("");
        }}
        removeOffer={() => {
          setAppliedOffer(null);
          setOfferDiscount(0);
        }}
        removeCoupon={() => {
          setAppliedCoupon("");
          setCouponDiscount(0);
          setCouponInput("");
        }}
        orderAmount={orderAmount}
        bookingFee={bookingFee}
        totalDiscount={totalDiscount}
        grandTotal={grandTotal}
        billing={billing}
        setBilling={setBilling}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        email={email}
        setEmail={setEmail}
        handlePayNow={handlePayNow}
        handleContinue={handleContinue}
        bookingError={bookingError}
        setBookingError={setBookingError}
        bookingLoading={bookingLoading}
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
        removeTicket={removeTicket}
        phoneInputValue={phoneInputValue}
        handlePhoneChange={handlePhoneChange}
        onBack={() => router.back()}
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
        isDonationAdded={isDonationAdded}
        setIsDonationAdded={setIsDonationAdded}
        isDonationEdited={isDonationEdited}
        setIsDonationEdited={setIsDonationEdited}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-[family-name:var(--font-anek-latin)] overflow-x-hidden"
      style={{ background: "rgba(211, 203, 245, 0.1)" }}
    >
      {/* ====== MOBILE VIEW (md:hidden) ====== */}
      <div
        className="md:hidden min-h-screen bg-white relative flex flex-col pb-[120px] select-none"
        style={{ fontFamily: "var(--font-anek-latin)" }}
      >
        {/* Header Section */}
        <div className="w-full pt-[17px] px-[15px] relative h-[60px] shrink-0 flex items-center justify-center">
          <button
            onClick={() => {
              router.back();
            }}
            className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm absolute left-[15px] top-[17px] border border-[#EFEFEF] active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-black" />
          </button>

          <h1
            className="text-[18px] font-semibold text-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-anek-latin)" }}
          >
            Review your booking
          </h1>
        </div>

        {/* Complete your booking in TIME mins banner (Rectangle 524) */}
        {timeRemaining > 0 && (
          <div className="mx-[15px] mt-[10px] h-[29px] bg-[#E1E1E1] rounded-[8px] flex items-center justify-center gap-2 px-3 shrink-0">
            <Clock size={13} className="text-black" />
            <span
              className="text-[12px] font-medium text-black"
              style={{ fontFamily: "var(--font-anek-latin)" }}
            >
              Complete your booking in{" "}
              <span className="font-bold text-[#5331EA]">
                {formatTimer(timeRemaining)}
              </span>{" "}
              mins
            </span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-[15px] pt-4 space-y-[22px]">
          {/* Event summary with thumbnail */}
          <div className="flex gap-[15px] items-center">
            <div className="w-[80px] h-[63px] bg-[#110D2C] rounded-[10px] overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm border border-[#E1E1E1]">
              {eventData?.landscape_image_url ||
              eventData?.portrait_image_url ? (
                <Image
                  src={
                    eventData.landscape_image_url ||
                    eventData.portrait_image_url ||
                    ""
                  }
                  alt={cart?.eventName || "Event Poster"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-black/10 z-10" />
                  <span className="text-[10px] text-[#5331EA] font-extrabold italic uppercase tracking-wider text-center z-20">
                    TICPIN
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col">
              <h2
                className="text-[15px] font-semibold text-black uppercase tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                {cart?.eventName || "EVENT NAME"}
              </h2>
              <p
                className="text-[13px] font-normal text-[#686868] mt-0.5 uppercase tracking-wide"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                {cart?.city || "LOCATION"}
              </p>
            </div>
          </div>

          {/* Ticket details (Rectangle 525) */}
          <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white overflow-hidden shadow-sm">
            {/* Event Date & Time */}
            <div className="px-4 py-3 bg-zinc-50 border-b border-[#D9D9D9] flex justify-between items-center">
              <span
                className="text-[15px] font-semibold text-black"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                {cart?.date
                  ? new Date(cart.date).toLocaleDateString("en-IN", {
                      timeZone: "UTC",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })
                  : "Sat, 23 May"}
              </span>
              <span
                className="text-[15px] font-semibold text-black"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                {cart?.timeSlot || "7 PM"}
              </span>
            </div>

            {/* Selected Tickets */}
            <div className="p-4 space-y-4">
              {cart?.tickets?.map((t, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span
                        className="text-[18px] font-medium text-black"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        {t.quantity} x {t.name}
                      </span>
                      <span
                        className="text-[15px] font-normal text-[#686868] mt-1"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        ₹{formatPrice(t.price)} cover
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="text-[18px] font-semibold text-black"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        ₹{formatPrice(t.price * t.quantity)}
                      </span>
                      <button
                        onClick={() => removeTicket(i)}
                        className="text-[12px] font-semibold text-[#686868] underline active:scale-95 transition-transform"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OFFERS section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                OFFERS
              </span>
              <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
            </div>

            <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white divide-y divide-[#D9D9D9] shadow-sm">
              <button
                onClick={() => toggleSection("offers")}
                className="w-full h-[55px] flex items-center justify-between px-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5331EA]/10 flex items-center justify-center text-[#5331EA]">
                    <Percent size={14} />
                  </div>
                  <span
                    className="text-[18px] font-medium text-black text-left"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    View all event offers
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-[#686868] transition-transform ${expandedSection === "offers" ? "rotate-90" : ""}`}
                />
              </button>

              <button
                onClick={() => toggleSection("coupons")}
                className="w-full h-[55px] flex items-center justify-between px-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5331EA]/10 flex items-center justify-center text-[#5331EA]">
                    <Tag size={14} />
                  </div>
                  <span
                    className="text-[18px] font-medium text-black text-left"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    View all coupon codes
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-[#686868] transition-transform ${expandedSection === "coupons" ? "rotate-90" : ""}`}
                />
              </button>
            </div>

            {/* Offers/Coupons Expanded panel */}
            {expandedSection !== "none" && (
              <div className="border border-[#D9D9D9] rounded-[9px] p-4 bg-zinc-50 space-y-3 animate-in fade-in duration-200">
                {expandedSection === "coupons" ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-[#AEAEAE] rounded-[8px] px-3 h-[40px] text-[14px] font-medium outline-none bg-white"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                      />
                      <button
                        onClick={() => validateCoupon()}
                        disabled={couponLoading}
                        className="px-4 bg-black text-white rounded-[8px] text-[13px] font-bold active:scale-95 transition-transform"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[12px]">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="text-green-600 text-[12px]">
                        {couponSuccess}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {offers.length > 0 ? (
                      offers.map((o) => (
                        <div
                          key={o.id}
                          className="flex justify-between items-center p-2 bg-white rounded border border-[#D9D9D9]"
                        >
                          <div>
                            <p className="font-bold text-[13px]">{o.title}</p>
                            <p className="text-[11px] text-[#686868]">
                              {o.description}
                            </p>
                          </div>
                          <button
                            onClick={() => applyOffer(o)}
                            className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-bold"
                          >
                            Apply
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-[#686868] italic text-center">
                        No offers available for this event
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAYMENT DETAILS (Rectangle 527) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                PAYMENT DETAILS
              </span>
              <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
            </div>

            <div className="w-full border border-[#D9D9D9] rounded-[9px] bg-white p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className="text-[17px] font-semibold text-black"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  Order amount
                </span>
                <span
                  className="text-[17px] font-semibold text-black"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  ₹{formatPrice(orderAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className="text-[12px] font-normal text-black flex items-center gap-1.5"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  Fees and chargers{" "}
                  <ChevronDown size={14} className="text-zinc-500" />
                </span>
                <span
                  className="text-[12px] font-normal text-black"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  ₹{formatPrice(bookingFee)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span
                    className="text-[12px] font-medium"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    Discount Applied
                  </span>
                  <span
                    className="text-[12px] font-bold"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    -₹{formatPrice(totalDiscount)}
                  </span>
                </div>
              )}

              <div className="w-full h-[0.7px] bg-[#D9D9D9]" />

              <div className="flex justify-between items-center">
                <span
                  className="text-[15px] font-semibold text-black"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  Grand Total
                </span>
                <span
                  className="text-[17px] font-semibold text-black"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  ₹{formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* DONATE TO EXPERIENCE INDIA (Rectangle 528 & Rectangle 529) */}
          {/*
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase" style={{ fontFamily: "var(--font-anek-latin)" }}>DONATE TO EXPERIENCE INDIA</span>
                            <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
                        </div>

                        <div className="w-full rounded-[9px] overflow-hidden border border-[#D9D9D9] shadow-sm flex flex-col bg-white">
                            <div className="w-full bg-[#5331EA]/15 p-5 relative min-h-[105px] flex items-center justify-between">
                                <div className="max-w-[70%] z-10 flex flex-col">
                                    <span className="text-[18px] font-semibold text-[#5331EA] leading-tight" style={{ fontFamily: "var(--font-anek-latin)" }}>
                                        Helping children
                                    </span>
                                    <span className="text-[18px] font-semibold text-[#5331EA] leading-tight" style={{ fontFamily: "var(--font-anek-latin)" }}>
                                        access nutritious food
                                    </span>
                                </div>

                                <div className="w-[78px] h-[78px] shrink-0 rounded-full bg-white flex items-center justify-center shadow-inner relative overflow-hidden border border-[#5331EA]/25">
                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#FAF9FF]">
                                        <Heart size={34} fill="#5331EA" className="text-[#5331EA] animate-pulse" />
                                        <span className="text-[8px] font-extrabold text-[#5331EA] tracking-tighter mt-1">FEED INDIA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full bg-white h-[56px] border-t border-[#AEAEAE]/40 flex items-center justify-between px-4 shrink-0">
                                <span className="text-[12px] font-normal text-black" style={{ fontFamily: "var(--font-anek-latin)" }}>
                                    Donate with every order
                                </span>

                                <div className="flex items-center gap-2">
                                    <div className="w-[69px] h-[27px] border border-[#AEAEAE] rounded-[7px] flex items-center justify-center px-1 bg-white relative">
                                        <span className="text-[12px] font-normal text-black mr-1" style={{ fontFamily: "var(--font-anek-latin)" }}>₹</span>
                                        <input
                                            type="number"
                                            value={donationAmount}
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                setDonationAmount(isNaN(val) ? 0 : Math.max(0, val));
                                                setIsDonationEdited(true);
                                            }}
                                            disabled={isDonationAdded}
                                            className="w-8 h-full text-center text-[12px] font-semibold bg-transparent focus:outline-none text-black disabled:opacity-75"
                                        />
                                        <Edit2 size={10} className="text-[#686868] ml-0.5 shrink-0" />
                                    </div>

                                    <button
                                        onClick={() => setIsDonationAdded(!isDonationAdded)}
                                        className={`w-[56px] h-[27px] rounded-[7px] text-[12px] font-semibold flex items-center justify-center transition-all ${
                                            isDonationAdded
                                            ? 'bg-[#5331EA] text-white border border-[#5331EA]'
                                            : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                                        }`}
                                    >
                                        {isDonationAdded ? (
                                            <span className="flex items-center gap-0.5"><Check size={11} strokeWidth={3} /> Yes</span>
                                        ) : `+${donationAmount}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    */}

          {/* BILLING DETAILS (Rectangle 532) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[13px] font-semibold text-[#3B3B3B] tracking-[0.1em] uppercase"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                BILLING DETAILS
              </span>
              <div className="flex-1 h-[0.7px] bg-[#D9D9D9] ml-4" />
            </div>

            <div className="w-full border border-[#AEAEAE] rounded-[9px] bg-white p-4 shadow-sm flex flex-col relative">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EFEFEF] flex items-center justify-center text-zinc-500">
                    <User size={16} />
                  </div>
                  <span
                    className="text-[15px] font-semibold text-black"
                    style={{ fontFamily: "var(--font-anek-latin)" }}
                  >
                    {billing.name || session?.name || "User Name"}
                  </span>
                </div>
                <button
                  onClick={() => setStep("billing")}
                  className="text-[12px] font-semibold text-[#5331EA] flex items-center gap-1 active:scale-95 transition-all"
                  style={{ fontFamily: "var(--font-anek-latin)" }}
                >
                  Edit <ChevronRight size={14} />
                </button>
              </div>

              <div
                className="space-y-1 text-[13px] font-normal text-black pl-11"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                <p className="opacity-90">
                  {billing.phone || session?.phone || "Phone number"}
                </p>
                <p className="opacity-90">
                  {email || session?.email || "Email ID"}
                </p>
                <p className="opacity-90">
                  {billing.state || "State / Region"}
                </p>
              </div>

              <div className="w-full h-[0.7px] bg-[#D9D9D9] my-4" />

              <p
                className="text-[12px] font-normal text-[#686868] leading-snug pl-1"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                Information mentioned above will be used for generating the
                invoice and sending out the tickets.
              </p>
            </div>
          </div>

          {/* Phone input confirmation if in review step */}
          {step === "review" && (
            <div className="space-y-2">
              <label
                className="text-[13px] font-semibold text-[#686868] block"
                style={{ fontFamily: "var(--font-anek-latin)" }}
              >
                Mobile number for booking confirmation
              </label>
              <div className="w-full h-[48px] border border-[#AEAEAE] rounded-[10px] px-4 flex items-center bg-white">
                <span className="text-[15px] font-semibold text-black mr-2">
                  🇮🇳 +91
                </span>
                <input
                  type="text"
                  value={phoneInputValue || billing.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit mobile"
                  maxLength={10}
                  inputMode="numeric"
                  className="flex-1 h-full bg-transparent focus:outline-none text-black font-semibold text-[15px] placeholder:text-[#AEAEAE]"
                />
              </div>
              {bookingError && (
                <p className="text-red-500 text-[13px] font-semibold leading-tight">
                  {bookingError}
                </p>
              )}
            </div>
          )}

          {/* Billing Form Modal step (step === billing) inline for mobile */}
          {step === "billing" && (
            <div className="space-y-3 border border-[#D9D9D9] rounded-[9px] p-4 bg-zinc-50 animate-in slide-in-from-top duration-300">
              <div>
                <label className="text-[12px] font-semibold text-[#686868] block mb-1">
                  Full Name
                </label>
                <input
                  className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                  value={billing.name}
                  onChange={(e) =>
                    setBilling((b) => ({ ...b, name: e.target.value }))
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#686868] block mb-1">
                  Email
                </label>
                <input
                  className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  type="email"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#686868] block mb-1">
                  State
                </label>
                <select
                  className="w-full h-[44px] border border-[#AEAEAE] rounded-[9px] px-4 text-[14px] font-medium outline-none bg-white"
                  value={billing.state}
                  onChange={(e) =>
                    setBilling((b) => ({ ...b, state: e.target.value }))
                  }
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-start gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-black"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="text-[12px] text-[#686868] leading-snug">
                  I agree to the{" "}
                  <a href="/terms" className="underline text-black">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline text-black">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {bookingError && (
                <p className="text-red-500 text-[13px]">{bookingError}</p>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer (Rectangle 519) */}
        <div className="fixed bottom-0 left-0 right-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-[#E5E5E5] z-50">
          <div className="flex flex-col">
            <span
              className="text-[12px] font-normal text-black"
              style={{ fontFamily: "var(--font-anek-latin)" }}
            >
              {cart?.tickets?.reduce((s, t) => s + t.quantity, 0) || 0} ticket
              {(cart?.tickets?.reduce((s, t) => s + t.quantity, 0) || 0) !== 1
                ? "s"
                : ""}
            </span>
            <span
              className="text-[20px] font-medium text-black leading-tight"
              style={{ fontFamily: "var(--font-anek-latin)" }}
            >
              ₹{formatPrice(grandTotal)}
            </span>
          </div>

          <button
            onClick={step === "review" ? handleContinue : handlePayNow}
            disabled={bookingLoading}
            className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
            style={{ fontFamily: "var(--font-anek-latin)" }}
          >
            {bookingLoading
              ? "LOCKING..."
              : step === "review"
                ? "Checkout"
                : "Pay Now"}
          </button>
        </div>
      </div>

      {/* ====== DESKTOP VIEW (hidden md:block) ====== */}
      <div className="hidden md:flex flex-col min-h-screen w-full overflow-x-hidden">
            <style>{`
                @font-face {
                    font-family: 'Anek Tamil Condensed';
                    src: url('/fonts/AnekTamil_Condensed-Medium.ttf') format('truetype');
                    font-weight: 500;
                    font-style: normal;
                }
                @font-face {
                    font-family: 'Anek Tamil Condensed';
                    src: url('/fonts/AnekTamil_Condensed-Bold.ttf') format('truetype');
                    font-weight: 700;
                    font-style: normal;
                }
 
                :root {
                    --font-anek-latin: 'Anek Latin', sans-serif;
                    --font-anek-tamil: 'Anek Tamil Condensed', sans-serif;
                }

                /* Hide scrollbars while keeping functionality */
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;      /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;  /* Chrome, Safari and Opera */
                }
            `}</style>

        {/* Header */}
        <header className="w-full h-[60px] md:h-[70px] bg-white flex items-center justify-between px-6 md:px-10 border-b border-[#FFFFFF] shadow-sm relative z-10 shrink-0">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => {
              router.push("/");
            }}
          >
            <Image
              src="/ticpin-logo-black.png"
              alt="TICPIN"
              width={159}
              height={25}
              className="h-[20px] md:h-[25px] w-auto object-contain"
              style={{ width: "auto" }}
            />
          </div>
          <h1
            className="text-[18px] md:text-[22px] font-semibold text-black"
            style={{ fontFamily: "var(--font-anek-latin)" }}
          >
            {step === "billing" ? "Review & Billing" : "Review your booking"}
          </h1>
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

        {timeRemaining > 0 && (
          <div className="w-full bg-[#f4effe] flex items-center justify-center py-1.5 border-b border-[#e9defe] shrink-0">
            <Clock className="w-4 h-4 text-[#5331EA] mr-2" />
            <span className="text-[13px] font-medium text-[#4a3978]">
              Complete your booking in{" "}
              <span className="text-[#5331EA] font-bold">
                {formatTimer(timeRemaining)}
              </span>{" "}
              mins
            </span>
          </div>
        )}

        <main className="w-full max-w-[1100px] mx-auto px-6 py-4 space-y-4 flex-grow overflow-x-hidden">
          <OrderSummary
            cart={cart}
            updateTicketQuantity={updateTicketQuantity}
            removeTicket={removeTicket}
            orderAmount={orderAmount}
            bookingFee={bookingFee}
            showGstDetails={showGstDetails}
            setShowGstDetails={setShowGstDetails}
            passDiscount={passDiscount}
            totalDiscount={totalDiscount}
            grandTotal={grandTotal}
            router={router}
            offersSection={
              <OffersCoupons
                cart={cart}
                session={session}
                expandedSection={expandedSection}
                toggleSection={toggleSection}
                offers={offers}
                appliedOffer={appliedOffer}
                offerDiscount={offerDiscount}
                applyOffer={applyOffer}
                removeOffer={removeOffer}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
                removeCoupon={removeCoupon}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                validateCoupon={validateCoupon}
                couponLoading={couponLoading}
                couponError={couponError}
                couponSuccess={couponSuccess}
                availableCoupons={availableCoupons}
              />
            }
            bottomSection={
              step === "review" && (
                <div className="pt-2 mt-2">
                  {bookingError && (
                    <p className="text-red-500 text-[14px] font-medium mb-3">
                      {bookingError}
                    </p>
                  )}
                  <button
                    onClick={handleContinue}
                    disabled={!cart?.tickets?.length}
                    className="w-full h-[45px] bg-black text-white rounded-[10px] uppercase font-semibold tracking-normal flex items-center justify-center disabled:opacity-40"
                    style={{
                      color: "white",
                      fontSize: "24px",
                      fontFamily:
                        "var(--font-anek-tamil-condensed), 'Anek Tamil Condensed', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    CONTINUE
                  </button>
                </div>
              )
            }
          />

          {step === "billing" && (
            <BillingDetailsForm
              billingRef={billingRef}
              cart={cart}
              grandTotal={grandTotal}
              billing={billing}
              setBilling={setBilling as any}
              email={email}
              setEmail={setEmail}
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              bookingError={bookingError}
              setBookingError={setBookingError}
              bookingLoading={bookingLoading}
              isPaying={isPayingRef.current}
              handlePayNow={handlePayNow}
              INDIAN_STATES={INDIAN_STATES}
            />
          )}
        </main>


      </div>
      {/* End Desktop wrapper */}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
    </div>
  );
}
