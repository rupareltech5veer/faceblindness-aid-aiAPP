/*
  # Clean up duplicate user profiles

  1. Problem
    - Multiple user_profiles records exist for the same user_id
    - This causes PGRST116 errors when trying to fetch a single profile

  2. Solution
    - Delete duplicate profiles, keeping only the most recent one for each user
    - Add a unique constraint to prevent future duplicates

  3. Security
    - This migration only affects the user_profiles table
    - Preserves the most recent profile data for each user
*/

-- First, create a temporary table with the profiles we want to keep (most recent for each user)
CREATE TEMP TABLE profiles_to_keep AS
SELECT DISTINCT ON (user_id) id, user_id
FROM user_profiles
ORDER BY user_id, created_at DESC;

-- Delete all profiles that are not in the "keep" list
DELETE FROM user_profiles
WHERE id NOT IN (SELECT id FROM profiles_to_keep);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);