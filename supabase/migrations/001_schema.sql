create extension if not exists pgcrypto;
create type public.user_role as enum ('parent','sitter','admin');
create type public.booking_status as enum ('requested','accepted','confirmed','in_progress','completed','cancelled');
create type public.quote_status as enum ('draft','sent','accepted','declined','expired');
create type public.invoice_status as enum ('unpaid','paid','overdue','cancelled');

create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'parent',
  avatar_url text,
  phone text,
  postal_code text,
  address text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  created_at timestamptz not null default now()
);

create table public.sitter_profiles(
  user_id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  years_experience int not null default 0,
  service_area text[],
  hourly_rate numeric(10,2),
  service_radius_km numeric(4,1) not null default 5.0,
  travel_fee numeric(10,2) not null default 0.0,
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  services text[] default '{}'
);

create table public.pets(
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  medical_notes text,
  care_notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.services(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  base_price numeric(10,2) not null,
  unit text not null,
  active boolean not null default true
);

create table public.bookings(
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id),
  sitter_id uuid references public.profiles(id),
  pet_id uuid not null references public.pets(id),
  service_id uuid not null references public.services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  address text not null,
  postal_code text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  notes text,
  status public.booking_status not null default 'requested',
  total_amount numeric(10,2),
  created_at timestamptz not null default now(),
  constraint valid_dates check(ends_at>starts_at)
);

create table public.availability(
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  available boolean not null default true,
  constraint valid_availability check(ends_at>starts_at)
);

create table public.booking_updates(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  message text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.messages(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id),
  parent_id uuid not null references public.profiles(id),
  sitter_id uuid not null references public.profiles(id),
  rating int not null check(rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.payments(
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id),
  provider_ref text,
  status text not null,
  amount numeric(10,2) not null,
  platform_fee numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Public Visitor Enquiries Table
create table public.enquiries(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  postal_code text not null,
  pet_type text,
  service_requested text,
  message text not null,
  status text not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now()
);

-- Quotations Table
create table public.quotations(
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  parent_id uuid references public.profiles(id),
  sitter_id uuid references public.profiles(id),
  service_name text not null,
  postal_code text,
  distance_km numeric(4,1),
  base_amount numeric(10,2) not null,
  travel_fee numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  notes text,
  valid_until date,
  status public.quote_status not null default 'sent',
  created_at timestamptz not null default now()
);

-- Invoices Table
create table public.invoices(
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  quotation_id uuid references public.quotations(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  parent_id uuid not null references public.profiles(id),
  sitter_id uuid references public.profiles(id),
  subtotal numeric(10,2) not null,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null,
  status public.invoice_status not null default 'unpaid',
  due_date date not null,
  paid_at timestamptz,
  payment_method text,
  created_at timestamptz not null default now()
);

-- Haversine formula calculation for PIN distance matching (in km)
create or replace function public.calculate_distance_km(
  lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric
) returns numeric language plpgsql immutable as $$
declare
  r constant numeric := 6371; -- Earth radius in km
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
begin
  if lat1 is null or lon1 is null or lat2 is null or lon2 is null then
    return null;
  end if;
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  return round(r * c, 1);
end;
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare requested_role public.user_role;
begin
  requested_role:=case when new.raw_user_meta_data->>'role'='sitter' then 'sitter'::public.user_role else 'parent'::public.user_role end;
  insert into public.profiles(id,full_name,role,postal_code) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','New member'),requested_role,new.raw_user_meta_data->>'pin');
  if requested_role='sitter' then
    insert into public.sitter_profiles(user_id) values(new.id);
  end if;
  return new;
end;$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.services(slug,name,description,base_price,unit) values
('pet-transport','Pet transport','Door-to-door pet transport with live updates',25,'trip'),
('walk','Dog walking','One-to-one neighbourhood walk',22,'walk'),
('daycare','Pet daycare','Small-group enrichment daycare',45,'day'),
('boarding','Home boarding','Overnight care in a verified sitter home',55,'night'),
('stayover','Home stayover','A sitter stays with your pet at home',70,'night');

