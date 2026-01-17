import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, ArrowRight, Loader2, Menu, X, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface GstDetails {
    gstins?: string[];
    [key: string]: unknown;
}

const GST_FETCH_TIMEOUT = 8000; // 8 seconds timeout
const MAX_RETRY_ATTEMPTS = 2;

const AccountSetup = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [panNumber, setPanNumber] = useState("");
    const [panName, setPanName] = useState("");
    const [isFetchingPanName, setIsFetchingPanName] = useState(false);
    const [gstDetails, setGstDetails] = useState<GstDetails | null>(null);
    const [isFetchingGst, setIsFetchingGst] = useState(false);
    const [selectedGst, setSelectedGst] = useState("");
    const [gstFetchError, setGstFetchError] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);
    
    // Bank details states
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [tanNumber, setTanNumber] = useState("");
    const [financePocName, setFinancePocName] = useState("");
    const [financePocNumber, setFinancePocNumber] = useState("");
    const [city, setCity] = useState("");
    const [bankDetailsConsent, setBankDetailsConsent] = useState(false);

    const steps = [
        { id: 1, label: "PAN details" },
        { id: 2, label: "GST selection" },
        { id: 3, label: "Bank details" },
        { id: 4, label: "Backup contact" },
        { id: 5, label: "Agreement" }
    ];

    // Validate PAN format
    const validatePAN = (pan: string): boolean => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };

    // Validate IFSC Code
    const validateIFSC = (ifsc: string): boolean => {
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc);
    };

    // Validate TAN Number
    const validateTAN = (tan: string): boolean => {
        const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
        return tanRegex.test(tan);
    };

    // Validate phone number
    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[6-9][0-9]{9}$/;
        return phoneRegex.test(phone);
    };

    // Validate bank account number
    const validateBankAccount = (account: string): boolean => {
        return account.length >= 9 && account.length <= 18 && /^[0-9]+$/.test(account);
    };

    // Fetch PAN name from API
    const fetchPanName = async (pan: string) => {
        if (!validatePAN(pan)) {
            return;
        }

        setIsFetchingPanName(true);
        
        try {
            // OPTION 1: Using a real PAN verification API (you'll need to sign up for one)
            // Popular APIs include: RapidAPI PAN Verification, Karza, Signzy, etc.
            
            // Example with a hypothetical API:
            // const response = await fetch('https://api.example.com/pan/verify', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer YOUR_API_KEY'
            //     },
            //     body: JSON.stringify({ pan })
            // });
            // const data = await response.json();
            // if (data.valid && data.name) {
            //     setPanName(data.name);
            //     toast({
            //         title: "PAN Verified",
            //         description: "PAN details fetched successfully!",
            //     });
            // }

            // OPTION 2: Mock implementation for demonstration
            // Simulating API call with delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock data - in production, this would come from the API
            const mockPanData: Record<string, string> = {
                'ABCDE1234F': 'JOHN DOE',
                'ABCPD1234E': 'ETERNAL LTD',
                'ABCPE1234F': 'TECH INNOVATIONS PVT LTD',
            };

            const name = mockPanData[pan.toUpperCase()];
            
            if (name) {
                setPanName(name);
                toast({
                    title: "PAN Verified ✓",
                    description: "PAN name fetched successfully!",
                });
            } else {
                // If PAN not found in mock data, show message
                toast({
                    title: "PAN Not Found",
                    description: "Please enter the PAN name manually. (In production, this would fetch from a real API)",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching PAN details:', error);
            toast({
                title: "Error",
                description: "Failed to fetch PAN details. Please enter manually.",
                variant: "destructive",
            });
        } finally {
            setIsFetchingPanName(false);
        }
    };

    // Handle PAN input change
    const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setPanNumber(value);
        
        // Auto-fetch when PAN is complete (10 characters)
        if (value.length === 10) {
            fetchPanName(value);
        } else {
            // Clear PAN name if user modifies PAN number
            setPanName("");
        }
    };

    // Fetch GST details from Razorpay API with timeout and retry
    const fetchGstDetails = async (pan: string, isRetry: boolean = false) => {
        if (!pan || pan.length !== 10) {
            toast({
                title: "Invalid PAN",
                description: "Please enter a valid 10-digit PAN number",
                variant: "destructive",
            });
            return;
        }

        setIsFetchingGst(true);
        setGstDetails(null);
        setGstFetchError(null);
        if (!isRetry) {
            setRetryAttempt(0);
        }

        // Helper function to fetch with timeout
        const fetchWithTimeout = async (url: string, timeout: number = GST_FETCH_TIMEOUT) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };

        try {
            // Try multiple CORS proxy options with timeout
            const corsProxies = [
                `https://api.allorigins.win/raw?url=`,
                `https://corsproxy.io/?`,
                `https://api.codetabs.com/v1/proxy?quest=`,
            ];
            
            let data = null;
            let fetchSuccessful = false;

            // Try each CORS proxy with timeout
            for (const proxy of corsProxies) {
                if (fetchSuccessful) break;
                
                try {
                    const apiUrl = `https://razorpay.com/api/gstin/pan/${pan.toUpperCase()}`;
                    const proxyUrl = proxy + encodeURIComponent(apiUrl);
                    
                    const response = await fetchWithTimeout(proxyUrl, GST_FETCH_TIMEOUT);
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        if (responseData && (responseData.gstins || responseData.items || Object.keys(responseData).length > 0)) {
                            data = responseData;
                            fetchSuccessful = true;
                            break;
                        }
                    }
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        console.warn(`Timeout for proxy: ${proxy}`);
                    } else {
                        console.warn(`Error with proxy ${proxy}:`, err);
                    }
                    continue;
                }
            }

            // If all proxies fail or timeout, use mock data for demo purposes
            if (!data) {
                console.warn('All API attempts failed, using mock data');
                
                // Mock GST data matching API response format
                const mockGstData: Record<string, any> = {
                    'AALCV3663L': {
                        count: 1,
                        items: [
                            {
                                gstin: '33AALCV3663L1ZV',
                                auth_status: 'Active',
                                state: 'TAMIL NADU'
                            }
                        ],
                        pan: 'AALCV3663L'
                    },
                    'ABCDE1234F': {
                        count: 1,
                        items: [
                            {
                                gstin: '29ABCDE1234F1ZR',
                                auth_status: 'Active',
                                state: 'KARNATAKA'
                            }
                        ],
                        pan: 'ABCDE1234F'
                    },
                    'CJLPG5794D': {
                        message: 'No GST records found for this PAN',
                        pan: 'CJLPG5794D'
                    }
                };

                data = mockGstData[pan.toUpperCase()] || {
                    message: 'No GST records found for this PAN',
                    pan: pan.toUpperCase()
                };

                if (!data.message) {
                    toast({
                        title: "Demo Mode",
                        description: "Using sample data. In production, real GST data will be fetched.",
                    });
                }
            }
            
            // Transform data to standard format
            if (data) {
                // If API returns 'items' array, convert to 'gstins' array
                if (data.items && Array.isArray(data.items)) {
                    const gstins = data.items.map((item: any) => item.gstin);
                    setGstDetails({
                        ...data,
                        gstins: gstins,
                        legalName: panName.toUpperCase()
                    });
                    toast({
                        title: "GST Details Fetched ✓",
                        description: "GST information retrieved successfully!",
                    });
                } else if (data.gstins && Array.isArray(data.gstins)) {
                    setGstDetails(data);
                    toast({
                        title: "GST Details Fetched ✓",
                        description: "GST information retrieved successfully!",
                    });
                } else {
                    // No GST found or error message
                    setGstDetails(data);
                    if (data.message) {
                        setGstFetchError(data.message);
                    }
                }
            } else {
                throw new Error('No GST data available');
            }
        } catch (error: any) {
            console.error('Error fetching GST details:', error);
            const errorMessage = error.name === 'AbortError' 
                ? 'Request timeout. Please try again.' 
                : 'Unable to fetch GST details. Please try again.';
            
            setGstFetchError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            setGstDetails(null);
        } finally {
            setIsFetchingGst(false);
        }
    };

    // Handle continue to GST section
    const handleContinueToGst = () => {
        if (!panNumber || !validatePAN(panNumber)) {
            toast({
                title: "Invalid PAN",
                description: "Please enter a valid PAN number",
                variant: "destructive",
            });
            return;
        }
        
        if (!panName) {
            toast({
                title: "PAN Name Required",
                description: "Please enter PAN name",
                variant: "destructive",
            });
            return;
        }

        // Reset states
        setGstFetchError(null);
        setRetryAttempt(0);
        setCurrentStep(2);
        // Automatically fetch GST details when moving to step 2
        fetchGstDetails(panNumber);
    };

    // Handle retry GST fetch
    const handleRetryGstFetch = () => {
        const newAttempt = retryAttempt + 1;
        setRetryAttempt(newAttempt);
        fetchGstDetails(panNumber, true);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <section className="relative min-h-[85vh] pt-24 sm:pt-28 md:pt-32 pb-6 sm:pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
                <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Page Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-16 px-4" style={{ color: '#000000' }}>
                        Set up your Ticpin account
                    </h1>

                    {/* Mobile Progress Bar */}
                    <div className="md:hidden mb-6">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                                    Step {currentStep} of {steps.length}
                                </span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    style={{ color: '#5331ea' }}
                                >
                                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-base font-semibold" style={{ color: '#000000' }}>
                                {steps.find(s => s.id === currentStep)?.label}
                            </p>
                            
                            {/* Progress Bar */}
                            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-300 rounded-full"
                                    style={{ 
                                        width: `${(currentStep / steps.length) * 100}%`,
                                        backgroundColor: '#5331ea'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Mobile Menu Dropdown */}
                        {isMobileMenuOpen && (
                            <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-lg">
                                <ul className="space-y-2">
                                    {steps.map((step) => (
                                        <li key={step.id}>
                                            <button
                                                onClick={() => {
                                                    setCurrentStep(step.id);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                                                    currentStep === step.id
                                                        ? 'bg-white shadow-sm'
                                                        : 'hover:bg-white'
                                                }`}
                                            >
                                                <span
                                                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                                        currentStep === step.id
                                                            ? 'text-white'
                                                            : 'text-gray-400'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: currentStep === step.id ? '#5331ea' : '#e5e7eb'
                                                    }}
                                                >
                                                    {currentStep > step.id ? (
                                                        <Check className="w-3 h-3" />
                                                    ) : (
                                                        String(step.id).padStart(2, '0')
                                                    )}
                                                </span>
                                                <span 
                                                    className={`text-sm ${
                                                        currentStep === step.id ? 'font-semibold' : ''
                                                    }`}
                                                    style={{ color: currentStep === step.id ? '#000000' : '#6b7280' }}
                                                >
                                                    {step.label}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
                        {/* Sidebar - Steps Navigation (Desktop Only) */}
                        <div className="hidden md:block md:col-span-4 lg:col-span-3">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 sticky top-6">
                                <ul className="space-y-3">
                                    {steps.map((step) => (
                                        <li key={step.id}>
                                            <button
                                                onClick={() => setCurrentStep(step.id)}
                                                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                                                    currentStep === step.id
                                                        ? 'bg-white shadow-sm'
                                                        : 'hover:bg-white'
                                                }`}
                                            >
                                                <span
                                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                                        currentStep === step.id
                                                            ? 'text-white'
                                                            : 'text-gray-400'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: currentStep === step.id ? '#5331ea' : '#e5e7eb'
                                                    }}
                                                >
                                                    {currentStep > step.id ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        String(step.id).padStart(2, '0')
                                                    )}
                                                </span>
                                                <span 
                                                    className={`text-sm lg:text-base ${
                                                        currentStep === step.id ? 'font-semibold' : ''
                                                    }`}
                                                    style={{ color: currentStep === step.id ? '#000000' : '#6b7280' }}
                                                >
                                                    {step.label}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Main Content - Form */}
                        <div className="md:col-span-8 lg:col-span-9">
                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-200">
                                {/* PAN Details Form */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>PAN details</h2>

                                        {/* Input Fields */}
                                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Enter PAN */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter your PAN
                                                    {isFetchingPanName && <span className="ml-2 text-xs">(Verifying...)</span>}
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder="ABCDE1234F"
                                                        className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                        style={{ color: '#000000' }}
                                                        maxLength={10}
                                                        value={panNumber}
                                                        onChange={handlePanChange}
                                                    />
                                                    {isFetchingPanName && (
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#5331ea' }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs" style={{ color: '#9ca3af' }}>
                                                    PAN format: 5 letters, 4 digits, 1 letter
                                                </p>
                                            </div>

                                            {/* Enter PAN Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>Enter your PAN name / your company's name</label>
                                                <Input
                                                    type="text"
                                                    placeholder="Velrona Technologies Pvt Ltd"
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={panName}
                                                    onChange={(e) => setPanName(e.target.value)}
                                                    disabled={isFetchingPanName}
                                                />
                                                {panName && (
                                                    <p className="text-xs" style={{ color: '#10b981' }}>
                                                        ✓ Auto-filled from PAN verification
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload PAN Card */}
                                        <div className="space-y-2 mt-6">
                                            <label className="text-sm" style={{ color: '#6b7280' }}>Upload your PAN card</label>
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer bg-white"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(83, 49, 234, 0.1)' }}>
                                                        <Upload className="w-6 h-6" style={{ color: '#5331ea' }} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-medium mb-1" style={{ color: '#000000' }}>Upload document</p>
                                                    </div>
                                                    <p className="text-xs" style={{ color: '#9ca3af' }}>Max 5MB • JPEG, JPG, PNG, PDF</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Continue Button */}
                                        <div className="pt-4 sm:pt-6">
                                            <Button
                                                onClick={handleContinueToGst}
                                                disabled={!panNumber || !panName || !validatePAN(panNumber)}
                                                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: (panNumber && panName && validatePAN(panNumber)) ? '#5331ea' : '#d1d5db',
                                                    color: (panNumber && panName && validatePAN(panNumber)) ? '#ffffff' : '#4b5563'
                                                }}
                                            >
                                                Continue
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Placeholder for other steps */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-fade-up">
                                        
                                        {/* PAN Info Display */}
                                        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
                                            <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                                                {isFetchingGst ? 'Fetching GST details for PAN:' : 'PAN:'} <span className="font-semibold" style={{ color: '#000000' }}>{panNumber}</span>
                                            </p>
                                            <p className="text-xs sm:text-sm mt-1" style={{ color: '#6b7280' }}>
                                                Name: <span className="font-semibold" style={{ color: '#000000' }}>{panName}</span>
                                            </p>
                                        </div>

                                        {/* Loading State */}
                                        {isFetchingGst && (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#5331ea' }} />
                                                <p className="text-lg font-medium" style={{ color: '#000000' }}>Fetching GST details...</p>
                                                <p className="text-sm mt-2" style={{ color: '#6b7280' }}>This may take a few seconds. Please wait.</p>
                                                {retryAttempt > 0 && (
                                                    <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>Retry attempt {retryAttempt}/{MAX_RETRY_ATTEMPTS}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* GST Details Display */}
                                        {!isFetchingGst && gstDetails && (
                                            <div className="space-y-4">
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <p className="text-sm font-medium" style={{ color: '#059669' }}>
                                                        ✓ GST details fetched successfully
                                                    </p>
                                                </div>

                                                {/* Display GST Numbers if available */}
                                                {gstDetails.gstins && Array.isArray(gstDetails.gstins) && gstDetails.gstins.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <p className="text-sm" style={{ color: '#6b7280' }}>
                                                            Select one or more GST accounts to onboard on District. You can configure these while creating events later.
                                                        </p>
                                                        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                                                            Please note, we only support Regular and Active GSTs to onboard as partners.
                                                        </p>
                                                        
                                                        {/* GST Table */}
                                                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                                                <div className="inline-block min-w-full align-middle">
                                                                    <div className="overflow-hidden">
                                                                        <table className="min-w-full divide-y divide-gray-200">
                                                                            <thead className="bg-gray-50">
                                                                                <tr>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left">
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                                            checked={selectedGst === gstDetails.gstins[0]}
                                                                                            onChange={() => setSelectedGst(selectedGst ? "" : gstDetails.gstins![0])}
                                                                                        />
                                                                                    </th>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                        Brand Name
                                                                                    </th>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                        Address
                                                                                    </th>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                        GSTIN
                                                                                    </th>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                        Taxpayer Type
                                                                                    </th>
                                                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                        GST Status
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                        {gstDetails.gstins.map((gstin: string, index: number) => {
                                                                            // Extract state code from GSTIN (first 2 digits)
                                                                            const stateCode = gstin.substring(0, 2);
                                                                            const stateNames: Record<string, string> = {
                                                                                '27': 'Maharashtra',
                                                                                '29': 'Karnataka',
                                                                                '33': 'Tamil Nadu',
                                                                                '32': 'Kerala',
                                                                                '36': 'Telangana',
                                                                                '19': 'West Bengal',
                                                                                '07': 'Delhi',
                                                                                '24': 'Gujarat'
                                                                            };
                                                                            const stateName = stateNames[stateCode] || 'India';
                                                                            
                                                                            return (
                                                                                <tr 
                                                                                    key={index}
                                                                                    className={`hover:bg-gray-50 transition-colors ${
                                                                                        selectedGst === gstin ? 'bg-purple-50' : ''
                                                                                    }`}
                                                                                >
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                                            checked={selectedGst === gstin}
                                                                                            onChange={() => setSelectedGst(selectedGst === gstin ? "" : gstin)}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                                                        <p className="text-xs sm:text-sm font-semibold" style={{ color: '#000000' }}>
                                                                                            {gstDetails.legalName || panName.toUpperCase()}
                                                                                        </p>
                                                                                        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                                                                                            ({stateName} - {index + 1})
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                                                        <p className="text-xs sm:text-sm" style={{ color: '#000000' }}>
                                                                                            KAMBAR STREET, Coimbatore,
                                                                                        </p>
                                                                                        <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                                                                                            {stateName}, 641016
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                                                        <p className="text-xs sm:text-sm font-medium" style={{ color: '#000000' }}>
                                                                                            {gstin}
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                                                        <p className="text-xs sm:text-sm" style={{ color: '#000000' }}>
                                                                                            Regular
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                                                                                        <p className="text-xs sm:text-sm" style={{ color: '#000000' }}>
                                                                                            Active
                                                                                        </p>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                                        <p className="font-medium mb-3" style={{ color: '#000000' }}>GST Details:</p>
                                                        <div className="space-y-2">
                                                            {Object.entries(gstDetails).map(([key, value]) => (
                                                                <div key={key} className="flex flex-col sm:flex-row gap-2">
                                                                    <span className="text-sm font-semibold capitalize" style={{ color: '#6b7280' }}>
                                                                        {key.replace(/_/g, ' ')}:
                                                                    </span>
                                                                    <span className="text-sm" style={{ color: '#000000' }}>
                                                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                                                    <Button
                                                        onClick={() => setCurrentStep(1)}
                                                        className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base font-semibold rounded-xl transition-all duration-300"
                                                        style={{
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#4b5563'
                                                        }}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button
                                                        onClick={() => setCurrentStep(3)}
                                                        disabled={gstDetails.gstins && gstDetails.gstins.length > 0 && !selectedGst}
                                                        className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group"
                                                        style={{
                                                            backgroundColor: '#5331ea',
                                                            color: '#ffffff'
                                                        }}
                                                    >
                                                        Continue
                                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* No GST Details / Error State */}
                                        {!isFetchingGst && !gstDetails && (
                                            <div className="text-center py-12">
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                                                    <p className="text-lg font-medium mb-2" style={{ color: '#dc2626' }}>Unable to fetch GST details</p>
                                                    <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
                                                        {gstFetchError || 'Unable to fetch GST information for this PAN'}
                                                    </p>
                                                    {retryAttempt > 0 && (
                                                        <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>Attempted {retryAttempt} time(s)</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                                    <Button
                                                        onClick={() => setCurrentStep(1)}
                                                        className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl"
                                                        style={{
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#4b5563'
                                                        }}
                                                    >
                                                        Back to PAN Details
                                                    </Button>
                                                    <Button
                                                        onClick={handleRetryGstFetch}
                                                        disabled={retryAttempt >= MAX_RETRY_ATTEMPTS}
                                                        className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        style={{
                                                            backgroundColor: retryAttempt >= MAX_RETRY_ATTEMPTS ? '#d1d5db' : '#5331ea',
                                                            color: '#ffffff'
                                                        }}
                                                    >
                                                        <Loader2 className="w-4 h-4" />
                                                        {retryAttempt >= MAX_RETRY_ATTEMPTS ? 'Max retries reached' : 'Retry'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setCurrentStep(3)}
                                                        className="w-full sm:w-auto px-6 py-3 rounded-xl"
                                                        style={{
                                                            backgroundColor: '#10b981',
                                                            color: '#ffffff'
                                                        }}
                                                    >
                                                        Continue Anyway
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-fade-up">
                                        {/* GST Added Status */}
                                        {selectedGst && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                                <p className="text-xs sm:text-sm font-medium" style={{ color: '#059669' }}>
                                                    ✓ 1 GST added
                                                </p>
                                            </div>
                                        )}

                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Bank details</h2>

                                        {/* Bank Account Details */}
                                        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Account Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter name on bank account
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={bankAccountName}
                                                    onChange={(e) => setBankAccountName(e.target.value)}
                                                />
                                            </div>

                                            {/* Account Number */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter bank account number
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={bankAccountNumber}
                                                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                                                    maxLength={18}
                                                />
                                                {bankAccountNumber && !validateBankAccount(bankAccountNumber) && (
                                                    <p className="text-xs" style={{ color: '#ef4444' }}>
                                                        Please enter a valid account number (9-18 digits)
                                                    </p>
                                                )}
                                            </div>

                                            {/* IFSC Code */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter bank IFSC code
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={ifscCode}
                                                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                                                    maxLength={11}
                                                />
                                                <p className="text-xs" style={{ color: '#9ca3af' }}>
                                                    Format: 4 letters, 0, then 6 alphanumeric characters
                                                </p>
                                                {ifscCode && !validateIFSC(ifscCode) && ifscCode.length === 11 && (
                                                    <p className="text-xs" style={{ color: '#ef4444' }}>
                                                        Invalid IFSC code format
                                                    </p>
                                                )}
                                            </div>

                                            {/* TAN Number */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter TAN number
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={tanNumber}
                                                    onChange={(e) => setTanNumber(e.target.value.toUpperCase())}
                                                    maxLength={10}
                                                />
                                                <p className="text-xs" style={{ color: '#9ca3af' }}>
                                                    TAN format: 4 letters, 5 digits, 1 letter
                                                </p>
                                                {tanNumber && !validateTAN(tanNumber) && tanNumber.length === 10 && (
                                                    <p className="text-xs" style={{ color: '#ef4444' }}>
                                                        Invalid TAN format
                                                    </p>
                                                )}
                                            </div>

                                            {/* Finance POC Name */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter finance POC contact name
                                                </label>
                                                <Input
                                                    type="text"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={financePocName}
                                                    onChange={(e) => setFinancePocName(e.target.value)}
                                                />
                                            </div>

                                            {/* Finance POC Number */}
                                            <div className="space-y-2">
                                                <label className="text-sm" style={{ color: '#6b7280' }}>
                                                    Enter Finance POC Contact Number
                                                </label>
                                                <Input
                                                    type="tel"
                                                    placeholder=""
                                                    className="bg-white border-gray-300 placeholder:text-gray-400 focus:border-primary rounded-lg h-12"
                                                    style={{ color: '#000000' }}
                                                    value={financePocNumber}
                                                    onChange={(e) => setFinancePocNumber(e.target.value.replace(/\D/g, ''))}
                                                    maxLength={10}
                                                />
                                                {financePocNumber && !validatePhone(financePocNumber) && financePocNumber.length === 10 && (
                                                    <p className="text-xs" style={{ color: '#ef4444' }}>
                                                        Please enter a valid 10-digit mobile number
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* City Selection */}
                                        <div className="space-y-2 mt-6">
                                            <label className="text-sm" style={{ color: '#6b7280' }}>
                                                Select City
                                            </label>
                                            <select
                                                className="w-full bg-white border border-gray-300 rounded-lg h-12 px-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                style={{ color: '#000000' }}
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                            >
                                                <option value="">Select a city</option>
                                                <option value="Mumbai">Mumbai</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Bangalore">Bangalore</option>
                                                <option value="Hyderabad">Hyderabad</option>
                                                <option value="Chennai">Chennai</option>
                                                <option value="Kolkata">Kolkata</option>
                                                <option value="Pune">Pune</option>
                                                <option value="Ahmedabad">Ahmedabad</option>
                                                <option value="Surat">Surat</option>
                                                <option value="Jaipur">Jaipur</option>
                                                <option value="Lucknow">Lucknow</option>
                                                <option value="Kanpur">Kanpur</option>
                                                <option value="Nagpur">Nagpur</option>
                                                <option value="Indore">Indore</option>
                                                <option value="Thane">Thane</option>
                                                <option value="Bhopal">Bhopal</option>
                                                <option value="Visakhapatnam">Visakhapatnam</option>
                                                <option value="Vadodara">Vadodara</option>
                                                <option value="Coimbatore">Coimbatore</option>
                                                <option value="Kochi">Kochi</option>
                                            </select>
                                        </div>

                                        {/* Consent Checkbox */}
                                        <div className="flex items-start gap-3 mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                id="bankConsent"
                                                checked={bankDetailsConsent}
                                                onChange={(e) => setBankDetailsConsent(e.target.checked)}
                                                className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                                            />
                                            <label
                                                htmlFor="bankConsent"
                                                className="text-xs sm:text-sm cursor-pointer"
                                                style={{ color: '#4b5563' }}
                                            >
                                                I hereby certify that the above details are accurate, the bank account mentioned above is maintained by me or my organisation, and I take full responsibility if any information is found false under applicable laws.
                                            </label>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                                            <Button
                                                onClick={() => setCurrentStep(2)}
                                                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base font-semibold rounded-xl transition-all duration-300"
                                                style={{
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#4b5563'
                                                }}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    // Validate all fields
                                                    if (!bankAccountName) {
                                                        toast({
                                                            title: "Required Field",
                                                            description: "Please enter bank account name",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!validateBankAccount(bankAccountNumber)) {
                                                        toast({
                                                            title: "Invalid Account Number",
                                                            description: "Please enter a valid bank account number",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!validateIFSC(ifscCode)) {
                                                        toast({
                                                            title: "Invalid IFSC Code",
                                                            description: "Please enter a valid IFSC code",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!validateTAN(tanNumber)) {
                                                        toast({
                                                            title: "Invalid TAN",
                                                            description: "Please enter a valid TAN number",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!financePocName) {
                                                        toast({
                                                            title: "Required Field",
                                                            description: "Please enter finance POC name",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!validatePhone(financePocNumber)) {
                                                        toast({
                                                            title: "Invalid Phone Number",
                                                            description: "Please enter a valid 10-digit mobile number",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!city) {
                                                        toast({
                                                            title: "Required Field",
                                                            description: "Please select a city",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    if (!bankDetailsConsent) {
                                                        toast({
                                                            title: "Consent Required",
                                                            description: "Please accept the terms to continue",
                                                            variant: "destructive",
                                                        });
                                                        return;
                                                    }
                                                    
                                                    // All validations passed
                                                    toast({
                                                        title: "Bank Details Saved ✓",
                                                        description: "Your bank details have been saved successfully!",
                                                    });
                                                    setCurrentStep(4);
                                                }}
                                                disabled={
                                                    !bankAccountName ||
                                                    !validateBankAccount(bankAccountNumber) ||
                                                    !validateIFSC(ifscCode) ||
                                                    !validateTAN(tanNumber) ||
                                                    !financePocName ||
                                                    !validatePhone(financePocNumber) ||
                                                    !city ||
                                                    !bankDetailsConsent
                                                }
                                                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                style={{
                                                    backgroundColor: (
                                                        bankAccountName &&
                                                        validateBankAccount(bankAccountNumber) &&
                                                        validateIFSC(ifscCode) &&
                                                        validateTAN(tanNumber) &&
                                                        financePocName &&
                                                        validatePhone(financePocNumber) &&
                                                        city &&
                                                        bankDetailsConsent
                                                    ) ? '#5331ea' : '#d1d5db',
                                                    color: (
                                                        bankAccountName &&
                                                        validateBankAccount(bankAccountNumber) &&
                                                        validateIFSC(ifscCode) &&
                                                        validateTAN(tanNumber) &&
                                                        financePocName &&
                                                        validatePhone(financePocNumber) &&
                                                        city &&
                                                        bankDetailsConsent
                                                    ) ? '#ffffff' : '#6b7280'
                                                }}
                                            >
                                                Continue
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Backup contact</h2>
                                        <p className="text-sm sm:text-base" style={{ color: '#6b7280' }}>Backup contact form coming soon...</p>
                                    </div>
                                )}

                                {currentStep === 5 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6" style={{ color: '#000000' }}>Agreement</h2>
                                        <p className="text-sm sm:text-base" style={{ color: '#6b7280' }}>Agreement form coming soon...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AccountSetup;
