'use client';

import React from 'react';
import OrganizerHeader from '@/components/organizer/OrganizerHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, IndianRupee, Users, Activity, Clock, CheckCircle, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsData {
    totalCollectedAmount: number;
    totalRefundedAmount: number;
    totalNetRevenue: number;
    totalBookings: number;
    chartData: Array<{
        date: string;
        collected: number;
        refunded: number;
    }>;
    totalPayoutAmount: number;
    pendingPayoutAmount: number;
    approvedPayoutAmount: number;
    rejected_payout_amount: number;
}

export default function AnalyticsClient({ initialData, initialFilter, organizerId }: { 
    initialData: AnalyticsData, 
    initialFilter: string,
    organizerId: string 
}) {
    const [filter, setFilter] = React.useState(initialFilter);
    const [data, setData] = React.useState(initialData);
    const [loading, setLoading] = React.useState(false);

    const handleFilterChange = async (newFilter: string) => {
        setFilter(newFilter);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/organizer/analytics?filter=${newFilter}`, {
                headers: { 'Authorization': `Bearer ${organizerId}` }
            });
            const result = await res.json();
            if (result.chartData && result.chartData.length > 0) {
                result.chartData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }
            setData(result);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-[family-name:var(--font-anek-latin)] bg-[#F8F9FA]">
            <OrganizerHeader />

            <main className="flex-1 px-8 md:px-14 lg:px-20 py-16">
                <div className="max-w-[1228px] mx-auto w-full space-y-12">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-[40px] font-bold text-black leading-tight">
                                Performance Analytics
                            </h1>
                            <p className="text-[20px] font-medium text-[#686868] mt-2">
                                Track your revenue, bookings, and refunds
                            </p>
                        </div>
                        
                        <div className="bg-white border border-[#E9E9E9] rounded-xl p-1 flex">
                            {['all', 'month', 'week'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => handleFilterChange(f)}
                                    disabled={loading}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                                        filter === f ? 'bg-black text-white shadow-md' : 'text-[#686868] hover:bg-zinc-50'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {f === 'all' ? 'All Time' : `Last ${f}`}
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight className="text-green-600" size={16} />
                                    <span className="text-sm font-semibold text-green-700">+12.5% vs last period</span>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="text-blue-600" size={16} />
                                    <span className="text-sm font-semibold text-blue-700">Updated today</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#AEAEAE] opacity-50" />

                    {loading ? (
                        <div className="animate-pulse space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-200 rounded-3xl" />)}
                            </div>
                            <div className="h-[400px] bg-zinc-200 rounded-3xl" />
                        </div>
                    ) : (
                        <>
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <GradientMetricCard
                                    title="Net Revenue"
                                    value={`₹${data?.totalNetRevenue?.toLocaleString('en-IN') || 0}`}
                                    change="+12.5%"
                                    positive={true}
                                    gradient="from-[#5331EA] to-[#866BFF]"
                                    icon={<TrendingUp size={24} className="text-white" />}
                                />
                                <GradientMetricCard
                                    title="Total Collected"
                                    value={`₹${data?.totalCollectedAmount?.toLocaleString('en-IN') || 0}`}
                                    change="+8.2%"
                                    positive={true}
                                    gradient="from-[#5331EA] to-[#866BFF]"
                                    icon={<IndianRupee size={24} className="text-white" />}
                                />
                                <GradientMetricCard
                                    title="Total Refunded"
                                    value={`₹${data?.totalRefundedAmount?.toLocaleString('en-IN') || 0}`}
                                    change="-2.1%"
                                    positive={false}
                                    gradient="from-[#5331EA] to-[#866BFF]"
                                    icon={<Activity size={24} className="text-white" />}
                                />
                                <GradientMetricCard
                                    title="Total Bookings"
                                    value={`${data?.totalBookings || 0}`}
                                    change="+15.3%"
                                    positive={true}
                                    gradient="from-[#5331EA] to-[#866BFF]"
                                    icon={<Users size={24} className="text-white" />}
                                />
                            </div>

                            {/* Payout Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    title="Total Payouts"
                                    value={`₹${data?.totalPayoutAmount?.toLocaleString('en-IN') || 0}`}
                                    icon={<IndianRupee size={24} className="text-[#5331EA]" />}
                                    bgColor="bg-[#EEEDFC]"
                                    borderColor="border-[#5331EA]/30"
                                />
                                <MetricCard
                                    title="Pending Payouts"
                                    value={`₹${data?.pendingPayoutAmount?.toLocaleString('en-IN') || 0}`}
                                    icon={<Clock size={24} className="text-[#E7C200]" />}
                                    bgColor="bg-[#FFFCED]"
                                    borderColor="border-[#E7C200]/30"
                                />
                                <MetricCard
                                    title="Approved Payouts"
                                    value={`₹${data?.approvedPayoutAmount?.toLocaleString('en-IN') || 0}`}
                                    icon={<CheckCircle size={24} className="text-[#5331EA]" />}
                                    bgColor="bg-[#EEEDFC]"
                                    borderColor="border-[#5331EA]/30"
                                />
                            </div>

                            {/* Revenue Chart */}
                            <div className="bg-white p-8 border border-zinc-200 rounded-[32px] shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-black">Revenue & Refunds Timeline</h3>
                                    <div className="flex gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#5331EA]" />
                                            <span className="text-zinc-600">Collected</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#E7C200]" />
                                            <span className="text-zinc-600">Refunded</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {data?.chartData?.length ? (
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={data.chartData}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#5331EA" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#5331EA" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorRefunded" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#E7C200" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#E7C200" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis 
                                                    dataKey="date" 
                                                    tickFormatter={(str) => {
                                                        const date = new Date(str);
                                                        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                                                    }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: '#686868', fontSize: 13 }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    tickFormatter={(val) => `₹${val}`}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tick={{ fill: '#686868', fontSize: 13 }}
                                                    dx={-10}
                                                />
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E9E9" />
                                                <RechartsTooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                                    formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                                                    labelFormatter={(label: any) => new Date(label).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric'})}
                                                />
                                                <Area type="monotone" dataKey="collected" stroke="#5331EA" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                                                <Area type="monotone" dataKey="refunded" stroke="#E7C200" strokeWidth={3} fillOpacity={1} fill="url(#colorRefunded)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[400px] w-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-[24px]">
                                        <TrendingUp size={48} className="text-zinc-300 mb-4" />
                                        <p className="text-zinc-500 font-medium">No sales data available for this period.</p>
                                    </div>
                                )}
                            </div>

                            {/* Additional Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue Distribution Pie Chart */}
                                <div className="bg-white p-8 border border-zinc-200 rounded-[32px] shadow-sm">
                                    <h3 className="text-xl font-bold text-black mb-6">Revenue Distribution</h3>
                                    <div className="h-[300px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Net Revenue', value: data?.totalNetRevenue || 0, color: '#5331EA' },
                                                        { name: 'Refunds', value: data?.totalRefundedAmount || 0, color: '#E7C200' },
                                                        { name: 'Pending Payouts', value: data?.pendingPayoutAmount || 0, color: '#866BFF' }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                                    labelLine={false}
                                                >
                                                    {[
                                                        { name: 'Net Revenue', color: '#5331EA' },
                                                        { name: 'Refunds', color: '#E7C200' },
                                                        { name: 'Pending Payouts', color: '#866BFF' }
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Performance Summary */}
                                <div className="bg-[#EEEDFC] p-8 rounded-[32px] shadow-sm border border-[#5331EA]/20">
                                    <h3 className="text-xl font-bold text-black mb-6">Performance Summary</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#5331EA]/10 flex items-center justify-center">
                                                    <TrendingUp size={20} className="text-[#5331EA]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-600">Growth Rate</p>
                                                    <p className="text-lg font-bold text-black">+12.5%</p>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="text-[#5331EA]" size={24} />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#5331EA]/10 flex items-center justify-center">
                                                    <DollarSign size={20} className="text-[#5331EA]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-600">Avg. Revenue/Booking</p>
                                                    <p className="text-lg font-bold text-black">₹{data?.totalBookings ? Math.round(data.totalNetRevenue / data.totalBookings).toLocaleString('en-IN') : 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#E7C200]/20 flex items-center justify-center">
                                                    <Users size={20} className="text-[#E7C200]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-zinc-600">Conversion Rate</p>
                                                    <p className="text-lg font-bold text-black">24.8%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function MetricCard({ title, value, icon, bgColor, borderColor, isNegative }: { title: string, value: string, icon: React.ReactNode, bgColor: string, borderColor?: string, isNegative?: boolean }) {
    return (
        <div className={`bg-white p-6 border ${borderColor || 'border-zinc-200'} rounded-[24px] shadow-sm flex flex-col gap-4 transition-transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[14px] font-semibold text-[#686868] uppercase tracking-wider mb-1">{title}</p>
                <h3 className={`text-[32px] font-bold leading-none ${isNegative ? 'text-red-600' : 'text-black'}`}>
                    {value}
                </h3>
            </div>
        </div>
    );
}

function GradientMetricCard({ title, value, change, positive, gradient, icon }: { 
    title: string, 
    value: string, 
    change: string, 
    positive: boolean, 
    gradient: string, 
    icon: React.ReactNode 
}) {
    return (
        <div className={`bg-gradient-to-br ${gradient} p-6 rounded-[24px] shadow-lg text-white flex flex-col gap-4 transition-transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${positive ? 'bg-white/20' : 'bg-red-500/30'}`}>
                    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[14px] font-semibold text-white/80 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-[32px] font-bold leading-none">
                    {value}
                </h3>
            </div>
        </div>
    );
}
