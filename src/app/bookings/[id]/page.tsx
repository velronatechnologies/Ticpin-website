// "use client";

// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   CheckCircle,
//   MessageSquare,
//   User,
//   X,
//   XCircle,
//   Download,
//   Check,
//   MapPin,
//   Navigation,
//   RefreshCw,
//   Ticket,
//   PlayCircle,
//   Utensils,
//   ChevronLeft,
// } from "lucide-react";
// import React, { useState, useEffect, useRef } from "react";
// import { useUserSession } from "@/lib/auth/user";
// import { bookingApi } from "@/lib/api/booking";
// import { profileApi } from "@/lib/api/profile";
// import Image from "next/image";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { QRCodeCanvas } from "qrcode.react";

// export default function BookingDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const bookingId = params?.id as string;
//   const session = useUserSession();
//   const ticketRef = useRef<HTMLDivElement>(null);

//   const [hasCheckedSession, setHasCheckedSession] = useState(false);
//   const [booking, setBooking] = useState<any>(null);
//   const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
//   const [cancelStep, setCancelStep] = useState<
//     "reason" | "donation" | "success"
//   >("reason");
//   const [selectedReason, setSelectedReason] = useState<string | null>(null);
//   const [donationChoice, setDonationChoice] = useState<
//     "full_refund" | "full_donate" | "split" | null
//   >(null);
//   const [splitAmount, setSplitAmount] = useState("");
//   const [cancelling, setCancelling] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setHasCheckedSession(true);
//     }, 150);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (!hasCheckedSession) return;
//     if (!session) {
//       router.replace("/bookings");
//     }
//   }, [hasCheckedSession, session, router]);

//   const reasons = [
//     "Plan change",
//     "Found a better offer elsewhere",
//     "Booked by mistake",
//     "Others",
//   ];

//   const bookingTotal = booking?.grand_total ?? booking?.order_amount ?? 0;

//   const openCancelModal = () => {
//     setCancelStep("reason");
//     setSelectedReason(null);
//     setDonationChoice(null);
//     setSplitAmount("");
//     setIsCancelModalOpen(true);
//   };

//   const handleCancelSubmit = async () => {
//     if (!selectedReason || !booking) return;
//     setCancelling(true);

//     const donationAmount = 0;

//     try {
//       await bookingApi.cancelBooking(
//         booking.id,
//         booking.type || "play",
//         selectedReason,
//         donationAmount,
//       );
//       // Refresh booking data
//       const res = await fetch(
//         `/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ""}`,
//         {
//           credentials: "include",
//         },
//       );
//       const data = await res.json();
//       setBooking(data);
//       setCancelStep("success");
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Failed to cancel booking");
//     } finally {
//       setCancelling(false);
//     }
//   };

//   useEffect(() => {
//     if (bookingId) {
//       setLoading(true);
//       fetch(
//         `/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ""}`,
//         {
//           credentials: "include",
//         },
//       )
//         .then((res) =>
//           res.ok ? res.json() : Promise.reject("Failed to load booking"),
//         )
//         .then((data) => {
//           console.log("Booking data from backend:", data);
//           console.log("Booking fee value:", data.booking_fee);
//           setBooking(data);
//           setLoading(false);
//         })
//         .catch((err) => {
//           setError(err.toString());
//           setLoading(false);
//         });
//     }
//   }, [bookingId, session]);

//   // Fetch profile photo for the logged‑in user
//   useEffect(() => {
//     if (session?.id) {
//       profileApi
//         .getProfile(session.id)
//         .then((p) => {
//           if (p?.profilePhoto) setProfilePhoto(p.profilePhoto);
//         })
//         .catch((err) => console.error("Failed to fetch profile:", err));
//     }
//   }, [session]);

//   const handleDownloadBill = async () => {
//     if (!ticketRef.current) return;
//     setDownloading(true);
//     try {
//       const canvas = await html2canvas(ticketRef.current, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: "#F5F5F5",
//         width: 800,
//         windowWidth: 800,
//       });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF({
//         orientation: "portrait",
//         unit: "mm",
//         format: "a4",
//       });
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`TICPIN_Ticket_${booking?.booking_id || bookingId}.pdf`);
//     } catch (err) {
//       console.error("PDF generation error:", err);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   if (loading || !hasCheckedSession || !session) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (error || !booking) {
//     return (
//       <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//         <XCircle size={60} className="text-red-500 mb-4" />
//         <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
//         <p className="text-[#686868] mb-6">
//           {error || "The requested booking details could not be loaded."}
//         </p>
//         <button
//           onClick={() => router.push("/bookings")}
//           className="px-8 py-3 bg-black text-white rounded-xl"
//         >
//           Back to Bookings
//         </button>
//       </div>
//     );
//   }

//   const isCancelled =
//     booking.status === "cancelled" || booking.status === "refunded";
//   const isRefunded = booking.status === "refunded";

//   const formatDisplayDate = (value?: string, fallback?: string) => {
//     const raw = value || fallback;
//     if (!raw) return "Date TBA";
//     const parsed = new Date(raw);
//     if (isNaN(parsed.getTime())) return raw;
//     return parsed.toLocaleDateString("en-IN", {
//       weekday: "short",
//       day: "numeric",
//       month: "short",
//     });
//   };

//   const formatBookingDate = (value?: string, fallback?: string) => {
//     const raw = value || fallback;
//     if (!raw) return "Date unavailable";
//     const parsed = new Date(raw);
//     if (isNaN(parsed.getTime())) return raw;
//     return parsed.toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const formatDisplayTime = (value?: string) => {
//     const raw = (value || "").trim();
//     if (!raw) return "TBA";

//     const formatSingleTime = (part: string) => {
//       const timePart = part.trim();
//       if (!timePart) return "";
//       const layouts = [/^(\d{1,2}):(\d{2})$/, /^(\d{1,2}):(\d{2}):(\d{2})$/];
//       for (const layout of layouts) {
//         const match = timePart.match(layout);
//         if (match) {
//           const hours = Number(match[1]);
//           const minutes = Number(match[2]);
//           if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
//             const date = new Date();
//             date.setHours(hours, minutes, 0, 0);
//             return date
//               .toLocaleTimeString("en-IN", {
//                 hour: "numeric",
//                 minute: "2-digit",
//                 hour12: true,
//               })
//               .toUpperCase();
//           }
//         }
//       }
//       return timePart;
//     };

//     if (raw.includes("-")) {
//       return raw.split("-").map(formatSingleTime).filter(Boolean).join(" - ");
//     }

//     return formatSingleTime(raw);
//   };

//   const displayName =
//     booking.event_name || booking.venue_name || booking.play_name || "Booking";
//   const displayLocation =
//     booking.city ||
//     booking.venue_address ||
//     booking.event_location ||
//     (booking.venue_name && booking.city
//       ? `${booking.venue_name}, ${booking.city}`
//       : "") ||
//     booking.venue_name ||
//     "Venue Location";
//   const displayHeaderAddress =
//     displayLocation.split(",")[0]?.trim() || displayLocation;
//   const displayDate = formatDisplayDate(
//     booking.event_date || booking.date,
//     booking.booked_at,
//   );
//   const displayTime = formatDisplayTime(
//     booking.event_time || booking.time || booking.time_slot,
//   );
//   const displayDateTime = `${displayDate} | ${displayTime}`;
//   const displayUserName =
//     booking.user_name && booking.user_name !== "User"
//       ? booking.user_name
//       : session?.name || "User";
//   const displayUserPhone = booking.user_phone || session?.phone || "N/A";
//   const displayBookingDate = formatBookingDate(
//     booking.booked_at || booking.created_at,
//     booking.date,
//   );
//   const displayTicketSummary =
//     Array.isArray(booking.tickets) && booking.tickets.length > 0
//       ? booking.tickets
//         .map(
//           (ticket: any) =>
//             `${ticket.category || ticket.name || "Ticket"} - ${ticket.quantity || 1}`,
//         )
//         .join(", ")
//       : "Ticket - 1";
//   const displayQuantity =
//     booking.type === "play"
//       ? `${booking.duration ? booking.duration * 30 : "60"} mins`
//       : booking.type === "dining"
//         ? `${booking.guests} Guests`
//         : displayTicketSummary;
//   const displayBillValue =
//     bookingTotal === 0
//       ? "FREE"
//       : `₹${Number(bookingTotal || 0).toLocaleString("en-IN")}`;
//   const bookingFeeValue = Number(booking.order_amount || 0);
//   const basePlatformFee = bookingFeeValue > 0 ? bookingFeeValue / 1.18 : 0;
//   const gstOnFee = bookingFeeValue - basePlatformFee;
//   const donationValue = Number(booking.donation_amount || 0);
//   const discountValue = Number(booking.discount_amount || 0);
//   //   const subtotalValue = Number(booking.order_amount || 0);

//   // Check if booking date is expired
//   const isExpired = booking.date
//     ? new Date(booking.date).getTime() < new Date().setHours(0, 0, 0, 0)
//     : false;

//   return (
//     <div
//       className={`bg-white font-[family-name:var(--font-anek-latin)] relative pb-0 ${isCancelModalOpen ? "overflow-hidden" : ""}`}
//     >
//       <style>{`
//                 body {
//                     background-color: white !important;
//                 }
//             `}</style>
//       {/* Header */}
//       <header className="h-14 w-full bg-white border-b border-[#D9D9D9] flex items-center px-3 md:h-20 md:px-10 md:lg:px-[37px] sticky top-0 z-50">
//         <div className="flex items-center gap-3 md:gap-10">
//           <button
//             onClick={() => router.push("/bookings")}
//             className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center border border-[#D9D9D9] rounded-full hover:bg-zinc-50 transition-colors"
//           >
//             <ChevronLeft size={20} className="text-black md:hidden" />
//             <ChevronLeft size={24} className="text-black hidden md:block" />
//           </button>

//           <Link href="/">
//             <img
//               src="/ticpin-logo-black.png"
//               alt="TICPIN"
//               className="h-5 md:h-7 w-auto"
//             />
//           </Link>

//           <div className="hidden md:flex items-center gap-8">
//             {/* Divider Line */}
//             <div className="w-[1.5px] h-8 bg-[#AEAEAE] mx-1" />

//             <div className="flex items-center gap-6">
//               {/* Venue Thumbnail */}
//               <div className="w-[85px] h-[48px] bg-zinc-100 rounded-[10px] overflow-hidden flex items-center justify-center">
//                 {booking.event_image_url ||
//                   booking.venue_image_url ||
//                   booking.play_image ||
//                   booking.image_url ? (
//                   <img
//                     src={
//                       booking.event_image_url ||
//                       booking.venue_image_url ||
//                       booking.play_image ||
//                       booking.image_url
//                     }
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <MapPin size={24} className="text-zinc-400" />
//                 )}
//               </div>

//               <div className="flex flex-col justify-center">
//                 <h2 className="text-[18px] font-medium text-black leading-tight uppercase tracking-tight">
//                   {displayName}
//                 </h2>
//                 <p className="text-[15px] font-medium text-[#686868] leading-tight uppercase tracking-tight mt-0.5">
//                   {booking.city || displayHeaderAddress}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-[480px] md:max-w-[787px] mx-auto px-3 mt-3 md:mt-8 md:px-4 pb-0 mb-0 space-y-4 md:space-y-6">
//         {/* Main Booking Card (Confirm/Cancel state) */}
//         <div className="relative bg-white border-[0.5px] border-[#686868] rounded-[20px] md:rounded-[25px] overflow-hidden">
//           {/* Gradient Background Overlay */}
//           <div
//             className="absolute inset-0 pointer-events-none opacity-100 transition-colors duration-500"
//             style={{
//               background: isCancelled
//                 ? "radial-gradient(52.97% 102.98% at 0% -7.55%, #FFD6D6 0%, #FFFFFF 100%)"
//                 : isExpired
//                   ? "radial-gradient(52.97% 102.98% at 0% -7.55%, #FFE4CC 0%, #FFFFFF 100%)"
//                   : "radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)",
//             }}
//           />

