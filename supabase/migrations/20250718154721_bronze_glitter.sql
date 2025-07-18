/*
  # Add unique constraint to user_profiles table

  1. Changes
    - Add unique constraint on `user_id` column in `user_profiles` table
    - This enables proper upsert operations using `onConflict: 'user_id'`

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity by preventing duplicate user profiles
*/

-- Add unique constraint to user_id column
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);