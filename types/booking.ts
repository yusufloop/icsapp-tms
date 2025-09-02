// types/booking.ts

// Import the official HaulageTariff interface from your service file
import { HaulageTariff } from "@/services/haulageTariffService";

export interface BookingData {
  // --- Step 1 Data ---
  bookingName: string;
  client: string;
  consignee: string;
  date: Date;
  pickupState: string;
  pickupAddress: string;
  pickupTime: Date;
  deliveryState: string;
  deliveryAddress: string;
  deliveryTime: Date;

  // --- Step 2 Data ---
  shipmentType: string;
  containerSize: string;
  items: string[];
  totalGrossWeight: string;
  totalVolume: string;
  demurrageLocation: string;
  daysExpected: string;
  selectedCompliance: string[];
  haulageCompany: string;
  pickupArea: string;
  deliveryArea: string;
  selectedHaulageRate: HaulageTariff | null;

  // --- Step 3 Data ---
  specialInstructions: string;
  requiresInsurance: boolean;
  selectedDriverId: string | null;
}