# Lesson Media (Loom Video + Google Drive Template) Design

**Goal:** Let admins paste a Loom video URL and a Google Drive template URL per lesson, stored in the database, with an embedded Loom player and "Open Template" button visible to all users.

**Architecture:** New `asset_media` table with one row per asset (upsert pattern). Admin auth via a second password cookie (`co_build_admin_auth`). Detail page fetches media on load and conditionally shows edit fields when admin cookie is present.

**Tech Stack:** Drizzle ORM, Next.js API routes, React client components, Supabase Postgres.