//           <div className="relative pt-3 pb-5 px-4 md:pt-4 md:pb-10 md:px-11 space-y-1">
//             {/* Header Box */}
//             <div className="flex flex-row items-start justify-between gap-3">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-[20px] md:text-[34px] font-semibold text-black leading-none truncate">
//                     {isRefunded
//                       ? "Booking refunded"
//                       : isCancelled
//                         ? "Booking cancelled"
//                         : isExpired
//                           ? "Booking expired"
//                           : "Booking confirmed"}
//                   </h1>
//                   <div className="w-5 h-5 md:w-[38px] md:h-[38px] flex-shrink-0">
//                     {isCancelled ? (
//                       <XCircle className="w-full h-full text-red-500" />
//                     ) : isExpired ? (
//                       <XCircle className="w-full h-full text-orange-500" />
//                     ) : (
//                       <img
//                         src="/events/check-circle.svg"
//                         alt="Booking Confirmed"
//                         className="w-full h-full"
//                       />
//                     )}
//                   </div>
//                 </div>
//                 <p className="text-[12px] md:text-[17px] font-medium text-[#686868] mt-1 leading-tight">
//                   {isRefunded
//                     ? "Refund has been processed"
//                     : isCancelled
//                       ? "The refund if any will be processed soon"
//                       : isExpired
//                         ? "This booking has passed and is no longer active"
//                         : "Reach the venue 10 mins before your slot"}
//                 </p>
//                 {/* Divider */}
//                 <div className="h-[0.5px] bg-[#686868] w-full md:w-1/2 mt-3 md:mt-4" />
//               </div>

//               {/* Compact QR Code positioned on the right corner straight to green tick */}
//               {(booking.type === "event" ||
//                 (booking.type !== "play" && booking.type !== "dining")) &&
//                 !isCancelled &&
//                 !isExpired &&
//                 !isRefunded && (
//                   <div className="flex flex-col items-center justify-center p-1.5 md:p-3 bg-[#EBEBEB] border border-[#686868]/30 rounded-[10px] md:rounded-[16px] shrink-0 w-[70px] h-[70px] md:w-[150px] md:h-[150px] select-none">
//                     <img
//                       src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(booking.qr_payload || (typeof window !== "undefined" ? `${window.location.origin}/qr-verify/${booking.booking_id || booking.id}` : ""))}`}
//                       alt="Ticket QR Code"
//                       className="w-[45px] h-[45px] md:w-[110px] md:h-[110px] object-contain"
//                     />
//                     <p
//                       className="text-[7px] md:text-[10px] font-extrabold text-black uppercase tracking-widest text-center mt-0.5 md:mt-2.5"
//                       style={{ fontFamily: "Anek Latin" }}
//                     >
//                       Scan to Verify
//                     </p>
//                   </div>
//                 )}
//             </div>

//             {/* Turf Image */}
//             {booking.type === "play" &&
//               (booking.event_image_url ||
//                 booking.venue_image_url ||
//                 booking.play_image ||
//                 booking.image_url) && (
//                 <div className="w-full h-[140px] md:h-[250px] rounded-[12px] md:rounded-[15px] overflow-hidden">
//                   <img
//                     src={
//                       booking.event_image_url ||
//                       booking.venue_image_url ||
//                       booking.play_image ||
//                       booking.image_url
//                     }
//                     alt="Turf"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               )}

//             {/* Booking Details Grid */}
//             <div className="flex flex-col md:flex-row justify-between items-stretch gap-0 !mt-3 md:!mt-4">
//               <div className="flex-grow space-y-3 md:space-y-4">
//                 {/* Date & Time */}
//                 <div className="space-y-0.5 md:space-y-1 mt-[-60px]">
//                   <p className="text-[13px] md:text-[17px] font-medium text-[#686868] leading-none">
//                     Date & Time
//                   </p>
//                   <p className="text-[15px] md:text-[20px] font-medium text-black uppercase">
//                     {displayDateTime}
//                   </p>
//                 </div>

//                 <div className="h-[0.5px] bg-[#686868] w-full" />

//                 {/* Play duration / Capacity */}
//                 <div className="space-y-0.5 md:space-y-1">
//                   <p className="text-[13px] md:text-[17px] font-medium text-[#686868] leading-none">
//                     {booking.type === "play"
//                       ? "Play duration"
//                       : booking.type === "dining"
//                         ? "Guests"
//                         : "Quantity"}
//                   </p>
//                   <p className="text-[15px] md:text-[20px] font-medium text-black uppercase">
//                     {displayQuantity}
//                   </p>
//                 </div>

//                 <div className="h-[0.5px] bg-[#686868] w-full" />

//                 {/* Location */}
//                 <div className="space-y-0.5 md:space-y-1 relative pr-10 md:pr-12">
//                   <p className="text-[13px] md:text-[17px] font-medium text-[#686868] leading-none">
//                     Location
//                   </p>
//                   <p className="text-[14px] md:text-[20px] font-medium text-black uppercase leading-tight">
//                     {displayLocation}
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() =>
//                       booking.google_map_link &&
//                       window.open(booking.google_map_link, "_blank")
//                     }
//                     className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
//                     disabled={!booking.google_map_link}
//                   >
//                     <img
//                       src="/events/directions.svg"
//                       alt="Directions"
//                       className="w-6 h-6 md:w-8 md:h-8"
//                     />
//                   </button>
//                 </div>

//                 <div className="h-[0.5px] bg-[#686868] w-full" />

//                 {/* Offer */}
//                 <div className="space-y-0.5 md:space-y-1">
//                   <p className="text-[13px] md:text-[17px] font-medium text-[#686868] leading-none">
//                     Discount
//                   </p>
//                   <p className="text-[13px] md:text-[20px] font-medium text-black uppercase leading-tight">
//                     {booking.ticpass_applied
//                       ? `Ticpass Applied - ₹${booking.discount_amount} off`
//                       : booking.offer_id
//                         ? `Offer Applied - ₹${booking.discount_amount} off`
//                         : booking.coupon_code
//                           ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off`
//                           : booking.grand_total === 0
//                             ? "Total Free"
//                             : booking.discount_amount > 0
//                               ? `₹${booking.discount_amount} Savings`
//                               : "No offer applied"}
//                   </p>
//                 </div>

//                 {/* Cancel Link */}
//                 <div className="pt-1 md:pt-2">
//                   {!isCancelled && !isExpired && (
//                     <button
//                       onClick={openCancelModal}
//                       className="text-[16px] md:text-[22px] font-semibold text-[#ED4D1B] border-b-2 border-dotted border-[#ED4D1B] leading-none"
//                     >
//                       Cancel booking
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Order Details Section */}
//         <div className="space-y-4 md:space-y-6">
//           <h2 className="text-[18px] md:text-[25px] font-semibold text-black px-1">
//             Order details
//           </h2>

//           <div className="bg-white border-[0.5px] border-[#686868] rounded-[20px] md:rounded-[25px] p-4 md:p-8">
//             <div className="flex items-center justify-between gap-3">
//               <div className="flex items-center gap-3 md:gap-5 min-w-0">
//                 <div className="w-[34px] h-[34px] md:w-[44px] md:h-[44px] flex items-center justify-center text-black shrink-0">
//                   <img
//                     src="/events/invoice.svg"
//                     alt="Invoice"
//                     className="w-[24px] h-[24px] md:w-[32px] md:h-[32px]"
//                   />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-[18px] md:text-[22px] font-regular text-black leading-tight truncate">
//                     Total bill <span className="text-[18px] md:text-[22px] font-medium">{displayBillValue}</span>
//                   </p>
//                   <p className="text-[12px] md:text-[16px] font-regular text-[#686868] leading-tight">
//                     Incl. taxes & fees
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsBillDetailsOpen(true)}
//                 className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors shrink-0"
//                 title="View bill details"
//               >
//                 <svg
//                   width="6"
//                   height="12"
//                   viewBox="0 0 6 12"
//                   fill="none"
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="scale-125 md:scale-150"
//                 >
//                   <path
//                     d="M0.198787 1.35999L4.29333 6L0.198787 10.64C0.0697912 10.7914 -0.00158669 10.9941 2.67796e-05 11.2045C0.00164025 11.4149 0.0761159 11.6162 0.207413 11.765C0.338711 11.9137 0.516325 11.9981 0.702 12C0.887676 12.0018 1.06656 11.9209 1.20012 11.7747L5.7932 6.56977C5.85934 6.49513 5.9117 6.4063 5.9472 6.30847C5.98271 6.21064 6.00065 6.10578 5.99998 6C6.00045 5.89426 5.98242 5.78946 5.94693 5.69166C5.91143 5.59386 5.85918 5.505 5.7932 5.43023L1.20012 0.225268C1.06656 0.0790882 0.887676 -0.00179862 0.702 3.05259e-05C0.516325 0.00185872 0.338711 0.0862551 0.207413 0.235044C0.076116 0.383832 0.00164038 0.585107 2.69037e-05 0.795518C-0.00158657 1.00593 0.0697913 1.20864 0.198787 1.35999Z"
//                     fill="black"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <div className="h-[0.5px] bg-[#686868] w-full my-4 md:my-6" />

//             <div className="flex items-center gap-3 md:gap-5">
//               {profilePhoto ? (
//                 <div className="w-[34px] h-[34px] md:w-[44px] md:h-[44px] flex items-center justify-center bg-white rounded-full border border-[#686868] overflow-hidden shrink-0">
//                   <Image
//                     src={profilePhoto}
//                     alt="Profile"
//                     width={44}
//                     height={44}
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//               ) : (
//                 <div className="w-[34px] h-[34px] md:w-[44px] md:h-[44px] flex items-center justify-center shrink-0">
//                   <img
//                     src="/events/Group.svg"
//                     alt="User"
//                     className="w-[24px] h-[24px] md:w-[32px] md:h-[32px]"
//                   />
//                 </div>
//               )}
//               <div className="min-w-0">
//                 <p className="text-[16px] md:text-[20px] font-medium text-black uppercase leading-tight truncate">
//                   {displayUserName}
//                 </p>
//                 <p className="text-[14px] md:text-[18px] font-medium text-[#686868] leading-tight truncate">
//                   {displayUserPhone}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="px-1 space-y-1">
//             <p className="text-[12px] md:text-[17px] font-medium text-[#686868]">
//               Booking ID:{" "}
//               {booking.booking_id || booking.id?.slice(-8).toUpperCase()}
//             </p>
//             <p className="text-[12px] md:text-[17px] font-medium text-[#686868]">
//               Booking date: {displayBookingDate}
//             </p>
//           </div>
//         </div>

//         {/* Terms & Conditions Box */}
//         <div className="bg-[#E1E1E1] rounded-[20px] md:rounded-[25px] p-4 md:p-10">
//           <h2 className="text-[18px] md:text-[25px] font-semibold text-black mb-3 md:mb-4">
//             Terms & Conditions
//           </h2>
//           <ul className="space-y-1.5 md:space-y-2 text-[#686868] text-[13px] md:text-[16px]">
//             <li>• Please arrive 10 minutes before the scheduled time.</li>
//             <li>• Carry a valid ID proof for verification at the venue.</li>
//             <li>• Cancellation policies apply as per the vendor's terms.</li>
//             <li>• Tickets are non-transferable unless specified otherwise.</li>
//           </ul>
//         </div>

//         {/* Chat with Support Box */}
//         <Link
//           href="/chat-support"
//           className="bg-white border-[0.5px] border-[#686868] rounded-[16px] md:rounded-[20px] p-3 md:p-8 flex items-center gap-3 md:gap-6 cursor-pointer hover:bg-zinc-50 transition-colors mb-0"
//         >
//           <div className="w-[30px] h-[30px] md:w-[56px] md:h-[56px] flex items-center justify-center rounded-full text-white shrink-0">
//             <img src="/events/chat.svg" alt="chat" className="md:w-44 md:h-44" />
//           </div>
//           <h3 className="text-[14px] md:text-[25px] font-semibold text-black">
//             Chat with support
//           </h3>
//         </Link>
//       </main>

//       {/* HIDDEN PREMIUM TICKET FOR PDF DOWNLOAD */}
//       <div className="opacity-0 pointer-events-none absolute -left-[9999px]">
//         <div
//           ref={ticketRef}
//           id="hidden-ticket-capture"
//           style={{
//             width: "595px",
//             height: "842px",
//             background: "#f5f5f5",
//             padding: "0",
//             fontFamily: "Anek Latin, Arial, sans-serif",
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "flex-end",
//           }}
//         >
//           {/* Gray Container */}
//           <div
//             style={{
//               width: "500px",
//               background: "#EBEBEB",
//               borderRadius: "15px",
//               border: "1px solid #ffffff",
//               overflow: "hidden",
//               marginRight: "0",
//               marginTop: "20px",
//               marginBottom: "0",
//             }}
//           >
//             {/* Yellow Header */}
//             <div style={{ background: "#E7C200", padding: "8px 16px" }}>
//               <span
//                 style={{
//                   color: "#000000",
//                   fontWeight: 900,
//                   fontSize: "14px",
//                   letterSpacing: "1px",
//                 }}
//               >
//                 TICPIN
//               </span>
//             </div>

