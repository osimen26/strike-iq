-- Run this script in the Supabase SQL Editor

-- 1. Create a function that inserts a row into public."user" whenever a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public."user" (id, email, name, "createdAt", "updatedAt")
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    now(), 
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
