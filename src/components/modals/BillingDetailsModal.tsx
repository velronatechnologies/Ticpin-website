'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface BillingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: BillingDetails) => void;
    phoneNumber: string;
}

export interface BillingDetails {
    name: string;
    phone: string;
    nationality: 'indian' | 'international';
    state: string;
    email: string;
    acceptedTerms: boolean;
}

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export default function BillingDetailsModal({ isOpen, onClose, onSubmit, phoneNumber }: BillingDetailsModalProps) {
    const [formData, setFormData] = useState<BillingDetails>({
        name: '',
        phone: phoneNumber,
        nationality: 'indian',
        state: '',
        email: '',
        acceptedTerms: false,
    });

    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [stateSearch, setStateSearch] = useState('');

    const filteredStates = INDIAN_STATES.filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            onSubmit(formData);
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.state !== '' &&
            formData.email.trim() !== '' &&
            formData.acceptedTerms
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="bg-white relative shadow-2xl rounded-[35px] w-full max-w-[850px] max-h-[90vh] overflow-y-auto z-10">
                <div className="sticky top-0 bg-white z-20 px-8 pt-8 pb-4 border-b border-zinc-200/50 rounded-t-[35px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 font-medium mb-1">Step 2</p>
                            <h2 className="text-3xl font-bold text-zinc-900">Billing Details</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-full hover:bg-zinc-100"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-base text-zinc-600 font-medium">
                            These details will be shown on your invoice *
                        </p>

                        {/* Name Field */}
                        <div>
                            <input
                                type="text"
                                placeholder="Name*"
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.preventDefault();
                                }}
                            />
                        </div>

                        {/* Phone Field (Read-only) */}
                        <div>
                            <input
                                type="tel"
                                className="w-full px-5 py-4 bg-zinc-100 border border-zinc-200 rounded-[12px] text-base font-medium text-zinc-600 cursor-not-allowed"
                                value={formData.phone}
                                readOnly
                            />
                        </div>

                        {/* Nationality Selection */}
                        <div className="space-y-3">
                            <p className="text-base text-zinc-700 font-medium">Select nationality</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, nationality: 'indian' })}
                                    className={`p-4 rounded-[12px] border-2 text-left font-medium transition-all ${
                                        formData.nationality === 'indian'
                                            ? 'border-black bg-black/5'
                                            : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-base">Indian resident</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            formData.nationality === 'indian' ? 'border-black' : 'border-zinc-300'
                                        }`}>
                                            {formData.nationality === 'indian' && (
                                                <div className="w-3 h-3 bg-black rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, nationality: 'international' })}
                                    className={`p-4 rounded-[12px] border-2 text-left font-medium transition-all ${
                                        formData.nationality === 'international'
                                            ? 'border-black bg-black/5'
                                            : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-base">International visitor</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            formData.nationality === 'international' ? 'border-black' : 'border-zinc-300'
                                        }`}>
                                            {formData.nationality === 'international' && (
                                                <div className="w-3 h-3 bg-black rounded-full" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* State Dropdown with Search */}
                        <div className="relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search or Select State*"
                                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                    value={stateSearch || formData.state}
                                    onChange={(e) => {
                                        setStateSearch(e.target.value);
                                        setShowStateDropdown(true);
                                        if (!e.target.value) setFormData({ ...formData, state: '' });
                                    }}
                                    onFocus={() => setShowStateDropdown(true)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (showStateDropdown && filteredStates.length > 0) {
                                                e.preventDefault();
                                                setFormData({ ...formData, state: filteredStates[0] });
                                                setStateSearch(filteredStates[0]);
                                                setShowStateDropdown(false);
                                            }
                                        }
                                    }}
                                    autoComplete="off"
                                />
                                <ChevronDown size={20} className={`absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform ${showStateDropdown ? 'rotate-180' : ''} pointer-events-none`} />
                            </div>
                            
                            {showStateDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-[12px] shadow-xl max-h-[300px] overflow-y-auto z-30">
                                    {filteredStates.length > 0 ? (
                                        filteredStates.map((state) => (
                                            <button
                                                key={state}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, state });
                                                    setStateSearch(state);
                                                    setShowStateDropdown(false);
                                                }}
                                                className="w-full px-5 py-3 text-left text-base font-medium hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                                            >
                                                {state}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-5 py-3 text-zinc-500 text-sm">No states found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <input
                                type="email"
                                placeholder="Email*"
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-base font-medium focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <p className="text-sm text-zinc-500 font-medium mt-2 px-1">
                                We'll email you ticket confirmation and invoices
                            </p>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3 pt-4">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={formData.acceptedTerms}
                            onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                            className="mt-1 w-5 h-5 rounded border-2 border-zinc-300 checked:bg-black checked:border-black cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-base text-zinc-700 font-medium cursor-pointer select-none">
                            I have read and accepted the{' '}
                            <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                                terms and conditions
                            </a>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className="w-full h-[56px] bg-black text-white rounded-[12px] text-lg font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
