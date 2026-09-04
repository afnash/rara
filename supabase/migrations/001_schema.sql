create extension if not exists pgcrypto;
create type public.user_role as enum ('parent','sitter','admin');
create type public.booking_status as enum ('requested','accepted','confirmed','in_progress','completed','cancelled');

create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text not null,role public.user_role not null default 'parent',avatar_url text,phone text,created_at timestamptz not null default now());
create table public.sitter_profiles(user_id uuid primary key references public.profiles(id) on delete cascade,bio text,years_experience int not null default 0,service_area text[],hourly_rate numeric(10,2),verified boolean not null default false,rating numeric(2,1) not null default 0,services text[] default '{}');
create table public.pets(id uuid primary key default gen_random_uuid(),parent_id uuid not null references public.profiles(id) on delete cascade,name text not null,species text not null,breed text,birth_date date,medical_notes text,care_notes text,photo_url text,created_at timestamptz not null default now());
create table public.services(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,description text not null,base_price numeric(10,2) not null,unit text not null,active boolean not null default true);
create table public.bookings(id uuid primary key default gen_random_uuid(),parent_id uuid not null references public.profiles(id),sitter_id uuid references public.profiles(id),pet_id uuid not null references public.pets(id),service_id uuid not null references public.services(id),starts_at timestamptz not null,ends_at timestamptz not null,address text not null,notes text,status public.booking_status not null default 'requested',total_amount numeric(10,2),created_at timestamptz not null default now(),constraint valid_dates check(ends_at>starts_at));
create table public.availability(id uuid primary key default gen_random_uuid(),sitter_id uuid not null references public.profiles(id) on delete cascade,starts_at timestamptz not null,ends_at timestamptz not null,available boolean not null default true,constraint valid_availability check(ends_at>starts_at));
create table public.booking_updates(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,author_id uuid not null references public.profiles(id),message text not null,photo_url text,created_at timestamptz not null default now());
create table public.messages(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,sender_id uuid not null references public.profiles(id),recipient_id uuid not null references public.profiles(id),body text not null,read_at timestamptz,created_at timestamptz not null default now());
create table public.reviews(id uuid primary key default gen_random_uuid(),booking_id uuid unique not null references public.bookings(id),parent_id uuid not null references public.profiles(id),sitter_id uuid not null references public.profiles(id),rating int not null check(rating between 1 and 5),comment text,created_at timestamptz not null default now());
create table public.payments(id uuid primary key default gen_random_uuid(),booking_id uuid unique not null references public.bookings(id),provider_ref text,status text not null,amount numeric(10,2) not null,platform_fee numeric(10,2) not null default 0,created_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$declare requested_role public.user_role;begin requested_role:=case when new.raw_user_meta_data->>'role'='sitter' then 'sitter'::public.user_role else 'parent'::public.user_role end;insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','New member'),requested_role);if requested_role='sitter' then insert into public.sitter_profiles(user_id) values(new.id);end if;return new;end;$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.services(slug,name,description,base_price,unit) values
('pet-transport','Pet transport','Door-to-door pet transport with live updates',25,'trip'),
('walk','Dog walking','One-to-one neighbourhood walk',22,'walk'),
('daycare','Pet daycare','Small-group enrichment daycare',45,'day'),
('boarding','Home boarding','Overnight care in a verified sitter home',55,'night'),
('stayover','Home stayover','A sitter stays with your pet at home',70,'night');
