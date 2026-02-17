-- Migration 008: Seed Fellow Accounts
-- Creates fellow accounts and ventures based on signed fellows data
-- NOTE: auth_user_id values are placeholder UUIDs that need to be linked to actual Supabase Auth users
-- After creating auth users in Supabase Auth, update these records with the actual auth user IDs

-- Fellow 1: Urav Shah - Evos
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'urav.shah@example.com', -- UPDATE: Replace with actual email
  'Urav Shah',
  'fellow',
  'building',
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Urav Shah: Evos
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Urav Shah' LIMIT 1),
  'Evos',
  'Evos is an agentic operator that can analyse SMEs/ Enterprise and deploy in <12hrs, aiming to solve the gap of regional datasets to train high impact agentic operators',
  'AI/ML Infrastructure',
  '01',
  'Strategic advantage in Agentic Operator adoption and generating sovereign datasets. Demo active, and actively pitching to customers.',
  true,
  now(),
  now()
);

-- Fellow 2: Alexandra Coleman - Azraq
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'alexandra.coleman@example.com', -- UPDATE: Replace with actual email
  'Alexandra Coleman',
  'fellow',
  'building',
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Alexandra Coleman: Azraq
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Alexandra Coleman' LIMIT 1),
  'Azraq',
  'Azraq solves data center lifecycle management risk through physics informed analysis and has a proprietary model in development to model all built environment risk',
  'Infrastructure/Construction Tech',
  '01',
  'Derisk data centre construction projects and financing creating advantaged project pipeline for region and advantage in investing in global projects. Actively generating revenue ~$75k and >15 customer pipeline in contracting discussions.',
  true,
  now(),
  now()
);

-- Fellow 3: Ganesh Sahane - Durian Labs
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'ganesh.sahane@example.com', -- UPDATE: Replace with actual email
  'Ganesh Sahane',
  'fellow',
  'building',
  10.00,
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Ganesh Sahane: Durian Labs
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Ganesh Sahane' LIMIT 1),
  'Durian Labs',
  'Durian Labs seeks to increase access to molecule modelling and make regional illnesses / invention against regional constraints more accessible',
  'Biotech/Pharma',
  '00',
  'Decrease cost of research and increase number of R&D concepts against regional illnesses. Backend software developed, target customer and use cases in development.',
  true,
  now(),
  now()
);

-- Fellow 4: Amyn Haji - Mentix
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'amyn.haji@example.com', -- UPDATE: Replace with actual email
  'Amyn Haji',
  'fellow',
  'building',
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Amyn Haji: Mentix
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Amyn Haji' LIMIT 1),
  'Mentix',
  'Mentix solves the inefficient way in which surgeons train junior doctors in specialist surgeries by connecting renowned talent directly with trainees',
  'Healthcare/EdTech',
  '00',
  'Increase the access for Qatar based healthcare professionals to global experts for training and distribution of their knowledge to improve patient outcomes. Actively forming distribution partnerships and developing the core platform.',
  true,
  now(),
  now()
);

-- Fellow 5: Ruby Smith - Serve
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'ruby.smith@example.com', -- UPDATE: Replace with actual email
  'Ruby Smith',
  'fellow',
  'building',
  10.00,
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Ruby Smith: Serve
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Ruby Smith' LIMIT 1),
  'Serve',
  'Serve is solving the lack of long-term relationship management for patients with healthcare systems',
  'Healthcare Tech',
  '00',
  'Map the Qatar healthcare services market and create a brokerage platform to give every patient a clear range of services tailored to them to use in the local healthcare system. Concept scoping.',
  true,
  now(),
  now()
);

-- Fellow 6: Phares Kariuki - Ruckstack
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'phares.kariuki@example.com', -- UPDATE: Replace with actual email
  'Phares Kariuki',
  'fellow',
  'building',
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Phares Kariuki: Ruckstack
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Phares Kariuki' LIMIT 1),
  'Ruckstack',
  'Ruckstack is an AI infrastructure platform that allow startups to scale effectively, leapfrogging costly existing infra',
  'AI Infrastructure',
  '00',
  'Serve as a low cost infra model to enhance the SME/ Startup ecosystem. Concept development, business model and GTM refinement required to build customer base in Africa.',
  true,
  now(),
  now()
);

-- Fellow 7: Dr Satheesh - Barrier Intelligence
INSERT INTO fellows (
  id,
  auth_user_id,
  email,
  full_name,
  role,
  lifecycle_stage,
  onboarding_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text, -- PLACEHOLDER: Replace with actual Supabase Auth user ID
  'dr.satheesh@example.com', -- UPDATE: Replace with actual email
  'Dr Satheesh',
  'fellow',
  'building',
  10.00,
  '{"agreementSigned": "2025-01-01T00:00:00Z", "kycVerified": "2025-01-01T00:00:00Z", "toolstackComplete": true, "computeBudgetAcknowledged": true, "frameworkIntroComplete": true, "browserSetupComplete": true, "ventureCreated": true}'::jsonb,
  now(),
  now()
);

-- Venture for Dr Satheesh: Barrier Intelligence
INSERT INTO ventures (
  id,
  fellow_id,
  name,
  description,
  industry,
  current_stage,
  alignment_notes,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM fellows WHERE full_name = 'Dr Satheesh' LIMIT 1),
  'Barrier Intelligence',
  'Barrier Intelligence is solving the problem of Oil & Gas sites operating on static safety designs that do not evolve as sites change and operations change',
  'Energy/Oil & Gas Tech',
  '00',
  'Decrease safety risk in the energy sector and decrease the risk of unplanned downtime in production/ operations. Concept in development and first GTM testing in-progress.',
  true,
  now(),
  now()
);