//             {/* Gray Content Body */}
//             <div style={{ padding: "16px" }}>
//               {/* Heading */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   marginBottom: "6px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "20px",
//                     fontWeight: 600,
//                     color: "#000000",
//                   }}
//                 >
//                   Play booking confirmed
//                 </span>
//                 <span
//                   style={{
//                     display: "inline-block",
//                     width: "18px",
//                     height: "18px",
//                     background: "#0AC655",
//                     borderRadius: "50%",
//                     color: "#fff",
//                     textAlign: "center",
//                     lineHeight: "18px",
//                     fontSize: "12px",
//                     marginLeft: "8px",
//                   }}
//                 >
//                   ✓
//                 </span>
//               </div>

//               <p
//                 style={{
//                   margin: "0 0 12px 0",
//                   fontSize: "12px",
//                   fontWeight: 500,
//                   color: "#686868",
//                   lineHeight: "16px",
//                 }}
//               >
//                 Booking Date: {displayDate}, {displayTime}
//               </p>

//               {/* Play Card Box */}
//               <div
//                 style={{
//                   background: "#ffffff",
//                   borderRadius: "10px",
//                   marginBottom: "12px",
//                   padding: "10px",
//                   display: "flex",
//                   gap: "10px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "120px",
//                     height: "68px",
//                     borderRadius: "6px",
//                     overflow: "hidden",
//                     flexShrink: 0,
//                   }}
//                 >
//                   {booking.event_image_url ||
//                     booking.venue_image_url ||
//                     booking.play_image ||
//                     booking.image_url ? (
//                     <img
//                       src={
//                         booking.event_image_url ||
//                         booking.venue_image_url ||
//                         booking.play_image ||
//                         booking.image_url
//                       }
//                       alt=""
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         objectFit: "cover",
//                       }}
//                     />
//                   ) : (
//                     <div
//                       style={{
//                         width: "100%",
//                         height: "100%",
//                         backgroundColor: "#FFEF9A",
//                       }}
//                     ></div>
//                   )}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <p
//                     style={{
//                       margin: "0 0 6px 0",
//                       fontWeight: 600,
//                       fontSize: "14px",
//                       color: "#000000",
//                       lineHeight: "18px",
//                     }}
//                   >
//                     {displayName}
//                   </p>
//                   <p
//                     style={{
//                       margin: 0,
//                       fontSize: "12px",
//                       fontWeight: 500,
//                       color: "#686868",
//                       lineHeight: "16px",
//                     }}
//                   >
//                     {displayLocation}
//                   </p>
//                 </div>
//               </div>

//               {/* Details Card Box */}
//               <div
//                 style={{
//                   background: "#ffffff",
//                   borderRadius: "10px",
//                   marginBottom: "12px",
//                   padding: "14px",
//                 }}
//               >
//                 <p
//                   style={{
//                     margin: "0 0 2px 0",
//                     fontSize: "11px",
//                     fontWeight: 500,
//                     color: "#686868",
//                     lineHeight: "14px",
//                   }}
//                 >
//                   Booking ID
//                 </p>
//                 <p
//                   style={{
//                     margin: "0 0 8px 0",
//                     fontSize: "13px",
//                     fontWeight: 500,
//                     color: "#000000",
//                     lineHeight: "16px",
//                   }}
//                 >
//                   {booking.booking_id || booking.id?.slice(-8).toUpperCase()}
//                 </p>

//                 <div
//                   style={{
//                     borderTop: "1px solid #D9D9D9",
//                     margin: "8px 0 12px 0",
//                   }}
//                 ></div>

//                 <p
//                   style={{
//                     margin: "0 0 2px 0",
//                     fontSize: "11px",
//                     fontWeight: 500,
//                     color: "#686868",
//                     lineHeight: "14px",
//                   }}
//                 >
//                   Date & Time
//                 </p>
//                 <p
//                   style={{
//                     margin: "0 0 8px 0",
//                     fontSize: "13px",
//                     fontWeight: 500,
//                     color: "#000000",
//                     lineHeight: "16px",
//                   }}
//                 >
//                   {displayDateTime}
//                 </p>

//                 <p
//                   style={{
//                     margin: "0 0 2px 0",
//                     fontSize: "11px",
//                     fontWeight: 500,
//                     color: "#686868",
//                     lineHeight: "14px",
//                   }}
//                 >
//                   Play duration
//                 </p>
//                 <p
//                   style={{
//                     margin: "0 0 8px 0",
//                     fontSize: "13px",
//                     fontWeight: 500,
//                     color: "#000000",
//                     lineHeight: "16px",
//                   }}
//                 >
//                   {displayQuantity}
//                 </p>

//                 <p
//                   style={{
//                     margin: "0 0 2px 0",
//                     fontSize: "11px",
//                     fontWeight: 500,
//                     color: "#686868",
//                     lineHeight: "14px",
//                   }}
//                 >
//                   Location
//                 </p>
//                 <p
//                   style={{
//                     margin: 0,
//                     fontSize: "13px",
//                     fontWeight: 500,
//                     color: "#000000",
//                     lineHeight: "16px",
//                   }}
//                 >
//                   {displayLocation}
//                 </p>

//                 {(booking.ticpass_applied ||
//                   booking.offer_id ||
//                   booking.coupon_code) && (
//                     <>
//                       <div
//                         style={{
//                           borderTop: "1px solid #D9D9D9",
//                           margin: "8px 0 12px 0",
//                         }}
//                       ></div>
//                       <p
//                         style={{
//                           margin: "0 0 2px 0",
//                           fontSize: "11px",
//                           fontWeight: 500,
//                           color: "#686868",
//                           lineHeight: "14px",
//                         }}
//                       >
//                         Discount
//                       </p>
//                       <p
//                         style={{
//                           margin: 0,
//                           fontSize: "13px",
//                           fontWeight: 500,
//                           color: "#000000",
//                           lineHeight: "16px",
//                         }}
//                       >
//                         {booking.ticpass_applied
//                           ? `Ticpass Applied - ₹${booking.discount_amount} off`
//                           : booking.offer_id
//                             ? `Offer Applied - ₹${booking.discount_amount} off`
//                             : booking.coupon_code
//                               ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off`
//                               : booking.grand_total === 0
//                                 ? "Total Free"
//                                 : ""}
//                       </p>
//                     </>
//                   )}
//               </div>

//               <p
//                 style={{
//                   fontSize: "11px",
//                   fontWeight: 500,
//                   color: "#686868",
//                   margin: "12px 0 12px 0",
//                   lineHeight: "14px",
//                 }}
//               >
//                 To access your booking, please sign in to your{" "}
//                 <span style={{ color: "#5331EA", fontWeight: 600 }}>
//                   Ticpin
//                 </span>{" "}
//                 account with {booking.user_phone}
//               </p>

//               <p
//                 style={{
//                   fontWeight: 600,
//                   fontSize: "14px",
//                   color: "#000000",
//                   marginBottom: "8px",
//                   lineHeight: "18px",
//                 }}
//               >
//                 Notes
//               </p>

//               {/* Notes Box */}
//               <div
//                 style={{
//                   background: "#ffffff",
//                   borderRadius: "10px",
//                   padding: "12px",
//                 }}
//               >
//                 <div style={{ display: "flex", marginBottom: "8px" }}>
//                   <div style={{ width: "18px", paddingTop: "2px" }}>
//                     <div
//                       style={{
//                         width: "6px",
//                         height: "6px",
//                         border: "2px solid #E7C200",
//                         boxSizing: "border-box",
//                         transform: "rotate(-45deg)",
//                       }}
//                     ></div>
//                   </div>
//                   <p
//                     style={{
//                       fontSize: "11px",
//                       fontWeight: 500,
//                       color: "#686868",
//                       lineHeight: "14px",
//                       margin: 0,
//                     }}
//                   >
//                     Please arrive 10 minutes before the scheduled time for your
//                     slot booking.
//                   </p>
//                 </div>
//                 <div style={{ display: "flex", marginBottom: "8px" }}>
//                   <div style={{ width: "18px", paddingTop: "2px" }}>
//                     <div
//                       style={{
//                         width: "6px",
//                         height: "6px",
//                         border: "2px solid #E7C200",
//                         boxSizing: "border-box",
//                         transform: "rotate(-45deg)",
//                       }}
//                     ></div>
//                   </div>
//                   <p
//                     style={{
//                       fontSize: "11px",
//                       fontWeight: 500,
//                       color: "#686868",
//                       lineHeight: "14px",
//                       margin: 0,
//                     }}
//                   >
//                     Your booking time is strictly reserved, late arrivals may
//                     result in reduced playtime.
//                   </p>
//                 </div>
//                 <div style={{ display: "flex", marginBottom: "8px" }}>
//                   <div style={{ width: "18px", paddingTop: "2px" }}>
//                     <div
//                       style={{
//                         width: "6px",
//                         height: "6px",
//                         border: "2px solid #E7C200",
//                         boxSizing: "border-box",
//                         transform: "rotate(-45deg)",
//                       }}
//                     ></div>
//                   </div>
//                   <p
//                     style={{
//                       fontSize: "11px",
//                       fontWeight: 500,
//                       color: "#686868",
//                       lineHeight: "14px",
//                       margin: 0,
//                     }}
//                   >
//                     Ensure you vacate the turf on or before your end time to
//                     avoid inconvenience to the next booking
//                   </p>
//                 </div>
//                 <p
//                   style={{
//                     margin: "12px 0 0 0",
//                     fontSize: "10px",
//                     fontWeight: 500,
//                     color: "#686868",
//                     lineHeight: "14px",
//                   }}
//                 >
//                   See you there!
//                   <br />
//                   Team{" "}
//                   <span style={{ color: "#5331EA", fontWeight: 600 }}>
//                     Ticpin
//                   </span>
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bill Details Popup */}
//       {isBillDetailsOpen && (
//         <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/30 backdrop-blur-sm"
//             onClick={() => setIsBillDetailsOpen(false)}
//           />
//           <div className="relative w-full max-w-[420px] bg-white rounded-[20px] border border-[#AEAEAE] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
//               <h3 className="text-[18px] md:text-[22px] font-semibold text-black">
//                 Bill details
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setIsBillDetailsOpen(false)}
//                 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
//               >
//                 <X size={18} className="text-black" />
//               </button>
//             </div>

//             <div className="p-5 space-y-5">
//               <div className="space-y-3">

//                 <div className="flex justify-between text-[15px] text-black">
//                   <span>Booking fee</span>
//                   <span>₹{bookingFeeValue.toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="pl-3 space-y-1 border-l-2 border-[#E5E5E5]">
//                   <div className="flex justify-between text-[13px] text-[#686868]">
//                     <span>Base platform fee</span>
//                     <span>₹{basePlatformFee.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-[13px] text-[#686868]">
//                     <span>GST (18%)</span>
//                     <span>₹{gstOnFee.toFixed(2)}</span>
//                   </div>
//                 </div>
//                 {discountValue > 0 && (
//                   <div className="flex justify-between text-[15px] text-[#16a34a]">
//                     <span>Discount</span>
//                     <span>-₹{discountValue.toLocaleString("en-IN")}</span>
//                   </div>
//                 )}
//                 {donationValue > 0 && (
//                   <div className="flex justify-between text-[15px] text-black">
//                     <span>Donation</span>
//                     <span>₹{donationValue.toLocaleString("en-IN")}</span>
//                   </div>
//                 )}
//                 <div className="h-[0.5px] bg-[#D9D9D9]" />
//                 <div className="flex justify-between text-[16px] font-semibold text-black">
//                   <span>Total bill</span>
//                   <span>{displayBillValue}</span>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <h4 className="text-[15px] font-semibold text-black">
//                   Booking details
//                 </h4>
//                 <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Booking ID</span>
//                     <span className="text-black text-right">
//                       {booking.booking_id ||
//                         booking.id?.slice(-8).toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Event / Venue</span>
//                     <span className="text-black text-right">{displayName}</span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Date & Time</span>
//                     <span className="text-black text-right">
//                       {displayDateTime}
//                     </span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Quantity</span>
//                     <span className="text-black text-right">
//                       {displayQuantity}
//                     </span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Location</span>
//                     <span className="text-black text-right">
//                       {displayLocation}
//                     </span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Payment method</span>
//                     <span className="text-black text-right uppercase">
//                       {booking.payment_method ||
//                         booking.payment_gateway ||
//                         "N/A"}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <h4 className="text-[15px] font-semibold text-black">
//                   Booked by
//                 </h4>
//                 <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Name</span>
//                     <span className="text-black text-right">
//                       {displayUserName}
//                     </span>
//                   </div>
//                   <div className="flex justify-between gap-4">
//                     <span className="text-[#686868]">Phone</span>
//                     <span className="text-black text-right">
//                       {displayUserPhone}
//                     </span>
//                   </div>
//                   {booking.user_email && (
//                     <div className="flex justify-between gap-4">
//                       <span className="text-[#686868]">Email</span>
//                       <span className="text-black text-right break-all">
//                         {booking.user_email}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cancellation Modal Overlay */}
//       {isCancelModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           {/* Backdrop with Blur */}
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
//             onClick={() => !cancelling && setIsCancelModalOpen(false)}
//           />

