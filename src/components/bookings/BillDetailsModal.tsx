'use client';

import React from 'react';
import { X } from 'lucide-react';

interface BillDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayBillValue: string;
  bookingFeeValue: number;
  basePlatformFee: number;
  gstOnFee: number;
  discountValue: number;
  donationValue: number;
  displayName: string;
  displayDateTime: string;
  displayQuantity: string;
  displayLocation: string;
  displayUserName: string;
  displayUserPhone: string;
  booking: any;
}

export default function BillDetailsModal({
  isOpen,
  onClose,
  displayBillValue,
  bookingFeeValue,
  basePlatformFee,
  gstOnFee,
  discountValue,
  donationValue,
  displayName,
  displayDateTime,
  displayQuantity,
  displayLocation,
  displayUserName,
  displayUserPhone,
  booking,
}: BillDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[420px] bg-white rounded-[20px] border border-[#AEAEAE] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <h3 className="text-[18px] md:text-[22px] font-semibold text-black">Bill details</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
          >
            <X size={18} className="text-black" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between text-[15px] text-black">
              <span>Booking fee</span>
              <span>₹{bookingFeeValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="pl-3 space-y-1 border-l-2 border-[#E5E5E5]">
              <div className="flex justify-between text-[13px] text-[#686868]">
                <span>Base platform fee</span>
                <span>₹{basePlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[#686868]">
                <span>GST (18%)</span>
                <span>₹{gstOnFee.toFixed(2)}</span>
              </div>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-[15px] text-[#16a34a]">
                <span>Discount</span>
                <span>-₹{discountValue.toLocaleString('en-IN')}</span>
              </div>
            )}
            {donationValue > 0 && (
              <div className="flex justify-between text-[15px] text-black">
                <span>Donation</span>
                <span>₹{donationValue.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="h-[0.5px] bg-[#D9D9D9]" />
            <div className="flex justify-between text-[16px] font-semibold text-black">
              <span>Total bill</span>
              <span>{displayBillValue}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[15px] font-semibold text-black">Booking details</h4>
            <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Booking ID</span>
                <span className="text-black text-right">{booking.booking_id || booking.id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Event / Venue</span>
                <span className="text-black text-right">{displayName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Date &amp; Time</span>
                <span className="text-black text-right">{displayDateTime}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Quantity</span>
                <span className="text-black text-right">{displayQuantity}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Location</span>
                <span className="text-black text-right">{displayLocation}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Payment method</span>
                <span className="text-black text-right uppercase">{booking.payment_method || booking.payment_gateway || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[15px] font-semibold text-black">Booked by</h4>
            <div className="rounded-[14px] bg-[#F8F8F8] p-4 space-y-2 text-[14px]">
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Name</span>
                <span className="text-black text-right">{displayUserName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#686868]">Phone</span>
                <span className="text-black text-right">{displayUserPhone}</span>
              </div>
              {booking.user_email && (
                <div className="flex justify-between gap-4">
                  <span className="text-[#686868]">Email</span>
                  <span className="text-black text-right break-all">{booking.user_email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
