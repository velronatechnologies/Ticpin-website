import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface GstDetails {
    gstins?: string[];
    [key: string]: unknown;
}

const AccountSetup = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [panNumber, setPanNumber] = useState("");
    const [panName, setPanName] = useState("");
    const [isFetchingPanName, setIsFetchingPanName] = useState(false);
    const [gstDetails, setGstDetails] = useState<GstDetails | null>(null);
    const [isFetchingGst, setIsFetchingGst] = useState(false);
    const [selectedGst, setSelectedGst] = useState("");

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

    // Fetch GST details from Razorpay API
    const fetchGstDetails = async (pan: string) => {
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

        try {
            // Try multiple CORS proxy options
            const corsProxies = [
                `https://api.allorigins.win/raw?url=`,
                `https://corsproxy.io/?`,
            ];
            
            let data = null;
            let lastError = null;

            // Try each CORS proxy
            for (const proxy of corsProxies) {
                try {
                    const apiUrl = `https://razorpay.com/api/gstin/pan/${pan.toUpperCase()}`;
                    const response = await fetch(proxy + encodeURIComponent(apiUrl), {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        if (responseData && (responseData.gstins || Object.keys(responseData).length > 0)) {
                            data = responseData;
                            break;
                        }
                    }
                } catch (err) {
                    lastError = err;
                    continue;
                }
            }

            // If all proxies fail, use mock data for demo purposes
            if (!data) {
                console.warn('All CORS proxies failed, using mock data');
                
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
                    }
                };

                data = mockGstData[pan.toUpperCase()] || {
                    message: 'No GST records found for this PAN',
                    pan: pan.toUpperCase()
                };

                toast({
                    title: "Demo Mode",
                    description: "Using sample data. In production, real GST data will be fetched.",
                });
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
                } else if (data.gstins) {
                    setGstDetails(data);
                } else {
                    setGstDetails(data);
                }
                
                if (!data.message) {
                    toast({
                        title: "GST Details Fetched ✓",
                        description: "GST information retrieved successfully!",
                    });
                }
            } else {
                throw new Error('No GST data available');
            }
        } catch (error) {
            console.error('Error fetching GST details:', error);
            toast({
                title: "Error",
                description: "Unable to fetch GST details. Please try again later.",
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

        setCurrentStep(2);
        // Automatically fetch GST details when moving to step 2
        fetchGstDetails(panNumber);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <section className="relative min-h-[85vh] py-12 md:py-20 px-4">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
                <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Page Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16" style={{ color: '#000000' }}>
                        Set up your District account
                    </h1>

                    <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                        {/* Sidebar - Steps Navigation */}
                        <div className="md:col-span-3">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <ul className="space-y-4">
                                    {steps.map((step) => (
                                        <li key={step.id}>
                                            <button
                                                onClick={() => setCurrentStep(step.id)}
                                                className={`w-full text-left flex items-center gap-3 transition-all duration-200 ${currentStep === step.id
                                                    ? 'font-semibold'
                                                    : 'hover:text-gray-900'
                                                    }`}
                                                style={{ color: currentStep === step.id ? '#000000' : '#9ca3af' }}
                                            >
                                                <span
                                                    className={`text-sm font-medium`}
                                                    style={{ color: currentStep === step.id ? '#000000' : '#d1d5db' }}
                                                >
                                                    {String(step.id).padStart(2, '0')}
                                                </span>
                                                <span className="text-sm md:text-base">{step.label}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Main Content - Form */}
                        <div className="md:col-span-9">
                            <div className="bg-gray-50 rounded-2xl p-8 md:p-10 border border-gray-200">
                                {/* PAN Details Form */}
                                {currentStep === 1 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>PAN details</h2>

                                        {/* Input Fields */}
                                        <div className="grid md:grid-cols-2 gap-6">
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
                                        <div className="pt-6">
                                            <Button
                                                onClick={handleContinueToGst}
                                                disabled={!panNumber || !panName || !validatePAN(panNumber)}
                                                className="px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                                            <p className="text-sm" style={{ color: '#6b7280' }}>
                                                Fetching GST details for PAN: <span className="font-semibold" style={{ color: '#000000' }}>{panNumber}</span>
                                            </p>
                                            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                                                Name: <span className="font-semibold" style={{ color: '#000000' }}>{panName}</span>
                                            </p>
                                        </div>

                                        {/* Loading State */}
                                        {isFetchingGst && (
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#5331ea' }} />
                                                <p className="text-lg font-medium" style={{ color: '#000000' }}>Fetching GST details...</p>
                                                <p className="text-sm mt-2" style={{ color: '#6b7280' }}>Please wait while we retrieve your GST information</p>
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
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-4 py-3 text-left">
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    className="w-4 h-4 rounded border-gray-300"
                                                                                    checked={selectedGst === gstDetails.gstins[0]}
                                                                                    onChange={() => setSelectedGst(selectedGst ? "" : gstDetails.gstins![0])}
                                                                                />
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                Brand Name
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                Address
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                GSTIN
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                Taxpayer Type
                                                                            </th>
                                                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6b7280' }}>
                                                                                GST Status
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-200">
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
                                                                                    <td className="px-4 py-4">
                                                                                        <input 
                                                                                            type="checkbox" 
                                                                                            className="w-4 h-4 rounded border-gray-300"
                                                                                            checked={selectedGst === gstin}
                                                                                            onChange={() => setSelectedGst(selectedGst === gstin ? "" : gstin)}
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <p className="text-sm font-semibold" style={{ color: '#000000' }}>
                                                                                            {gstDetails.legalName || panName.toUpperCase()}
                                                                                        </p>
                                                                                        <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                                                                                            ({stateName} - {index + 1})
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <p className="text-sm" style={{ color: '#000000' }}>
                                                                                            KAMBAR STREET, Coimbatore,
                                                                                        </p>
                                                                                        <p className="text-sm" style={{ color: '#6b7280' }}>
                                                                                            {stateName}, 641016
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <p className="text-sm font-medium" style={{ color: '#000000' }}>
                                                                                            {gstin}
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <p className="text-sm" style={{ color: '#000000' }}>
                                                                                            Regular
                                                                                        </p>
                                                                                    </td>
                                                                                    <td className="px-4 py-4">
                                                                                        <p className="text-sm" style={{ color: '#000000' }}>
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
                                                <div className="flex gap-4 pt-6">
                                                    <Button
                                                        onClick={() => setCurrentStep(1)}
                                                        className="px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
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
                                                        className="px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
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
                                                <p className="text-lg font-medium mb-2" style={{ color: '#000000' }}>No GST details found</p>
                                                <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Unable to fetch GST information for this PAN</p>
                                                <div className="flex gap-4 justify-center">
                                                    <Button
                                                        onClick={() => setCurrentStep(1)}
                                                        className="px-6 py-3 rounded-xl"
                                                        style={{
                                                            backgroundColor: '#f3f4f6',
                                                            color: '#4b5563'
                                                        }}
                                                    >
                                                        Back to PAN Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => fetchGstDetails(panNumber)}
                                                        className="px-6 py-3 rounded-xl"
                                                        style={{
                                                            backgroundColor: '#5331ea',
                                                            color: '#ffffff'
                                                        }}
                                                    >
                                                        Retry
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>Bank details</h2>
                                        <p style={{ color: '#6b7280' }}>Bank details form coming soon...</p>
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>Backup contact</h2>
                                        <p style={{ color: '#6b7280' }}>Backup contact form coming soon...</p>
                                    </div>
                                )}

                                {currentStep === 5 && (
                                    <div className="space-y-6 animate-fade-up">
                                        <h2 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>Agreement</h2>
                                        <p style={{ color: '#6b7280' }}>Agreement form coming soon...</p>
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
