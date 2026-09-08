create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')$$;
create or replace function public.in_booking(bid uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.bookings where id=bid and (parent_id=(select auth.uid()) or sitter_id=(select auth.uid())))$$;

alter table public.profiles enable row level security;
alter table public.sitter_profiles enable row level security;
alter table public.pets enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.availability enable row level security;
alter table public.booking_updates enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;
alter table public.enquiries enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;

revoke all on all tables in schema public from anon,authenticated;
grant select, insert, update on public.services,public.sitter_profiles,public.profiles,public.enquiries,public.quotations,public.invoices,public.pets,public.bookings to anon,authenticated;
grant select,insert,update,delete on public.profiles,public.sitter_profiles,public.pets,public.bookings,public.availability,public.booking_updates,public.messages,public.reviews,public.enquiries,public.quotations,public.invoices to authenticated;
grant select on public.payments to authenticated;
grant all on all tables in schema public to service_role;

-- Profiles Policies
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to anon,authenticated using(true);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to anon,authenticated with check(true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to anon,authenticated using(true);

-- Sitter Profiles Policies
drop policy if exists sitter_public_read on public.sitter_profiles;
create policy sitter_public_read on public.sitter_profiles for select to anon,authenticated using(true);

drop policy if exists sitter_profiles_insert on public.sitter_profiles;
create policy sitter_profiles_insert on public.sitter_profiles for insert to anon,authenticated with check(true);

drop policy if exists sitter_profiles_update on public.sitter_profiles;
create policy sitter_profiles_update on public.sitter_profiles for update to anon,authenticated using(true);

-- Pets Policies
drop policy if exists pets_owner_read on public.pets;
create policy pets_owner_read on public.pets for select to anon,authenticated using(true);

drop policy if exists pets_owner_insert on public.pets;
create policy pets_owner_insert on public.pets for insert to authenticated with check(true);

drop policy if exists pets_owner_update on public.pets;
create policy pets_owner_update on public.pets for update to authenticated using(true);

drop policy if exists pets_owner_delete on public.pets;
create policy pets_owner_delete on public.pets for delete to authenticated using(true);

-- Services Policies
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select to anon,authenticated using(true);

-- Bookings Policies
drop policy if exists bookings_participant_read on public.bookings;
create policy bookings_participant_read on public.bookings for select to anon,authenticated using(true);

drop policy if exists bookings_parent_insert on public.bookings;
create policy bookings_parent_insert on public.bookings for insert to authenticated with check(true);

drop policy if exists bookings_participant_update on public.bookings;
create policy bookings_participant_update on public.bookings for update to authenticated using(true);

-- Availability Policies
drop policy if exists availability_read on public.availability;
create policy availability_read on public.availability for select to authenticated using(true);

drop policy if exists availability_sitter_insert on public.availability;
create policy availability_sitter_insert on public.availability for insert to authenticated with check(true);

drop policy if exists availability_sitter_update on public.availability;
create policy availability_sitter_update on public.availability for update to authenticated using(true);

drop policy if exists availability_sitter_delete on public.availability;
create policy availability_sitter_delete on public.availability for delete to authenticated using(true);

-- Enquiries Policies
drop policy if exists enquiries_public_insert on public.enquiries;
create policy enquiries_public_insert on public.enquiries for insert to anon,authenticated with check(true);

drop policy if exists enquiries_admin_read_update on public.enquiries;
create policy enquiries_admin_read_update on public.enquiries for select to anon,authenticated using(true);

drop policy if exists enquiries_update on public.enquiries;
create policy enquiries_update on public.enquiries for update to authenticated using(true);

-- Quotations Policies
drop policy if exists quotations_participant_read on public.quotations;
create policy quotations_participant_read on public.quotations for select to anon,authenticated using(true);

drop policy if exists quotations_creator_insert on public.quotations;
create policy quotations_creator_insert on public.quotations for insert to authenticated with check(true);

drop policy if exists quotations_participant_update on public.quotations;
create policy quotations_participant_update on public.quotations for update to authenticated using(true);

-- Invoices Policies
drop policy if exists invoices_participant_read on public.invoices;
create policy invoices_participant_read on public.invoices for select to anon,authenticated using(true);

drop policy if exists invoices_creator_insert on public.invoices;
create policy invoices_creator_insert on public.invoices for insert to authenticated with check(true);

drop policy if exists invoices_participant_update on public.invoices;
create policy invoices_participant_update on public.invoices for update to authenticated using(true);
