-- Helper script to update auth_user_id for fellows after creating Supabase Auth users
-- Usage: Replace the placeholders with actual values from Supabase Auth dashboard

-- Example: Update Urav Shah's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000001'
-- WHERE full_name = 'Urav Shah';

-- Example: Update Alexandra Coleman's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000002'
-- WHERE full_name = 'Alexandra Coleman';

-- Example: Update Ganesh Sahane's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000003'
-- WHERE full_name = 'Ganesh Sahane';

-- Example: Update Amyn Haji's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000004'
-- WHERE full_name = 'Amyn Haji';

-- Example: Update Ruby Smith's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000005'
-- WHERE full_name = 'Ruby Smith';

-- Example: Update Phares Kariuki's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000006'
-- WHERE full_name = 'Phares Kariuki';

-- Example: Update Dr Satheesh's auth_user_id
-- UPDATE fellows 
-- SET auth_user_id = '00000000-0000-0000-0000-000000000007'
-- WHERE full_name = 'Dr Satheesh';

-- Bulk update helper (update all at once)
-- Replace the UUIDs with actual auth user IDs from Supabase Auth dashboard
-- Make sure the order matches: Urav Shah, Alexandra Coleman, Ganesh Sahane, Amyn Haji, Ruby Smith, Phares Kariuki, Dr Satheesh

/*
UPDATE fellows 
SET auth_user_id = CASE full_name
  WHEN 'Urav Shah' THEN '00000000-0000-0000-0000-000000000001'
  WHEN 'Alexandra Coleman' THEN '00000000-0000-0000-0000-000000000002'
  WHEN 'Ganesh Sahane' THEN '00000000-0000-0000-0000-000000000003'
  WHEN 'Amyn Haji' THEN '00000000-0000-0000-0000-000000000004'
  WHEN 'Ruby Smith' THEN '00000000-0000-0000-0000-000000000005'
  WHEN 'Phares Kariuki' THEN '00000000-0000-0000-0000-000000000006'
  WHEN 'Dr Satheesh' THEN '00000000-0000-0000-0000-000000000007'
END
WHERE full_name IN (
  'Urav Shah',
  'Alexandra Coleman',
  'Ganesh Sahane',
  'Amyn Haji',
  'Ruby Smith',
  'Phares Kariuki',
  'Dr Satheesh'
);
*/