//           {/* Modal Content Wrapper */}
//           <div
//             className={`relative animate-in zoom-in-95 duration-500 w-[95vw] md:w-auto ${cancelStep === "donation" ? "max-w-[480px] md:max-w-[850px]" : "max-w-[380px] md:max-w-[700px]"}`}
//           >
//             <div className="relative w-full bg-white rounded-[20px] md:rounded-[26px] border border-[#AEAEAE] overflow-hidden max-h-[85vh] md:max-h-none overflow-y-auto">
//               {cancelStep === "reason" ? (
//                 <>
//                   {/* Modal Header (Step 1) */}
//                   <div className="flex items-center justify-between p-4 md:p-8 border-b-[0.5px] border-[#AEAEAE]">
//                     <h2 className="text-[18px] md:text-[24px] font-semibold text-black">
//                       Booking cancellation request
//                     </h2>
//                     <button
//                       onClick={() => setIsCancelModalOpen(false)}
//                       className="text-black hover:opacity-70"
//                     >
//                       <X size={20} className="md:hidden" />
//                       <X
//                         size={28}
//                         strokeWidth={2.5}
//                         className="hidden md:block"
//                       />
//                     </button>
//                   </div>

//                   {/* Modal Body (Step 1) */}
//                   <div className="p-4 md:p-10 space-y-4 md:space-y-8">
//                     <div className="space-y-3 md:space-y-4">
//                       <p className="text-[13px] md:text-[17px] font-medium text-[#686868]">
//                         Select your reason here
//                       </p>

//                       <div className="flex flex-wrap gap-2 md:gap-4">
//                         {reasons.map((reason) => (
//                           <button
//                             key={reason}
//                             onClick={() => setSelectedReason(reason)}
//                             className={`px-4 py-1.5 md:px-6 md:py-2 rounded-[20px] md:rounded-[25px] border text-[13px] md:text-[17px] font-medium transition-all ${selectedReason === reason
//                               ? "bg-black text-white border-black"
//                               : "bg-white text-black border-[#AEAEAE] hover:border-black"
//                               }`}
//                           >
//                             {reason}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     <div className="h-[0.5px] border-t border-[#AEAEAE] border-dashed w-full" />

//                     <button
//                       onClick={handleCancelSubmit}
//                       disabled={!selectedReason || cancelling}
//                       className={`w-full h-[42px] md:h-[51px] rounded-[12px] md:rounded-[15px] text-[16px] md:text-[23px] font-semibold transition-all flex items-center justify-center ${selectedReason && !cancelling
//                         ? "bg-black text-white"
//                         : "bg-[#AEAEAE] text-white/70 cursor-not-allowed"
//                         }`}
//                     >
//                       {cancelling ? "Submitting..." : "Submit"}
//                     </button>
//                   </div>
//                 </>
//               ) : cancelStep === "donation" ? (
//                 <>
//                   {/* Modal Header (Step 2) */}
//                   <div className="flex items-center justify-between p-4 md:p-8">
//                     <h2 className="text-[18px] md:text-[25px] font-semibold text-black">
//                       Booking cancellation confirmed
//                     </h2>
//                     <button
//                       onClick={() => {
//                         setIsCancelModalOpen(false);
//                         setCancelStep("reason");
//                       }}
//                       className="text-black hover:opacity-70"
//                     >
//                       <X size={20} className="md:hidden" />
//                       <X
//                         size={28}
//                         strokeWidth={2.5}
//                         className="hidden md:block"
//                       />
//                     </button>
//                   </div>

//                   {/* Divider */}
//                   <div className="h-[0.5px] border-t border-[#686868] border-dashed w-full" />

//                   {/* Modal Body (Step 2) */}
//                   <div className="p-4 md:p-8 space-y-4 md:space-y-8">
//                     <p className="text-[13px] md:text-[17px] font-medium text-[#686868]">
//                       Would you like to support a cause with your refund?
//                     </p>

//                     {/* Options Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
//                       {/* Option 1: Full Refund */}
//                       <div
//                         onClick={() => {
//                           setDonationChoice("full_refund");
//                           setSplitAmount("");
//                         }}
//                         className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "full_refund"
//                           ? "border-[#2F834E] bg-[#2F834E]/5"
//                           : "border-[#AEAEAE] hover:border-[#2F834E]/50"
//                           }`}
//                       >
//                         <div className="absolute top-2 md:top-4 left-2 md:left-4">
//                           <div
//                             className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "full_refund"
//                               ? "bg-[#2F834E] border-[#2F834E]"
//                               : "border-[#2F834E]"
//                               }`}
//                           >
//                             {donationChoice === "full_refund" && (
//                               <CheckCircle
//                                 size={10}
//                                 className="text-white md:hidden"
//                               />
//                             )}
//                             {donationChoice === "full_refund" && (
//                               <CheckCircle
//                                 size={14}
//                                 className="text-white hidden md:block"
//                               />
//                             )}
//                           </div>
//                         </div>

//                         <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#65B54E]/20 rounded-full flex items-center justify-center mb-2 md:mb-4">
//                           <img
//                             src="/cancel popup/Vector.svg"
//                             alt="Wallet"
//                             className="w-[22px] h-[22px] md:w-[35px] md:h-[35px]"
//                           />
//                         </div>

//                         <h3 className="text-[13px] md:text-[17px] font-medium text-black">
//                           Get full refund
//                         </h3>
//                         <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
//                           Refund ₹{bookingTotal.toLocaleString("en-IN")} will be
//                           sent to your original payment method.
//                         </p>

//                         <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
//                           <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">
//                             You get
//                           </p>
//                           <p className="text-[14px] md:text-[17px] font-semibold text-[#2F834E]">
//                             ₹{bookingTotal.toLocaleString("en-IN")}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Option 2: Donate All */}
//                       <div
//                         onClick={() => {
//                           setDonationChoice("full_donate");
//                           setSplitAmount("");
//                         }}
//                         className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "full_donate"
//                           ? "border-[#DB5244] bg-[#DB5244]/5"
//                           : "border-[#AEAEAE] hover:border-[#DB5244]/50"
//                           }`}
//                       >
//                         <div className="absolute top-2 md:top-4 left-2 md:left-4">
//                           <div
//                             className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "full_donate"
//                               ? "bg-[#DB5244] border-[#DB5244]"
//                               : "border-[#DB5244]"
//                               }`}
//                           >
//                             {donationChoice === "full_donate" && (
//                               <CheckCircle
//                                 size={10}
//                                 className="text-white md:hidden"
//                               />
//                             )}
//                             {donationChoice === "full_donate" && (
//                               <CheckCircle
//                                 size={14}
//                                 className="text-white hidden md:block"
//                               />
//                             )}
//                           </div>
//                         </div>

//                         <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#ED4D1B]/25 rounded-full flex items-center justify-center mb-2 md:mb-4">
//                           <img
//                             src="/cancel popup/Donate 1.svg"
//                             alt="Donate"
//                             className="w-[22px] h-[18px] md:w-[35px] md:h-[29px]"
//                           />
//                         </div>

//                         <h3 className="text-[13px] md:text-[17px] font-medium text-black">
//                           Donate my refund
//                         </h3>
//                         <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
//                           Donate ₹{bookingTotal.toLocaleString("en-IN")} to
//                           support verified NGOs and create impact
//                         </p>

//                         <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
//                           <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">
//                             You donate
//                           </p>
//                           <p className="text-[14px] md:text-[17px] font-semibold text-[#DB5244]">
//                             ₹{bookingTotal.toLocaleString("en-IN")}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Option 3: Split */}
//                       <div
//                         onClick={() => setDonationChoice("split")}
//                         className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "split"
//                           ? "border-[#5331EA] bg-[#5331EA]/5"
//                           : "border-[#AEAEAE] hover:border-[#5331EA]/50"
//                           }`}
//                       >
//                         <div className="absolute top-2 md:top-4 left-2 md:left-4">
//                           <div
//                             className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "split"
//                               ? "bg-[#5331EA] border-[#5331EA]"
//                               : "border-[#5331EA]"
//                               }`}
//                           >
//                             {donationChoice === "split" && (
//                               <CheckCircle
//                                 size={10}
//                                 className="text-white md:hidden"
//                               />
//                             )}
//                             {donationChoice === "split" && (
//                               <CheckCircle
//                                 size={14}
//                                 className="text-white hidden md:block"
//                               />
//                             )}
//                           </div>
//                         </div>

//                         <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#5331EA]/20 rounded-full flex items-center justify-center mb-2 md:mb-4 shrink-0">
//                           <img
//                             src="/cancel popup/Heart Handshake 1.svg"
//                             alt="Split"
//                             className="w-[22px] h-[21px] md:w-[35px] md:h-[33px]"
//                           />
//                         </div>

//                         <h3 className="text-[13px] md:text-[17px] font-medium text-black leading-tight mb-0.5 md:mb-1">
//                           Split refund & donation
//                         </h3>
//                         <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-0.5 md:mt-1 max-w-[145px] leading-tight">
//                           Choose how much you want to donate and get the rest as
//                           refund.
//                         </p>

//                         <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
//                           <p className="text-[9px] md:text-[9px] font-medium text-[#686868] mb-0.5 md:mb-1">
//                             You get / You donate
//                           </p>
//                           <button className="text-[13px] md:text-[15px] font-medium text-[#5331EA] hover:underline flex items-center justify-center gap-1 mx-auto">
//                             Choose amount
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Split Amount Input Section */}
//                     {donationChoice === "split" && (
//                       <div className="mt-3 md:mt-4 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
//                         <label className="text-[12px] md:text-[14px] font-medium text-[#686868] mb-1.5 md:mb-2">
//                           Enter refund amount (Max ₹{bookingTotal})
//                         </label>
//                         <div className="relative w-[260px] md:w-[300px]">
//                           <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black font-semibold text-[14px] md:text-[16px]">
//                             ₹
//                           </span>
//                           <input
//                             type="number"
//                             min="0"
//                             max={bookingTotal}
//                             step="1"
//                             value={splitAmount}
//                             onChange={(e) => setSplitAmount(e.target.value)}
//                             placeholder={`${bookingTotal}`}
//                             className="w-full border-2 border-[#AEAEAE] rounded-[10px] md:rounded-[12px] pl-7 md:pl-8 pr-3 md:pr-4 py-1.5 md:py-2 text-[14px] md:text-[16px] font-semibold text-black focus:outline-none focus:border-black transition-colors"
//                           />
//                         </div>
//                         {splitAmount !== "" &&
//                           !isNaN(parseFloat(splitAmount)) && (
//                             <p className="text-[11px] md:text-[13px] font-medium text-black mt-1.5 md:mt-2 bg-zinc-100 px-3 md:px-4 py-1 md:py-1.5 rounded-full">
//                               Refund: ₹
//                               {Math.max(
//                                 0,
//                                 parseFloat(splitAmount) || 0,
//                               ).toLocaleString("en-IN")}
//                               <span className="mx-1 md:mx-2 text-[#AEAEAE]">
//                                 |
//                               </span>
//                               Donation:{" "}
//                               <span className="text-[#ED4D1B]">
//                                 ₹
//                                 {Math.max(
//                                   0,
//                                   bookingTotal - (parseFloat(splitAmount) || 0),
//                                 ).toLocaleString("en-IN")}
//                               </span>
//                             </p>
//                           )}
//                       </div>
//                     )}

