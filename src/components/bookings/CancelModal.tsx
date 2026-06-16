'use client';

import React from 'react';
import { X, RefreshCw, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CancelModalProps {
  isCancelModalOpen: boolean;
  cancelStep: 'reason' | 'donation' | 'success';
  selectedReason: string | null;
  donationChoice: 'full_refund' | 'full_donate' | 'split' | null;
  splitAmount: string;
  cancelling: boolean;
  bookingTotal: number;
  reasons: string[];
  onClose: () => void;
  onReasonSelect: (reason: string) => void;
  onDonationChoiceSelect: (choice: 'full_refund' | 'full_donate' | 'split') => void;
  onSplitAmountChange: (amount: string) => void;
  onSubmit: () => void;
  onBackToReason: () => void;
}

export default function CancelModal({
  isCancelModalOpen,
  cancelStep,
  selectedReason,
  donationChoice,
  splitAmount,
  cancelling,
  bookingTotal,
  reasons,
  onClose,
  onReasonSelect,
  onDonationChoiceSelect,
  onSplitAmountChange,
  onSubmit,
  onBackToReason,
}: CancelModalProps) {
  if (!isCancelModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={() => !cancelling && onClose()}
      />

      {/* Modal Content Wrapper */}
      <div
        className={`relative animate-in zoom-in-95 duration-500 w-[95vw] md:w-auto ${cancelStep === 'donation' ? 'max-w-[480px] md:max-w-[850px]' : 'max-w-[380px] md:max-w-[700px]'}`}
      >
        <div className="relative w-full bg-white rounded-[20px] md:rounded-[26px] border border-[#AEAEAE] overflow-hidden max-h-[85vh] md:max-h-none overflow-y-auto">
          {cancelStep === 'reason' ? (
            <>
              {/* Modal Header (Step 1) */}
              <div className="flex items-center justify-between p-4 md:p-8 border-b-[0.5px] border-[#AEAEAE]">
                <h2 className="text-[18px] md:text-[24px] font-semibold text-black">
                  Booking cancellation request
                </h2>
                <button
                  onClick={onClose}
                  className="text-black hover:opacity-70"
                >
                  <X size={20} className="md:hidden" />
                  <X size={28} strokeWidth={2.5} className="hidden md:block" />
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
                        onClick={() => onReasonSelect(reason)}
                        className={`px-4 py-1.5 md:px-6 md:py-2 rounded-[20px] md:rounded-[25px] border text-[13px] md:text-[17px] font-medium transition-all ${
                          selectedReason === reason
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-[#AEAEAE] hover:border-black'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[0.5px] border-t border-[#AEAEAE] border-dashed w-full" />

                <button
                  onClick={onSubmit}
                  disabled={!selectedReason || cancelling}
                  className={`w-full h-[42px] md:h-[51px] rounded-[12px] md:rounded-[15px] text-[16px] md:text-[23px] font-semibold transition-all flex items-center justify-center ${
                    selectedReason && !cancelling
                      ? 'bg-black text-white'
                      : 'bg-[#AEAEAE] text-white/70 cursor-not-allowed'
                  }`}
                >
                  {cancelling ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          ) : cancelStep === 'donation' ? (
            <>
              {/* Modal Header (Step 2) */}
              <div className="flex items-center justify-between p-4 md:p-8">
                <h2 className="text-[18px] md:text-[25px] font-semibold text-black">
                  Booking cancellation confirmed
                </h2>
                <button
                  onClick={() => {
                    onClose();
                    onBackToReason();
                  }}
                  className="text-black hover:opacity-70"
                >
                  <X size={20} className="md:hidden" />
                  <X size={28} strokeWidth={2.5} className="hidden md:block" />
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
                    onClick={() => { onDonationChoiceSelect('full_refund'); onSplitAmountChange(''); }}
                    className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${
                      donationChoice === 'full_refund'
                        ? 'border-[#2F834E] bg-[#2F834E]/5'
                        : 'border-[#AEAEAE] hover:border-[#2F834E]/50'
                    }`}
                  >
                    <div className="absolute top-2 md:top-4 left-2 md:left-4">
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${
                        donationChoice === 'full_refund' ? 'bg-[#2F834E] border-[#2F834E]' : 'border-[#2F834E]'
                      }`}>
                        {donationChoice === 'full_refund' && <CheckCircle size={10} className="text-white md:hidden" />}
                        {donationChoice === 'full_refund' && <CheckCircle size={14} className="text-white hidden md:block" />}
                      </div>
                    </div>
                    <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#65B54E]/20 rounded-full flex items-center justify-center mb-2 md:mb-4">
                      <img src="/cancel popup/Vector.svg" alt="Wallet" className="w-[22px] h-[22px] md:w-[35px] md:h-[35px]" />
                    </div>
                    <h3 className="text-[13px] md:text-[17px] font-medium text-black">Get full refund</h3>
                    <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
                      Refund ₹{bookingTotal.toLocaleString('en-IN')} will be sent to your original payment method.
                    </p>
                    <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                      <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">You get</p>
                      <p className="text-[14px] md:text-[17px] font-semibold text-[#2F834E]">₹{bookingTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Option 2: Donate All */}
                  <div
                    onClick={() => { onDonationChoiceSelect('full_donate'); onSplitAmountChange(''); }}
                    className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${
                      donationChoice === 'full_donate'
                        ? 'border-[#DB5244] bg-[#DB5244]/5'
                        : 'border-[#AEAEAE] hover:border-[#DB5244]/50'
                    }`}
                  >
                    <div className="absolute top-2 md:top-4 left-2 md:left-4">
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${
                        donationChoice === 'full_donate' ? 'bg-[#DB5244] border-[#DB5244]' : 'border-[#DB5244]'
                      }`}>
                        {donationChoice === 'full_donate' && <CheckCircle size={10} className="text-white md:hidden" />}
                        {donationChoice === 'full_donate' && <CheckCircle size={14} className="text-white hidden md:block" />}
                      </div>
                    </div>
                    <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#ED4D1B]/25 rounded-full flex items-center justify-center mb-2 md:mb-4">
                      <img src="/cancel popup/Donate 1.svg" alt="Donate" className="w-[22px] h-[18px] md:w-[35px] md:h-[29px]" />
                    </div>
                    <h3 className="text-[13px] md:text-[17px] font-medium text-black">Donate my refund</h3>
                    <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-1 md:mt-2 max-w-[140px] leading-tight">
                      Donate ₹{bookingTotal.toLocaleString('en-IN')} to support verified NGOs and create impact
                    </p>
                    <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                      <p className="text-[9px] md:text-[9px] font-medium text-[#686868]">You donate</p>
                      <p className="text-[14px] md:text-[17px] font-semibold text-[#DB5244]">₹{bookingTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Option 3: Split */}
                  <div
                    onClick={() => onDonationChoiceSelect('split')}
                    className={`relative group cursor-pointer p-3 md:p-5 rounded-[16px] md:rounded-[22px] border-2 flex flex-col items-center text-center transition-all ${
                      donationChoice === 'split'
                        ? 'border-[#5331EA] bg-[#5331EA]/5'
                        : 'border-[#AEAEAE] hover:border-[#5331EA]/50'
                    }`}
                  >
                    <div className="absolute top-2 md:top-4 left-2 md:left-4">
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-[4px] md:rounded-[5px] border flex items-center justify-center transition-colors ${
                        donationChoice === 'split' ? 'bg-[#5331EA] border-[#5331EA]' : 'border-[#5331EA]'
                      }`}>
                        {donationChoice === 'split' && <CheckCircle size={10} className="text-white md:hidden" />}
                        {donationChoice === 'split' && <CheckCircle size={14} className="text-white hidden md:block" />}
                      </div>
                    </div>
                    <div className="w-[40px] h-[40px] md:w-[58px] md:h-[58px] bg-[#5331EA]/20 rounded-full flex items-center justify-center mb-2 md:mb-4 shrink-0">
                      <img src="/cancel popup/Heart Handshake 1.svg" alt="Split" className="w-[22px] h-[21px] md:w-[35px] md:h-[33px]" />
                    </div>
                    <h3 className="text-[13px] md:text-[17px] font-medium text-black leading-tight mb-0.5 md:mb-1">
                      Split refund &amp; donation
                    </h3>
                    <p className="text-[10px] md:text-[9px] font-medium text-[#686868] mt-0.5 md:mt-1 max-w-[145px] leading-tight">
                      Choose how much you want to donate and get the rest as refund.
                    </p>
                    <div className="mt-auto pt-4 md:pt-6 w-full border-t border-dashed border-[#686868]">
                      <p className="text-[9px] md:text-[9px] font-medium text-[#686868] mb-0.5 md:mb-1">You get / You donate</p>
                      <button className="text-[13px] md:text-[15px] font-medium text-[#5331EA] hover:underline flex items-center justify-center gap-1 mx-auto">
                        Choose amount
                      </button>
                    </div>
                  </div>
                </div>

                {/* Split Amount Input Section */}
                {donationChoice === 'split' && (
                  <div className="mt-3 md:mt-4 flex flex-col items-center animate-in fade-in slide-in-from-top-4">
                    <label className="text-[12px] md:text-[14px] font-medium text-[#686868] mb-1.5 md:mb-2">
                      Enter refund amount (Max ₹{bookingTotal})
                    </label>
                    <div className="relative w-[260px] md:w-[300px]">
                      <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-black font-semibold text-[14px] md:text-[16px]">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={bookingTotal}
                        step="1"
                        value={splitAmount}
                        onChange={(e) => onSplitAmountChange(e.target.value)}
                        placeholder={`${bookingTotal}`}
                        className="w-full border-2 border-[#AEAEAE] rounded-[10px] md:rounded-[12px] pl-7 md:pl-8 pr-3 md:pr-4 py-1.5 md:py-2 text-[14px] md:text-[16px] font-semibold text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    {splitAmount !== '' && !isNaN(parseFloat(splitAmount)) && (
                      <p className="text-[11px] md:text-[13px] font-medium text-black mt-1.5 md:mt-2 bg-zinc-100 px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                        Refund: ₹{Math.max(0, parseFloat(splitAmount) || 0).toLocaleString('en-IN')}
                        <span className="mx-1 md:mx-2 text-[#AEAEAE]">|</span>
                        Donation: <span className="text-[#ED4D1B]">₹{Math.max(0, bookingTotal - (parseFloat(splitAmount) || 0)).toLocaleString('en-IN')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Security/Partners Section */}
                <div className="border border-[#AEAEAE] rounded-[12px] md:rounded-[15px] p-2.5 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <img src="/cancel popup/FAV Icon New 1 1.svg" alt="Impact" className="w-[28px] h-[28px] md:w-[38px] md:h-[38px]" />
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-medium text-black">
                      <img src="/cancel popup/lock.svg" alt="Secure" className="w-3.5 h-3.5 md:w-5 md:h-5" />
                      <span className="hidden md:inline">100% secure donations • Verified NGO partners • Transparent impact</span>
                      <span className="md:hidden">Secure donations</span>
                    </div>
                  </div>
                  <Link href="#" className="text-[9px] md:text-[10px] font-medium text-[#5331EA] underline text-center">
                    Learn more about our donation program
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  onClick={onSubmit}
                  disabled={!donationChoice || cancelling || (donationChoice === 'split' && !splitAmount)}
                  className="w-full h-[40px] md:h-[51px] bg-black text-white rounded-[12px] md:rounded-[15px] text-[15px] md:text-[23px] font-semibold transition-all hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <RefreshCw className="animate-spin md:hidden" size={18} />
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
