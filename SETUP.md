# Portfolio Management System - Setup Guide

This guide details the complete configuration and deployment steps for the portfolio platform using **React**, **TypeScript**, and **Supabase** (Authentication, PostgreSQL, Storage).

---

## 1. Supabase Project Creation

1. Go to [Supabase](https://supabase.com) and sign in.
2. Click **New Project** and select your organization.
3. Choose a project name, database password, and region.
4. Wait for the project database to initialize.

---

## 2. Database Schema & Migration

Initialize your tables, Row Level Security policies, storage buckets, and admin credentials helper:

1. In the Supabase Dashboard sidebar, click the **SQL Editor** tab.
2. Click **New Query**.
3. Open the file [supabase_schema.sql](file:///C:/Users/karthik/Downloads/Karthik/RESUME/Portfolio/supabase_schema.sql) from your project root.
4. Copy its contents, paste them into the SQL Editor, and click **Run**.
5. Ensure the query executes successfully. This creates the following:
   - Tables: `profiles`, `skills`, `projects`, `experience`, `education`, `achievements`, `messages`, `settings`
   - Policy: Row Level Security rules gating write edits to `role = 'admin'` metadata users.
   - Storage bucket: `portfolio-assets` initialized as public.
   - Helper function: `public.is_admin()` checking JWT metadata claim attributes.

---

## 3. Environment Variables Configuration

Create a file named `.env` in the root of the project:
`C:\Users\karthik\Downloads\Karthik\RESUME\Portfolio\.env`

Populate it with your Supabase credentials:

```env
# Retrieve these from Supabase -> Project Settings -> API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
```

*(Refer to `.env.example` in the project root for reference.)*

---

## 4. Admin Account Setup Flow

To establish a secure admin console login, follow these three steps:

### Step 1: Create Admin User in Supabase Auth
1. Go to the **Authentication** tab in the Supabase sidebar.
2. Click **Add User** -> **Create User**.
3. Fill in the email (e.g. `ganjikarthik999@gmail.com`) and a strong password. Click **Save**.
4. Check your email inbox to confirm/verify the user registration (or temporarily disable "Confirm Email" under Authentication -> Providers -> Email in Supabase settings to auto-confirm).

### Step 2: Assign Admin Metadata Role
Supabase gates all admin write access behind user metadata role verification. Run the SQL snippet below in the **SQL Editor** to elevate your new account:

```sql
-- Replace the email address below with your registered admin email
UPDATE auth.users 
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'ganjikarthik999@gmail.com';
```

### Step 3: Login Through the Console
1. Run your local dev server using `npm run dev`.
2. Go to `http://localhost:5173/admin/login`.
3. Log in using your email and password. The system verifies your metadata claim role and grants dashboard access.

---

## 5. Assets Configuration

### Resume PDF Upload
1. Log in to the Admin Dashboard.
2. Go to the **Resume CRUD** tab in the sidebar.
3. Click **Upload Resume PDF** and select your resume file.
4. Once uploaded, the public homepage Hero section displays a downloadable CTA. If deleted or missing, the public CTA button is hidden.

### Profile Avatar Upload
1. Go to the **Profile CRUD** tab in the Admin Dashboard.
2. Click **Upload** under the **Profile Photo** section on the right.
3. Choose your professional picture. The website header and Hero sections update automatically. If missing, a premium SVG developer avatar is used as a fallback.

---

## 6. Contact Form & Email Notifications (Resend API)

Submit contact requests from the visitor page directly into your inbox while triggering email updates using a Supabase Edge Function:

### Step 1: Deploy Deno Edge Function
Make sure you have the Supabase CLI installed, then log in and deploy:

```bash
# Login to Supabase CLI (requires API token)
npx supabase login

# Deploy the send-email edge function
npx supabase functions deploy send-email --project-ref your-supabase-project-id
```

### Step 2: Add Resend API Secret Key
Generate a sending key from [Resend](https://resend.com) and bind it to your Supabase project vault:

```bash
npx supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Step 3: Create database trigger webhook
1. Navigate to **Integrations** -> **Webhooks** in the Supabase Dashboard.
2. Click **Create Webhook**:
   - **Name**: Send Contact Email Notification
   - **Table**: `messages`
   - **Events**: check `Insert`
   - **Type**: `Supabase Edge Function`
   - **Method**: `POST`
   - **Function**: Select `send-email`
3. Save the webhook. Messages sent from the contact form are saved in the DB messages inbox and sent directly to your email address.

---

## 7. Deploying to Vercel

1. Push your local codebase to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
3. Select your portfolio repository.
4. Expand **Environment Variables** and insert:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel compiles your application using Vite and builds the client package.
