/*
  # Add call_id column to sessions table

  1. Changes
    - Add `call_id` column to `sessions` table
    - Store the nanoid with 's' prefix separately from the full call_link
    - This allows for easier querying and management of session identifiers

  2. Notes
    - The call_id will store just the session identifier (e.g., "s123abc456def789")
    - The call_link will continue to store the full URL
    - This provides better data organization and query flexibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'call_id'
  ) THEN
    ALTER TABLE sessions ADD COLUMN call_id text;
  END IF;
END $$;