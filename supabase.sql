-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.approval (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  approval_type character varying,
  booking_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT approval_pkey PRIMARY KEY (id, booking_id),
  CONSTRAINT approval_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.booking_driver_assignments (
  booking_id uuid NOT NULL,
  driver_id uuid NOT NULL,
  assigned_by uuid,
  notes text,
  estimated_duration interval,
  actual_start_time timestamp with time zone,
  actual_end_time timestamp with time zone,
  assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  status text DEFAULT 'ASSIGNED'::text CHECK (status = ANY (ARRAY['ASSIGNED'::text, 'ACCEPTED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text])),
  CONSTRAINT booking_driver_assignments_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT booking_driver_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id),
  CONSTRAINT booking_driver_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id),
  CONSTRAINT booking_driver_assignments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.booking_statuses (
  status_id integer,
  updated_by uuid,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  booking_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT booking_statuses_pkey PRIMARY KEY (booking_id),
  CONSTRAINT booking_statuses_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses_master(status_id),
  CONSTRAINT booking_statuses_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.booking_templates (
  user_id uuid NOT NULL,
  template_name text NOT NULL,
  template_data jsonb NOT NULL,
  template_id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT booking_templates_pkey PRIMARY KEY (template_id),
  CONSTRAINT booking_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.bookings (
  booking_name text,
  estimated_total numeric,
  special_instructions text,
  priority text DEFAULT 'MEDIUM'::text CHECK (priority = ANY (ARRAY['LOW'::text, 'MEDIUM'::text, 'HIGH'::text, 'URGENT'::text])),
  booking_reference text,
  template_used uuid,
  total_weight_kg numeric,
  total_volume_cbm numeric,
  consignee text,
  date_booking date,
  pickup_address text,
  pickup_time timestamp without time zone,
  delivery_state text,
  delivery_address text,
  delivery_time timestamp without time zone,
  pickup_state text,
  client_id uuid,
  shipment_type USER-DEFINED,
  container_size USER-DEFINED,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  booking_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT bookings_pkey PRIMARY KEY (booking_id),
  CONSTRAINT bookings_template_used_fkey FOREIGN KEY (template_used) REFERENCES public.booking_templates(template_id),
  CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id)
);
CREATE TABLE public.charges (
  booking_id uuid,
  haulage_fee numeric,
  twinning_fee numeric,
  total numeric,
  charge_id uuid NOT NULL DEFAULT gen_random_uuid(),
  compliance_fee numeric,
  CONSTRAINT charges_pkey PRIMARY KEY (charge_id),
  CONSTRAINT charges_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.compliance_charges (
  booking_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name_compliance character varying,
  price real,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT compliance_charges_pkey PRIMARY KEY (id),
  CONSTRAINT compliance_charges_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.demurrage_charges (
  location text,
  booking_id uuid,
  days_overdue integer,
  daily_rate numeric,
  demurrage_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT demurrage_charges_pkey PRIMARY KEY (demurrage_id),
  CONSTRAINT demurrage_charges_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.driver_current_jobs (
  driver_id uuid NOT NULL,
  booking_id uuid,
  job_type text NOT NULL,
  location_from text,
  location_to text,
  estimated_arrival timestamp with time zone,
  completed_at timestamp with time zone,
  job_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'IN_PROGRESS'::text CHECK (status = ANY (ARRAY['IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text])),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT driver_current_jobs_pkey PRIMARY KEY (job_id),
  CONSTRAINT driver_current_jobs_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id),
  CONSTRAINT driver_current_jobs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.driver_statuses (
  status_id integer,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  driver_id uuid NOT NULL,
  updated_by uuid,
  CONSTRAINT driver_statuses_pkey PRIMARY KEY (driver_id),
  CONSTRAINT driver_statuses_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id),
  CONSTRAINT driver_statuses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT driver_statuses_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses_master(status_id)
);
CREATE TABLE public.drivers (
  phone text,
  emergency_contact jsonb,
  profile_image_url text,
  current_location jsonb,
  vehicle_plate_number text,
  vehicle_type text,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
  total_jobs_completed integer DEFAULT 0,
  is_available boolean DEFAULT true,
  user_id uuid,
  license_no character varying,
  driver_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT drivers_pkey PRIMARY KEY (driver_id),
  CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.haulage_companies (
  company_name text NOT NULL,
  company_code text NOT NULL UNIQUE,
  contact_phone text,
  contact_email text,
  annual_rank integer,
  company_id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text DEFAULT 'ACTIVE'::text CHECK (status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text, 'SUSPENDED'::text])),
  total_annual_jobs integer DEFAULT 0,
  market_share_percentage numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT haulage_companies_pkey PRIMARY KEY (company_id)
);
CREATE TABLE public.haulage_tariff (
  area_name text NOT NULL,
  area_code text,
  state text NOT NULL,
  haulage_rate numeric NOT NULL,
  grand_total numeric,
  expiry_date date,
  additional_charges jsonb,
  created_by uuid,
  updated_by uuid,
  remarks text,
  conditions text,
  tariff_id uuid NOT NULL DEFAULT gen_random_uuid(),
  toll_fee numeric DEFAULT 0,
  faf_fee numeric DEFAULT 0,
  dgc_fee numeric DEFAULT 0.00,
  container_size text DEFAULT '20ft & 40ft'::text,
  container_type text DEFAULT 'DRY'::text,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  version_number integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT haulage_tariff_pkey PRIMARY KEY (tariff_id),
  CONSTRAINT haulage_tariff_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT haulage_tariff_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.invoice_statuses (
  status_id integer,
  updated_by uuid,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  invoice_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT invoice_statuses_pkey PRIMARY KEY (invoice_id),
  CONSTRAINT invoice_statuses_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_id),
  CONSTRAINT invoice_statuses_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT invoice_statuses_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.statuses_master(status_id)
);
CREATE TABLE public.invoices (
  booking_id uuid,
  amount numeric,
  generated_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  invoice_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id),
  CONSTRAINT invoices_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.items (
  item_type text,
  description text,
  dimensions jsonb,
  is_fragile boolean DEFAULT false,
  special_handling text,
  unit_weight_kg numeric,
  unit_volume_cbm numeric,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  quantity integer,
  weight integer,
  volume integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  booking_id uuid,
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id)
);
CREATE TABLE public.roles (
  role_name character varying NOT NULL UNIQUE,
  role_id integer NOT NULL DEFAULT nextval('roles_role_id_seq'::regclass),
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.statuses_master (
  entity_type character varying NOT NULL,
  status_value character varying NOT NULL,
  status_id integer NOT NULL DEFAULT nextval('statuses_master_status_id_seq'::regclass),
  CONSTRAINT statuses_master_pkey PRIMARY KEY (status_id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role_id integer NOT NULL,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id)
);
CREATE TABLE public.vehicle (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  no_plate text,
  type_vehicle text,
  driver_id uuid NOT NULL,
  CONSTRAINT vehicle_pkey PRIMARY KEY (id, driver_id),
  CONSTRAINT Vehicle_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(driver_id)
);
