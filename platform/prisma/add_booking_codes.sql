-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor)
ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS booking_code TEXT;
ALTER TABLE pro_predictions ADD COLUMN IF NOT EXISTS bookmaker TEXT;
