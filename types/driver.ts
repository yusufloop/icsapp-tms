export interface Driver {
  driver_id: string;
  user_id?: string;
  license_no?: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'Available' | 'Busy' | 'Offline';
  current_location?: string;
  assigned_bookings?: number;
  last_updated?: string;
  current_job?: {
    origin: string;
    destination: string;
    date: string;
    time: string;
    totalVolume: string;
    totalGrossWeight: string;
    shipmentType: string;
    containerSize: string;
    twinning: string;
  } | null;
}
