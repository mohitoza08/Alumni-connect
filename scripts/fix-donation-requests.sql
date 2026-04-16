-- Fix donation_requests table to allow NULL for anonymous donations
-- Run this if you have issues with anonymous donations

ALTER TABLE donation_requests 
ALTER COLUMN donor_name DROP NOT NULL,
ALTER COLUMN donor_email DROP NOT NULL;