//                     {/* Security/Partners Section */}
//                     <div className="border border-[#AEAEAE] rounded-[12px] md:rounded-[15px] p-2.5 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
//                       <div className="flex items-center gap-2 md:gap-3">
//                         <img
//                           src="/cancel popup/FAV Icon New 1 1.svg"
//                           alt="Impact"
//                           className="w-[28px] h-[28px] md:w-[38px] md:h-[38px]"
//                         />
//                         <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-medium text-black">
//                           <img
//                             src="/cancel popup/lock.svg"
//                             alt="Secure"
//                             className="w-3.5 h-3.5 md:w-5 md:h-5"
//                           />
//                           <span className="hidden md:inline">
//                             100% secure donations • Verified NGO partners •
//                             Transparent impact
//                           </span>
//                           <span className="md:hidden">Secure donations</span>
//                         </div>
//                       </div>
//                       <Link
//                         href="#"
//                         className="text-[9px] md:text-[10px] font-medium text-[#5331EA] underline text-center"
//                       >
//                         Learn more about our donation program
//                       </Link>
//                     </div>

//                     {/* Submit Button */}
//                     <button
//                       onClick={handleCancelSubmit}
//                       disabled={
//                         !donationChoice ||
//                         cancelling ||
//                         (donationChoice === "split" && !splitAmount)
//                       }
//                       className={`w-full h-[40px] md:h-[51px] bg-black text-white rounded-[12px] md:rounded-[15px] text-[15px] md:text-[23px] font-semibold transition-all hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
//                     >
//                       {cancelling ? (
//                         <RefreshCw
//                           className="animate-spin md:hidden"
//                           size={18}
//                         />
//                       ) : (
//                         "Submit"
//                       )}
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   {/* Modal Header (Success Step) */}
//                   <div className="flex items-center justify-between p-6 md:p-8">
//                     <h2
//                       className="text-[24px] md:text-[26px] font-semibold text-black"
//                       style={{ fontFamily: "var(--font-anek-latin)" }}
//                     >
//                       Cancellation Request Successful
//                     </h2>
//                     <button
//                       onClick={() => {
//                         setIsCancelModalOpen(false);
//                         setCancelStep("reason");
//                       }}
//                       className="text-black hover:opacity-70 cursor-pointer"
//                     >
//                       <X size={28} strokeWidth={2.5} />
//                     </button>
//                   </div>

//                   {/* Divider */}
//                   <div className="h-[0.5px] border-t border-[#686868]/20 w-full" />

//                   {/* Modal Body (Success Step) */}
//                   <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
//                     {/* Elegant Refund Success Icon */}
//                     <div className="w-[76px] h-[76px] bg-[#EAFDF1] rounded-full flex items-center justify-center border border-[#65B54E]/30 shrink-0">
//                       <CheckCircle className="w-[44px] h-[44px] text-[#0AC655]" />
//                     </div>

//                     <div className="space-y-3 max-w-[480px]">
//                       <h3
//                         className="text-[22px] font-bold text-[#0AC655] uppercase tracking-wider"
//                         style={{
//                           fontFamily:
//                             "Anek Tamil Condensed, var(--font-anek-latin)",
//                         }}
//                       >
//                         Refund Initiated!
//                       </h3>
//                       <p
//                         className="text-[16px] text-[#686868] font-medium leading-relaxed"
//                         style={{ fontFamily: "var(--font-anek-latin)" }}
//                       >
//                         Once cancellation is done, the refund amount will be
//                         credited back to your original payment method within{" "}
//                         <span className="font-bold text-black text-[17px]">
//                           12-24 hours
//                         </span>
//                         .
//                       </p>
//                     </div>

//                     {/* Premium Styled Refund Summary Card */}
//                     <div
//                       className="w-full border-[0.5px] border-[#686868]/30 rounded-[20px] p-5 space-y-3.5 shadow-sm"
//                       style={{
//                         background:
//                           "radial-gradient(52.97% 102.98% at 0% -7.55%, #EAFDF1 0%, #FFFFFF 100%)",
//                       }}
//                     >
//                       <div
//                         className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
//                         style={{ fontFamily: "var(--font-anek-latin)" }}
//                       >
//                         <span>Total booking amount</span>
//                         <span className="text-black font-semibold">
//                           ₹{bookingTotal.toLocaleString("en-IN")}
//                         </span>
//                       </div>
//                       {donationChoice === "full_donate" ? (
//                         <div
//                           className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
//                           style={{ fontFamily: "var(--font-anek-latin)" }}
//                         >
//                           <span>Donation to NGO partner</span>
//                           <span className="text-[#DB5244] font-semibold">
//                             ₹{bookingTotal.toLocaleString("en-IN")}
//                           </span>
//                         </div>
//                       ) : donationChoice === "split" ? (
//                         <>
//                           <div
//                             className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
//                             style={{ fontFamily: "var(--font-anek-latin)" }}
//                           >
//                             <span>Donation to NGO partner</span>
//                             <span className="text-[#DB5244] font-semibold">
//                               ₹
//                               {(
//                                 bookingTotal - (parseFloat(splitAmount) || 0)
//                               ).toLocaleString("en-IN")}
//                             </span>
//                           </div>
//                           <div
//                             className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50"
//                             style={{ fontFamily: "var(--font-anek-latin)" }}
//                           >
//                             <span>Estimated Refund</span>
//                             <span>
//                               ₹
//                               {Math.max(
//                                 0,
//                                 parseFloat(splitAmount) || 0,
//                               ).toLocaleString("en-IN")}
//                             </span>
//                           </div>
//                         </>
//                       ) : (
//                         <div
//                           className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50"
//                           style={{ fontFamily: "var(--font-anek-latin)" }}
//                         >
//                           <span>Estimated Refund</span>
//                           <span>₹{bookingTotal.toLocaleString("en-IN")}</span>
//                         </div>
//                       )}
//                     </div>

//                     <button
//                       onClick={() => {
//                         setIsCancelModalOpen(false);
//                         setCancelStep("reason");
//                       }}
//                       className="w-full h-[48px] bg-black text-white rounded-[10px] text-[18px] font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center shadow-md shadow-black/10 cursor-pointer uppercase tracking-wider"
//                       style={{
//                         fontFamily:
//                           "Anek Tamil Condensed, var(--font-anek-latin)",
//                       }}
//                     >
//                       Done
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  MessageSquare,
  User,
  X,
  XCircle,
  Download,
  Check,
  MapPin,
  Navigation,
  RefreshCw,
  Ticket,
  PlayCircle,
  Utensils,
  ChevronLeft,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useUserSession } from "@/lib/auth/user";
import { bookingApi } from "@/lib/api/booking";
import { profileApi } from "@/lib/api/profile";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

