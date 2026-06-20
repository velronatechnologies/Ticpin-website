export interface BookingData {
  id: string;
  booking_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  order_amount: number;
  discount_amount: number;
  grand_total: number;
  status: string;
  booked_at: string;
  booking_category: string;
  payout_status: string;
  tickets?: Array<{
    category: string;
    quantity: number;
    price: number;
  }>;
}

export interface Verifier {
  phone: string;
  gate: string;
  password?: string;
  created_at?: string;
}

export interface OverviewData {
  totalBookings: number;
  totalViews: number;
  conversionRate: number;
  netRevenue: number;
  salesVelocity: Array<{ category: string; velocity: string; rate: string }>;
  revenueByTier: Array<{ category: string; price: number; sold: number; revenue: number; revenueContribution: number }>;
}

export interface DashboardTheme {
  bg: string;
  accent: string;
  accentLight: string;
  buttonColor: string;
}
