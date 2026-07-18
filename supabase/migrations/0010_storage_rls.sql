-- Phase 10: Setup explicit storage bucket RLS

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('guard-selfies', 'guard-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guard-selfies'
);

-- 3. Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'guard-selfies'
);

-- 4. Allow authenticated users to update files (e.g. overwriting)
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guard-selfies'
);