function formatPrice(price: number): string {
  if (price % 1 === 0) {
    return price.toLocaleString('en-IN');
  }
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const session = useUserSession();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<
    "reason" | "donation" | "success"
  >("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [donationChoice, setDonationChoice] = useState<
    "full_refund" | "full_donate" | "split" | null
  >(null);
  const [splitAmount, setSplitAmount] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isBillDetailsOpen, setIsBillDetailsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        document.cookie = "device_view=mobile; path=/; max-age=31536000";
        const search = window.location.search || '';
        router.replace(`/myboooking/${bookingId}${search}`);
      } else {
        document.cookie = "device_view=desktop; path=/; max-age=31536000";
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [router, bookingId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedSession(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasCheckedSession) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [hasCheckedSession, session, router]);

  const reasons = [
    "Plan change",
    "Found a better offer elsewhere",
    "Booked by mistake",
    "Others",
  ];

  const bookingTotal = booking?.grand_total ?? booking?.order_amount ?? 0;

  const openCancelModal = () => {
    setCancelStep("reason");
    setSelectedReason(null);
    setDonationChoice(null);
    setSplitAmount("");
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedReason || !booking) return;
    setCancelling(true);

    const donationAmount = 0;

    try {
      await bookingApi.cancelBooking(
        booking.id,
        booking.type || "play",
        selectedReason,
        donationAmount,
      );
      // Refresh booking data
      const res = await fetch(
        `/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ""}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      setBooking(data);
      setCancelStep("success");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      fetch(
        `/backend/api/bookings/${bookingId}${session?.id ? `?user_id=${session.id}` : ""}`,
        {
          credentials: "include",
        },
      )
        .then((res) =>
          res.ok ? res.json() : Promise.reject("Failed to load booking"),
        )
        .then((data) => {
          console.log("Booking data from backend:", data);
          console.log("Booking fee value:", data.booking_fee);
          setBooking(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.toString());
          setLoading(false);
        });
    }
  }, [bookingId, session]);

  // Fetch profile photo for the logged‑in user
  useEffect(() => {
    if (session?.id) {
      profileApi
        .getProfile(session.id)
        .then((p) => {
          if (p?.profilePhoto) setProfilePhoto(p.profilePhoto);
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [session]);

  const handleDownloadBill = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#F5F5F5",
        width: 800,
        windowWidth: 800,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TICPIN_Ticket_${booking?.booking_id || bookingId}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !hasCheckedSession || !session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <XCircle size={60} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
        <p className="text-[#686868] mb-6">
          {error || "The requested booking details could not be loaded."}
        </p>
        <button
          onClick={() => router.push("/bookings")}
          className="px-8 py-3 bg-black text-white rounded-xl"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const isCancelled =
    booking.status === "cancelled" || booking.status === "refunded";
  const isRefunded = booking.status === "refunded";

  const formatDisplayDate = (value?: string, fallback?: string) => {
    const raw = value || fallback;
    if (!raw) return "Date TBA";
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatBookingDate = (value?: string, fallback?: string) => {
    const raw = value || fallback;
    if (!raw) return "Date unavailable";
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (value?: string) => {
    const raw = (value || "").trim();
    if (!raw) return "TBA";

    const formatSingleTime = (part: string) => {
      const timePart = part.trim();
      if (!timePart) return "";
      const layouts = [/^(\d{1,2}):(\d{2})$/, /^(\d{1,2}):(\d{2}):(\d{2})$/];
      for (const layout of layouts) {
        const match = timePart.match(layout);
        if (match) {
          const hours = Number(match[1]);
          const minutes = Number(match[2]);
          if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date
              .toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase();
          }
        }
      }
      return timePart;
    };

    if (raw.includes("-")) {
      return raw.split("-").map(formatSingleTime).filter(Boolean).join(" - ");
    }

    return formatSingleTime(raw);
  };

  const displayName =
    booking.event_name || booking.venue_name || booking.play_name || "Booking";
  const displayLocation =
    booking.city ||
    booking.venue_address ||
    booking.event_location ||
    (booking.venue_name && booking.city
      ? `${booking.venue_name}, ${booking.city}`
      : "") ||
    booking.venue_name ||
    "Venue Location";
  const displayHeaderAddress =
    displayLocation.split(",")[0]?.trim() || displayLocation;
  const displayDate = formatDisplayDate(
    booking.event_date || booking.date,
    booking.booked_at,
  );
  const displayTime = formatDisplayTime(
    booking.event_time || booking.time || booking.time_slot,
  );
  const displayDateTime = `${displayDate} | ${displayTime}`;
  const displayUserName =
    booking.user_name && booking.user_name !== "User"
      ? booking.user_name
      : session?.name || "User";
  const displayUserPhone = booking.user_phone || session?.phone || "N/A";
  const displayBookingDate = formatBookingDate(
    booking.booked_at || booking.created_at,
    booking.date,
  );
  const displayTicketSummary =
    Array.isArray(booking.tickets) && booking.tickets.length > 0
      ? booking.tickets
        .map(
          (ticket: any) =>
            `${ticket.category || ticket.name || "Ticket"} - ${ticket.quantity || 1}`,
        )
        .join(", ")
      : "Ticket - 1";
  const displayQuantity =
    booking.type === "play"
      ? `${booking.duration ? booking.duration * 30 : "60"} mins`
      : booking.type === "dining"
        ? `${booking.guests} Guests`
        : displayTicketSummary;
  const displayBillValue =
    bookingTotal === 0
      ? "FREE"
      : `₹${formatPrice(Number(bookingTotal || 0))}`;
  const orderAmountValue = Number(booking.order_amount || 0);
  const bookingFeeValue = Number(booking.booking_fee || 0);
  const basePlatformFee = bookingFeeValue > 0 ? bookingFeeValue / 1.18 : 0;
  const gstOnFee = bookingFeeValue - basePlatformFee;
  const donationValue = Number(booking.donation_amount || 0);
  const discountValue = Number(booking.discount_amount || 0);
  //   const subtotalValue = Number(booking.order_amount || 0);

  // Check if booking date is expired
  const isExpired = booking.date
    ? new Date(booking.date).getTime() < new Date().setHours(0, 0, 0, 0)
    : false;

  return (
    <div
      className={`bg-white font-[family-name:var(--font-anek-latin)] relative pb-0 ${isCancelModalOpen ? "overflow-hidden" : ""}`}
    >
      <style>{`
        body {
          background-color: white !important;
        }
        /* Hide scrollbars globally on this page */
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      {/* Header */}
      <header className="h-14 w-full bg-white border-b border-[#D9D9D9] flex items-center px-3 md:h-16 md:px-10 md:lg:px-[37px] sticky top-0 z-50">
        <div className="flex items-center gap-3 md:gap-10">
          <button
            onClick={() => router.push("/bookings")}
            className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-[#D9D9D9] rounded-full hover:bg-zinc-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-black md:hidden" />
            <ChevronLeft size={22} className="text-black hidden md:block" />
          </button>

          <Link href="/">
            <img
              src="/ticpin-logo-black.png"
              alt="TICPIN"
              className="h-5 md:h-6 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {/* Divider Line */}
            <div className="w-[1.5px] h-8 bg-[#AEAEAE] mx-1" />

            <div className="flex items-center gap-6">
              {/* Venue Thumbnail */}
              <div className="w-[85px] h-[48px] bg-zinc-100 rounded-[10px] overflow-hidden flex items-center justify-center">
                {booking.event_image_url ||
                  booking.venue_image_url ||
                  booking.play_image ||
                  booking.image_url ? (
                  <img
                    src={
                      booking.event_image_url ||
                      booking.venue_image_url ||
                      booking.play_image ||
                      booking.image_url
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MapPin size={24} className="text-zinc-400" />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h2 className="text-[18px] font-medium text-black leading-tight uppercase tracking-tight">
                  {displayName}
                </h2>
                <p className="text-[15px] font-medium text-[#686868] leading-tight uppercase tracking-tight mt-0.5">
                  {booking.city || displayHeaderAddress}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[480px] md:max-w-[520px] mx-auto px-3 mt-3 md:mt-5 md:px-4 pb-4 mb-0 space-y-4">
        {/* Main Booking Card (Confirm/Cancel state) */}
        <div className="relative bg-white border-[0.5px] border-[#686868] rounded-[20px] md:rounded-[25px] overflow-hidden">
          {/* Gradient Background Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-100 transition-colors duration-500"
            style={{
              background: isCancelled
                ? "radial-gradient(52.97% 102.98% at 0% -7.55%, #FFD6D6 0%, #FFFFFF 100%)"
                : isExpired
                  ? "radial-gradient(52.97% 102.98% at 0% -7.55%, #FFE4CC 0%, #FFFFFF 100%)"
                  : "radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)",
            }}
          />

          <div className="relative pt-3 pb-4 px-4 md:pt-4 md:pb-6 md:px-6 space-y-3">
            <div className="flex flex-row items-start justify-between gap-4">
              <div className="flex-grow space-y-3">
                {/* Header text */}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] md:text-[26px] font-semibold text-black leading-tight">
                      {isRefunded
                        ? "Booking refunded"
                        : isCancelled
                          ? "Booking cancelled"
                          : isExpired
                            ? "Booking expired"
                            : "Booking confirmed"}
                    </h1>
                    <div className="w-5 h-5 md:w-8 md:h-8 flex-shrink-0">
                      {isCancelled ? (
                        <XCircle className="w-full h-full text-red-500" />
                      ) : isExpired ? (
                        <XCircle className="w-full h-full text-orange-500" />
                      ) : (
                        <img
                          src="/events/check-circle.svg"
                          alt="Booking Confirmed"
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] md:text-[14px] font-medium text-[#686868] mt-1 leading-tight">
                    {isRefunded
                      ? "Refund has been processed"
                      : isCancelled
                        ? "The refund if any will be processed soon"
                        : isExpired
                          ? "This booking has passed and is no longer active"
                          : "Reach the venue 10 mins before your slot"}
                  </p>
                </div>

                <div className="h-[0.5px] bg-[#686868] w-full" />

                {/* Date & Time */}
                <div className="space-y-0.5">
                  <p className="text-[12px] md:text-[14px] font-medium text-[#686868] leading-none">
                    Date & Time
                  </p>
                  <p className="text-[14px] md:text-[16px] font-medium text-black uppercase">
                    {displayDateTime}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              {(booking.type === "event" ||
                (booking.type !== "play" && booking.type !== "dining")) &&
                !isCancelled &&
                !isExpired &&
                !isRefunded && (
                  <div className="flex flex-col items-center justify-center p-1.5 md:p-2.5 bg-[#EBEBEB] border border-[#686868]/30 rounded-[10px] md:rounded-[12px] shrink-0 w-[70px] h-[70px] md:w-[120px] md:h-[120px] select-none">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(booking.qr_payload || (typeof window !== "undefined" ? `${window.location.origin}/qr-verify/${booking.booking_id || booking.id}` : ""))}`}
                      alt="Ticket QR Code"
                      className="w-[45px] h-[45px] md:w-[85px] md:h-[85px] object-contain"
                    />
                    <p
                      className="text-[6px] md:text-[8px] font-extrabold text-black uppercase tracking-widest text-center mt-0.5 md:mt-1.5"
                      style={{ fontFamily: "Anek Latin" }}
                    >
                      Scan to Verify
                    </p>
                  </div>
                )}
            </div>

            {/* Turf Image */}
            {booking.type === "play" &&
              (booking.event_image_url ||
                booking.venue_image_url ||
                booking.play_image ||
                booking.image_url) && (
                <div className="w-full h-[120px] md:h-[180px] rounded-[10px] md:rounded-[12px] overflow-hidden">
                  <img
                    src={
                      booking.event_image_url ||
                      booking.venue_image_url ||
                      booking.play_image ||
                      booking.image_url
                    }
                    alt="Turf"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

            {/* Details list */}
            <div className="space-y-3 mt-1">
              <div className="h-[0.5px] bg-[#686868] w-full" />

              {/* Quantity / Guests */}
              <div className="space-y-0.5">
                <p className="text-[12px] md:text-[14px] font-medium text-[#686868] leading-none">
                  {booking.type === "play"
                    ? "Play duration"
                    : booking.type === "dining"
                      ? "Guests"
                      : "Quantity"}
                </p>
                <p className="text-[14px] md:text-[16px] font-medium text-black uppercase">
                  {displayQuantity}
                </p>
              </div>

              <div className="h-[0.5px] bg-[#686868] w-full" />

              {/* Location */}
              <div className="space-y-0.5 relative pr-10 md:pr-12">
                <p className="text-[12px] md:text-[14px] font-medium text-[#686868] leading-none">
                  Location
                </p>
                <p className="text-[13px] md:text-[16px] font-medium text-black uppercase leading-tight">
                  {displayLocation}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    booking.google_map_link &&
                    window.open(booking.google_map_link, "_blank")
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  disabled={!booking.google_map_link}
                >
                  <img
                    src="/events/directions.svg"
                    alt="Directions"
                    className="w-5 h-5 md:w-7 md:h-7"
                  />
                </button>
              </div>

              <div className="h-[0.5px] bg-[#686868] w-full" />

              {/* Offer */}
              <div className="space-y-0.5">
                <p className="text-[12px] md:text-[14px] font-medium text-[#686868] leading-none">
                  Discount
                </p>
                <p className="text-[13px] md:text-[16px] font-medium text-black uppercase leading-tight">
                  {booking.ticpass_applied
                    ? `Ticpass Applied - ₹${booking.discount_amount} off`
                    : booking.offer_id
                      ? `Offer Applied - ₹${booking.discount_amount} off`
                      : booking.coupon_code
                        ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off`
                        : booking.grand_total === 0
                          ? "Total Free"
                          : booking.discount_amount > 0
                            ? `₹${booking.discount_amount} Savings`
                            : "No offer applied"}
                </p>
              </div>

              {/* Cancel Link */}
              {!isCancelled && !isExpired && (
                <div className="pt-1">
                  <button
                    onClick={openCancelModal}
                    className="text-[14px] md:text-[18px] font-semibold text-[#ED4D1B] border-b border-dotted border-[#ED4D1B] leading-none"
                  >
                    Cancel booking
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Order Details Section */}
        <div className="space-y-3">
          <h2 className="text-[16px] md:text-[18px] font-semibold text-black px-1 leading-none">
            Order details
          </h2>

          <div className="bg-white border-[0.5px] border-[#686868] rounded-[20px] md:rounded-[22px] p-3.5 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] flex items-center justify-center text-black shrink-0">
                  <img
                    src="/events/invoice.svg"
                    alt="Invoice"
                    className="w-[22px] h-[22px] md:w-[28px] md:h-[28px]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] md:text-[18px] font-regular text-black leading-tight truncate">
                    Total bill <span className="text-[15px] md:text-[18px] font-medium">{displayBillValue}</span>
                  </p>
                  <p className="text-[11px] md:text-[13px] font-regular text-[#686868] leading-tight">
                    Incl. taxes & fees
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBillDetailsOpen(true)}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors shrink-0"
                title="View bill details"
              >
                <svg
                  width="5"
                  height="10"
                  viewBox="0 0 6 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="scale-110 md:scale-125"
                >
                  <path
                    d="M0.198787 1.35999L4.29333 6L0.198787 10.64C0.0697912 10.7914 -0.00158669 10.9941 2.67796e-05 11.2045C0.00164025 11.4149 0.0761159 11.6162 0.207413 11.765C0.338711 11.9137 0.516325 11.9981 0.702 12C0.887676 12.0018 1.06656 11.9209 1.20012 11.7747L5.7932 6.56977C5.85934 6.49513 5.9117 6.4063 5.9472 6.30847C5.98271 6.21064 6.00065 6.10578 5.99998 6C6.00045 5.89426 5.98242 5.78946 5.94693 5.69166C5.91143 5.59386 5.85918 5.505 5.7932 5.43023L1.20012 0.225268C1.06656 0.0790882 0.887676 -0.00179862 0.702 3.05259e-05C0.516325 0.00185872 0.338711 0.0862551 0.207413 0.235044C0.076116 0.383832 0.00164038 0.585107 2.69037e-05 0.795518C-0.00158657 1.00593 0.0697913 1.20864 0.198787 1.35999Z"
                    fill="black"
                  />
                </svg>
              </button>
            </div>

            <div className="h-[0.5px] bg-[#686868] w-full my-3" />

            <div className="flex items-center gap-3">
              {profilePhoto ? (
                <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] flex items-center justify-center bg-white rounded-full border border-[#686868] overflow-hidden shrink-0">
                  <Image
                    src={profilePhoto}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-[30px] h-[30px] md:w-[36px] md:h-[36px] flex items-center justify-center shrink-0">
                  <img
                    src="/events/Group.svg"
                    alt="User"
                    className="w-[20px] h-[20px] md:w-[26px] md:h-[26px]"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[14px] md:text-[16px] font-medium text-black uppercase leading-tight truncate">
                  {displayUserName}
                </p>
                <p className="text-[12px] md:text-[14px] font-medium text-[#686868] leading-tight truncate">
                  {displayUserPhone}
                </p>
              </div>
            </div>
          </div>

          <div className="px-1 space-y-0.5">
            <p className="text-[11px] md:text-[13px] font-medium text-[#686868]">
              Booking ID:{" "}
              {booking.booking_id || booking.id?.slice(-8).toUpperCase()}
            </p>
            <p className="text-[11px] md:text-[13px] font-medium text-[#686868]">
              Booking date: {displayBookingDate}
            </p>
          </div>
        </div>

        {/* Terms & Conditions Box */}
        <div className="bg-[#E1E1E1] rounded-[20px] md:rounded-[22px] p-4 md:p-5">
          <h2 className="text-[15px] md:text-[18px] font-semibold text-black mb-2 leading-none">
            Terms & Conditions
          </h2>
          <ul className="space-y-1 text-[#686868] text-[11px] md:text-[13px]">
            <li>• Please arrive 10 minutes before the scheduled time.</li>
            <li>• Carry a valid ID proof for verification at the venue.</li>
            <li>• Cancellation policies apply as per the vendor's terms.</li>
            <li>• Tickets are non-transferable unless specified otherwise.</li>
          </ul>
        </div>

        {/* Chat with Support Box */}
        <Link
          href="/chat-support"
          className="bg-white border-[0.5px] border-[#686868] rounded-[16px] md:rounded-[20px] p-3 md:p-4 flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-zinc-50 transition-colors mb-0"
        >
          <div className="w-[30px] h-[30px] md:w-[38px] md:h-[38px] flex items-center justify-center rounded-full text-white shrink-0">
            <img src="/events/chat.svg" alt="chat" className="w-[28px] h-[28px] md:w-[34px] md:h-[34px]" />
          </div>
          <h3 className="text-[13px] md:text-[16px] font-semibold text-black leading-none">
            Chat with support
          </h3>
        </Link>
      </main>

      {/* HIDDEN PREMIUM TICKET FOR PDF DOWNLOAD */}
      <div className="opacity-0 pointer-events-none absolute -left-[9999px]">
        <div
          ref={ticketRef}
          id="hidden-ticket-capture"
          style={{
            width: "595px",
            height: "842px",
            background: "#f5f5f5",
            padding: "0",
            fontFamily: "Anek Latin, Arial, sans-serif",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
          }}
        >
          {/* Gray Container */}
          <div
            style={{
              width: "500px",
              background: "#EBEBEB",
              borderRadius: "15px",
              border: "1px solid #ffffff",
              overflow: "hidden",
              marginRight: "0",
              marginTop: "20px",
              marginBottom: "0",
            }}
          >
            {/* Yellow Header */}
            <div style={{ background: "#E7C200", padding: "8px 16px" }}>
              <span
                style={{
                  color: "#000000",
                  fontWeight: 900,
                  fontSize: "14px",
                  letterSpacing: "1px",
                }}
              >
                TICPIN
              </span>
            </div>

            {/* Gray Content Body */}
            <div style={{ padding: "16px" }}>
              {/* Heading */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#000000",
                  }}
                >
                  Play booking confirmed
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: "18px",
                    height: "18px",
                    background: "#0AC655",
                    borderRadius: "50%",
                    color: "#fff",
                    textAlign: "center",
                    lineHeight: "18px",
                    fontSize: "12px",
                    marginLeft: "8px",
                  }}
                >
                  ✓
                </span>
              </div>

              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#686868",
                  lineHeight: "16px",
                }}
              >
                Booking Date: {displayDate}, {displayTime}
              </p>

              {/* Play Card Box */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  padding: "10px",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "68px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {booking.event_image_url ||
                    booking.venue_image_url ||
                    booking.play_image ||
                    booking.image_url ? (
                    <img
                      src={
                        booking.event_image_url ||
                        booking.venue_image_url ||
                        booking.play_image ||
                        booking.image_url
                      }
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#FFEF9A",
                      }}
                    ></div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#000000",
                      lineHeight: "18px",
                    }}
                  >
                    {displayName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#686868",
                      lineHeight: "16px",
                    }}
                  >
                    {displayLocation}
                  </p>
                </div>
              </div>

              {/* Details Card Box */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  padding: "14px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#686868",
                    lineHeight: "14px",
                  }}
                >
                  Booking ID
                </p>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#000000",
                    lineHeight: "16px",
                  }}
                >
                  {booking.booking_id || booking.id?.slice(-8).toUpperCase()}
                </p>

                <div
                  style={{
                    borderTop: "1px solid #D9D9D9",
                    margin: "8px 0 12px 0",
                  }}
                ></div>

                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#686868",
                    lineHeight: "14px",
                  }}
                >
                  Date & Time
                </p>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#000000",
                    lineHeight: "16px",
                  }}
                >
                  {displayDateTime}
                </p>

                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#686868",
                    lineHeight: "14px",
                  }}
                >
                  Play duration
                </p>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#000000",
                    lineHeight: "16px",
                  }}
                >
                  {displayQuantity}
                </p>

                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#686868",
                    lineHeight: "14px",
                  }}
                >
                  Location
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#000000",
                    lineHeight: "16px",
                  }}
                >
                  {displayLocation}
                </p>

                {(booking.ticpass_applied ||
                  booking.offer_id ||
                  booking.coupon_code) && (
                    <>
                      <div
                        style={{
                          borderTop: "1px solid #D9D9D9",
                          margin: "8px 0 12px 0",
                        }}
                      ></div>
                      <p
                        style={{
                          margin: "0 0 2px 0",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#686868",
                          lineHeight: "14px",
                        }}
                      >
                        Discount
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#000000",
                          lineHeight: "16px",
                        }}
                      >
                        {booking.ticpass_applied
                          ? `Ticpass Applied - ₹${booking.discount_amount} off`
                          : booking.offer_id
                            ? `Offer Applied - ₹${booking.discount_amount} off`
                            : booking.coupon_code
                              ? `Coupon: ${booking.coupon_code} - ₹${booking.discount_amount} off`
                              : booking.grand_total === 0
                                ? "Total Free"
                                : ""}
                      </p>
                    </>
                  )}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#686868",
                  margin: "12px 0 12px 0",
                  lineHeight: "14px",
                }}
              >
                To access your booking, please sign in to your{" "}
                <span style={{ color: "#5331EA", fontWeight: 600 }}>
                  Ticpin
                </span>{" "}
                account with {booking.user_phone}
              </p>

              <p
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#000000",
                  marginBottom: "8px",
                  lineHeight: "18px",
                }}
              >
                Notes
              </p>

              {/* Notes Box */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "10px",
                  padding: "12px",
                }}
              >
                <div style={{ display: "flex", marginBottom: "8px" }}>
                  <div style={{ width: "18px", paddingTop: "2px" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        border: "2px solid #E7C200",
                        boxSizing: "border-box",
                        transform: "rotate(-45deg)",
                      }}
                    ></div>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#686868",
                      lineHeight: "14px",
                      margin: 0,
                    }}
                  >
                    Please arrive 10 minutes before the scheduled time for your
                    slot booking.
                  </p>
                </div>
                <div style={{ display: "flex", marginBottom: "8px" }}>
                  <div style={{ width: "18px", paddingTop: "2px" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        border: "2px solid #E7C200",
                        boxSizing: "border-box",
                        transform: "rotate(-45deg)",
                      }}
                    ></div>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#686868",
                      lineHeight: "14px",
                      margin: 0,
                    }}
                  >
                    Your booking time is strictly reserved, late arrivals may
                    result in reduced playtime.
                  </p>
                </div>
                <div style={{ display: "flex", marginBottom: "8px" }}>
                  <div style={{ width: "18px", paddingTop: "2px" }}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        border: "2px solid #E7C200",
                        boxSizing: "border-box",
                        transform: "rotate(-45deg)",
                      }}
                    ></div>
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      color: "#686868",
                      lineHeight: "14px",
                      margin: 0,
                    }}
                  >
                    Ensure you vacate the turf on or before your end time to
                    avoid inconvenience to the next booking
                  </p>
                </div>
                <p
                  style={{
                    margin: "12px 0 0 0",
                    fontSize: "10px",
                    fontWeight: 500,
                    color: "#686868",
                    lineHeight: "14px",
                  }}
                >
                  See you there!
                  <br />
                  Team{" "}
                  <span style={{ color: "#5331EA", fontWeight: 600 }}>
                    Ticpin
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Details Popup */}
      {isBillDetailsOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsBillDetailsOpen(false)}
          />
          <div className="relative w-full max-w-[420px] bg-white rounded-[20px] border border-[#AEAEAE] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
              <h3 className="text-[18px] md:text-[22px] font-semibold text-black">
                Bill details
              </h3>
              <button
                type="button"
                onClick={() => setIsBillDetailsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
              >
                <X size={18} className="text-black" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-3">

                {orderAmountValue > 0 && (
                  <div className="flex justify-between text-[15px] text-[#686868]">
                    <span>Order amount</span>
                    <span>₹{formatPrice(orderAmountValue)}</span>
                  </div>
                )}
                {bookingFeeValue > 0 && (
                  <>
                    <div className="flex justify-between text-[15px] text-black">
                      <span>Booking fee</span>
                      <span>₹{formatPrice(bookingFeeValue)}</span>
                    </div>
                    <div className="pl-3 space-y-1 border-l-2 border-[#E5E5E5]">
                      <div className="flex justify-between text-[13px] text-[#686868]">
                        <span>Base platform fee</span>
                        <span>₹{formatPrice(basePlatformFee)}</span>
                      </div>
                      <div className="flex justify-between text-[13px] text-[#686868]">
                        <span>GST (18%)</span>
                        <span>₹{formatPrice(gstOnFee)}</span>
                      </div>
                    </div>
                  </>
                )}
                {discountValue > 0 && (
                  <div className="flex justify-between text-[15px] text-[#16a34a]">
                    <span>Discount</span>
                    <span>-₹{formatPrice(discountValue)}</span>
                  </div>
                )}
                {donationValue > 0 && (
                  <div className="flex justify-between text-[15px] text-black">
                    <span>Donation</span>
                    <span>₹{formatPrice(donationValue)}</span>
                  </div>
                )}
                <div className="h-[0.5px] bg-[#D9D9D9]" />
                <div className="flex justify-between text-[16px] font-semibold text-black">
                  <span>Total bill</span>
                  <span>{displayBillValue}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[15px] font-semibold text-black">
                  Booking details
                </h4>
                <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Booking ID</span>
                    <span className="text-black text-right">
                      {booking.booking_id ||
                        booking.id?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Event / Venue</span>
                    <span className="text-black text-right">{displayName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Date & Time</span>
                    <span className="text-black text-right">
                      {displayDateTime}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Quantity</span>
                    <span className="text-black text-right">
                      {displayQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Location</span>
                    <span className="text-black text-right">
                      {displayLocation}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Payment method</span>
                    <span className="text-black text-right uppercase">
                      {booking.payment_method ||
                        booking.payment_gateway ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[15px] font-semibold text-black">
                  Booked by
                </h4>
                <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Name</span>
                    <span className="text-black text-right">
                      {displayUserName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-[#686868]">Phone</span>
                    <span className="text-black text-right">
                      {displayUserPhone}
                    </span>
                  </div>
                  {booking.user_email && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#686868]">Email</span>
                      <span className="text-black text-right break-all">
                        {booking.user_email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal Overlay */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
            onClick={() => !cancelling && setIsCancelModalOpen(false)}
          />

          {/* Modal Content Wrapper */}
          <div
            className={`relative animate-in zoom-in-95 duration-500 w-[95vw] md:w-auto ${cancelStep === "donation" ? "max-w-[480px] md:max-w-[850px]" : "max-w-[380px] md:max-w-[700px]"}`}
          >
            <div className="relative w-full bg-white rounded-[20px] md:rounded-[26px] border border-[#AEAEAE] overflow-hidden max-h-[85vh] md:max-h-none overflow-y-auto">
              {cancelStep === "reason" ? (
                <>
                  {/* Modal Header (Step 1) */}
                  <div className="flex items-center justify-between p-4 md:p-8 border-b-[0.5px] border-[#AEAEAE]">
                    <h2 className="text-[18px] md:text-[24px] font-semibold text-black">
                      Booking cancellation request
                    </h2>
                    <button
                      onClick={() => setIsCancelModalOpen(false)}
                      className="text-black hover:opacity-70"
                    >
                      <X size={20} className="md:hidden" />
                      <X
                        size={28}
                        strokeWidth={2.5}
                        className="hidden md:block"
                      />
                    </button>
                  </div>

                  {/* Modal Body (Step 1) */}
                  <div className="p-4 md:p-10 space-y-4 md:space-y-8">
                    <div className="space-y-3 md:space-y-4">
                      <p className="text-[13px] md:text-[17px] font-medium text-[#686868]">
                        Select your reason here
                      </p>

                      <div className="flex flex-wrap gap-2 md:gap-4">
                        {reasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => setSelectedReason(reason)}
                            className={`px-4 py-1.5 md:px-6 md:py-2 rounded-[20px] md:rounded-[25px] border text-[13px] md:text-[17px] font-medium transition-all ${selectedReason === reason
                              ? "bg-black text-white border-black"
                              : "bg-white text-black border-[#AEAEAE] hover:border-black"
                              }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[0.5px] border-t border-[#AEAEAE] border-dashed w-full" />

                    <button
                      onClick={handleCancelSubmit}
                      disabled={!selectedReason || cancelling}
                      className={`w-full h-[42px] md:h-[51px] rounded-[12px] md:rounded-[15px] text-[16px] md:text-[23px] font-semibold transition-all flex items-center justify-center ${selectedReason && !cancelling
                        ? "bg-black text-white"
                        : "bg-[#AEAEAE] text-white/70 cursor-not-allowed"
                        }`}
                    >
                      {cancelling ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </>
              ) : cancelStep === "donation" ? (
                <>
                  {/* Modal Header (Step 2) */}
                  <div className="flex items-center justify-between p-4 md:p-8">
                    <h2 className="text-[18px] md:text-[25px] font-semibold text-black">
                      Booking cancellation confirmed
                    </h2>
                    <button
                      onClick={() => {
                        setIsCancelModalOpen(false);
                        setCancelStep("reason");
                      }}
                      className="text-black hover:opacity-70"
                    >
                      <X size={20} className="md:hidden" />
                      <X
                        size={28}
                        strokeWidth={2.5}
                        className="hidden md:block"
                      />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.5px] border-t border-[#686868] border-dashed w-full" />

                  {/* Modal Body (Step 2) */}
                  <div className="p-4 md:p-8 space-y-4 md:space-y-8">
                    <p className="text-[13px] md:text-[17px] font-medium text-[#686868]">
                      Would you like to support a cause with your refund?
                    </p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                      {/* Option 1: Full Refund */}
                      <div
                        onClick={() => {
                          setDonationChoice("full_refund");
                          setSplitAmount("");
                        }}
                        className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "full_refund"
                          ? "border-[#2F834E] bg-[#2F834E]/5"
                          : "border-[#AEAEAE] hover:border-[#2F834E]/50"
                          }`}
                      >
                        <div className="absolute top-2 md:top-4 left-2 md:left-4">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "full_refund"
                              ? "bg-[#2F834E] border-[#2F834E]"
                              : "border-[#2F834E]"
                              }`}
                          >
                            {donationChoice === "full_refund" && (
                              <CheckCircle
                                size={10}
                                className="text-white md:hidden"
                              />
                            )}
                            {donationChoice === "full_refund" && (
                              <CheckCircle
                                size={14}
                                className="text-white hidden md:block"
                              />
                            )}
                          </div>
                        </div>

                        <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#65B54E]/20 rounded-full flex items-center justify-center mb-2 md:mb-4">
                          <img
                            src="/cancel popup/Vector.svg"
                            alt="Wallet"
                            className="w-[22px] h-[22px] md:w-[35px] md:h-[35px]"
                          />
                        </div>

                        <h3 className="text-[13px] md:text-[17px] font-medium text-black">
                          Get full refund
                        </h3>
                        <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
                          Refund ₹{formatPrice(bookingTotal)} will be
                          sent to your original payment method.
                        </p>

                        <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                          <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">
                            You get
                          </p>
                          <p className="text-[14px] md:text-[17px] font-semibold text-[#2F834E]">
                            ₹{formatPrice(bookingTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Donate All */}
                      <div
                        onClick={() => {
                          setDonationChoice("full_donate");
                          setSplitAmount("");
                        }}
                        className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "full_donate"
                          ? "border-[#DB5244] bg-[#DB5244]/5"
                          : "border-[#AEAEAE] hover:border-[#DB5244]/50"
                          }`}
                      >
                        <div className="absolute top-2 md:top-4 left-2 md:left-4">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "full_donate"
                              ? "bg-[#DB5244] border-[#DB5244]"
                              : "border-[#DB5244]"
                              }`}
                          >
                            {donationChoice === "full_donate" && (
                              <CheckCircle
                                size={10}
                                className="text-white md:hidden"
                              />
                            )}
                            {donationChoice === "full_donate" && (
                              <CheckCircle
                                size={14}
                                className="text-white hidden md:block"
                              />
                            )}
                          </div>
                        </div>

                        <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#ED4D1B]/25 rounded-full flex items-center justify-center mb-2 md:mb-4">
                          <img
                            src="/cancel popup/Donate 1.svg"
                            alt="Donate"
                            className="w-[22px] h-[18px] md:w-[35px] md:h-[29px]"
                          />
                        </div>

                        <h3 className="text-[13px] md:text-[17px] font-medium text-black">
                          Donate my refund
                        </h3>
                        <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
                          Donate ₹{formatPrice(bookingTotal)} to
                          support verified NGOs and create impact
                        </p>

                        <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                          <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">
                            You donate
                          </p>
                          <p className="text-[14px] md:text-[17px] font-semibold text-[#DB5244]">
                            ₹{formatPrice(bookingTotal)}
                          </p>
                        </div>
                      </div>

                      {/* Option 3: Split */}
                      <div
                        onClick={() => setDonationChoice("split")}
                        className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${donationChoice === "split"
                          ? "border-[#5331EA] bg-[#5331EA]/5"
                          : "border-[#AEAEAE] hover:border-[#5331EA]/50"
                          }`}
                      >
                        <div className="absolute top-2 md:top-4 left-2 md:left-4">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${donationChoice === "split"
                              ? "bg-[#5331EA] border-[#5331EA]"
                              : "border-[#5331EA]"
                              }`}
                          >
                            {donationChoice === "split" && (
                              <CheckCircle
                                size={10}
                                className="text-white md:hidden"
                              />
                            )}
                            {donationChoice === "split" && (
                              <CheckCircle
                                size={14}
                                className="text-white hidden md:block"
                              />
                            )}
                          </div>
                        </div>

                        <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#5331EA]/20 rounded-full flex items-center justify-center mb-2 md:mb-4 shrink-0">
                          <img
                            src="/cancel popup/Heart Handshake 1.svg"
                            alt="Split"
                            className="w-[22px] h-[21px] md:w-[35px] md:h-[33px]"
                          />
                        </div>

                        <h3 className="text-[13px] md:text-[17px] font-medium text-black leading-tight mb-0.5 md:mb-1">
                          Split refund & donation
                        </h3>
                        <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-0.5 md:mt-1 max-w-[145px] leading-tight">
                          Choose how much you want to donate and get the rest as
                          refund.
                        </p>

                        <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                          <p className="text-[9px] md:text-[9px] font-medium text-[#686868] mb-0.5 md:mb-1">
                            You get / You donate
                          </p>
                          <button className="text-[13px] md:text-[15px] font-medium text-[#5331EA] hover:underline flex items-center justify-center gap-1 mx-auto">
                            Choose amount
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Split Amount Input Section */}
                    {donationChoice === "split" && (
                      <div className="mt-3 md:mt-4 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
                        <label className="text-[12px] md:text-[14px] font-medium text-[#686868] mb-1.5 md:mb-2">
                          Enter refund amount (Max ₹{bookingTotal})
                        </label>
                        <div className="relative w-[260px] md:w-[300px]">
                          <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black font-semibold text-[14px] md:text-[16px]">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={bookingTotal}
                            step="1"
                            value={splitAmount}
                            onChange={(e) => setSplitAmount(e.target.value)}
                            placeholder={`${bookingTotal}`}
                            className="w-full border-2 border-[#AEAEAE] rounded-[10px] md:rounded-[12px] pl-7 md:pl-8 pr-3 md:pr-4 py-1.5 md:py-2 text-[14px] md:text-[16px] font-semibold text-black focus:outline-none focus:border-black transition-colors"
                          />
                        </div>
                        {splitAmount !== "" &&
                          !isNaN(parseFloat(splitAmount)) && (
                            <p className="text-[11px] md:text-[13px] font-medium text-black mt-1.5 md:mt-2 bg-zinc-100 px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                              Refund: ₹
                              {formatPrice(Math.max(
                                0,
                                parseFloat(splitAmount) || 0,
                              ))}
                              <span className="mx-1 md:mx-2 text-[#AEAEAE]">
                                |
                              </span>
                              Donation:{" "}
                              <span className="text-[#ED4D1B]">
                                ₹
                                {formatPrice(Math.max(
                                  0,
                                  bookingTotal - (parseFloat(splitAmount) || 0),
                                ))}
                              </span>
                            </p>
                          )}
                      </div>
                    )}

                    {/* Security/Partners Section */}
                    <div className="border border-[#AEAEAE] rounded-[12px] md:rounded-[15px] p-2.5 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <img
                          src="/cancel popup/FAV Icon New 1 1.svg"
                          alt="Impact"
                          className="w-[28px] h-[28px] md:w-[38px] md:h-[38px]"
                        />
                        <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-medium text-black">
                          <img
                            src="/cancel popup/lock.svg"
                            alt="Secure"
                            className="w-3.5 h-3.5 md:w-5 md:h-5"
                          />
                          <span className="hidden md:inline">
                            100% secure donations • Verified NGO partners •
                            Transparent impact
                          </span>
                          <span className="md:hidden">Secure donations</span>
                        </div>
                      </div>
                      <Link
                        href="#"
                        className="text-[9px] md:text-[10px] font-medium text-[#5331EA] underline text-center"
                      >
                        Learn more about our donation program
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleCancelSubmit}
                      disabled={
                        !donationChoice ||
                        cancelling ||
                        (donationChoice === "split" && !splitAmount)
                      }
                      className={`w-full h-[40px] md:h-[51px] bg-black text-white rounded-[12px] md:rounded-[15px] text-[15px] md:text-[23px] font-semibold transition-all hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {cancelling ? (
                        <RefreshCw
                          className="animate-spin md:hidden"
                          size={18}
                        />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Modal Header (Success Step) */}
                  <div className="flex items-center justify-between p-6 md:p-8">
                    <h2
                      className="text-[24px] md:text-[26px] font-semibold text-black"
                      style={{ fontFamily: "var(--font-anek-latin)" }}
                    >
                      Cancellation Request Successful
                    </h2>
                    <button
                      onClick={() => {
                        setIsCancelModalOpen(false);
                        setCancelStep("reason");
                      }}
                      className="text-black hover:opacity-70 cursor-pointer"
                    >
                      <X size={28} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-[0.5px] border-t border-[#686868]/20 w-full" />

                  {/* Modal Body (Success Step) */}
                  <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                    {/* Elegant Refund Success Icon */}
                    <div className="w-[76px] h-[76px] bg-[#EAFDF1] rounded-full flex items-center justify-center border border-[#65B54E]/30 shrink-0">
                      <CheckCircle className="w-[44px] h-[44px] text-[#0AC655]" />
                    </div>

                    <div className="space-y-3 max-w-[480px]">
                      <h3
                        className="text-[22px] font-bold text-[#0AC655] uppercase tracking-wider"
                        style={{
                          fontFamily:
                            "Anek Tamil Condensed, var(--font-anek-latin)",
                        }}
                      >
                        Refund Initiated!
                      </h3>
                      <p
                        className="text-[16px] text-[#686868] font-medium leading-relaxed"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        Once cancellation is done, the refund amount will be
                        credited back to your original payment method within{" "}
                        <span className="font-bold text-black text-[17px]">
                          12-24 hours
                        </span>
                        .
                      </p>
                    </div>

                    {/* Premium Styled Refund Summary Card */}
                    <div
                      className="w-full border-[0.5px] border-[#686868]/30 rounded-[20px] p-5 space-y-3.5 shadow-sm"
                      style={{
                        background:
                          "radial-gradient(52.97% 102.98% at 0% -7.55%, #EAFDF1 0%, #FFFFFF 100%)",
                      }}
                    >
                      <div
                        className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
                        style={{ fontFamily: "var(--font-anek-latin)" }}
                      >
                        <span>Total booking amount</span>
                        <span className="text-black font-semibold">
                          ₹{formatPrice(bookingTotal)}
                        </span>
                      </div>
                      {donationChoice === "full_donate" ? (
                        <div
                          className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
                          style={{ fontFamily: "var(--font-anek-latin)" }}
                        >
                          <span>Donation to NGO partner</span>
                          <span className="text-[#DB5244] font-semibold">
                            ₹{formatPrice(bookingTotal)}
                          </span>
                        </div>
                      ) : donationChoice === "split" ? (
                        <>
                          <div
                            className="flex justify-between items-center text-[15px] font-medium text-[#686868]"
                            style={{ fontFamily: "var(--font-anek-latin)" }}
                          >
                            <span>Donation to NGO partner</span>
                            <span className="text-[#DB5244] font-semibold">
                              ₹
                              {formatPrice(bookingTotal - (parseFloat(splitAmount) || 0))}
                            </span>
                          </div>
                          <div
                            className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50"
                            style={{ fontFamily: "var(--font-anek-latin)" }}
                          >
                            <span>Estimated Refund</span>
                            <span>
                              ₹
                              {formatPrice(Math.max(
                                0,
                                parseFloat(splitAmount) || 0,
                              ))}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div
                          className="flex justify-between items-center text-[16px] font-semibold text-[#0AC655] pt-3.5 border-t border-dashed border-[#AEAEAE]/50"
                          style={{ fontFamily: "var(--font-anek-latin)" }}
                        >
                          <span>Estimated Refund</span>
                          <span>₹{formatPrice(bookingTotal)}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsCancelModalOpen(false);
                        setCancelStep("reason");
                      }}
                      className="w-full h-[48px] bg-black text-white rounded-[10px] text-[18px] font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center shadow-md shadow-black/10 cursor-pointer uppercase tracking-wider"
                      style={{
                        fontFamily:
                          "Anek Tamil Condensed, var(--font-anek-latin)",
                      }}
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

