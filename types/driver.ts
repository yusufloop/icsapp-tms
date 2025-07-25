export interface Vehicle {
  id: string;
  name?: string;
  no_plate?: string;
  type_vehicle?: string;
  driver_id: string;
  created_at?: string;
}

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
  vehicle?: Vehicle;
  no_plate?: string;
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
