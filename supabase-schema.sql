-- ==============================================================================
-- COMPLETE SUPABASE SQL SCHEMA FOR RIGHT MINDS AFRICA & CORPERS IMPACT INITIATIVE
-- ==============================================================================
-- Paste this entire SQL into the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- and click "RUN". It creates all CMS tables with id, created_at, updated_at columns,
-- enables Row Level Security (RLS) on each table, sets up public read (SELECT) policies,
-- authenticated admin write (INSERT/UPDATE/DELETE) policies, creates the public storage
-- bucket 'cms-media' with its security policies, and enables Realtime publication.
-- ==============================================================================

-- 1. Helper function to automatically update the updated_at column on edit
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. CREATE CMS CONTENT TABLES
-- ==============================================================================

-- TABLE: site_settings (General site settings, contact info, marquee, counters, email settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: pages (Dynamic page hero sections, copy, layout variables, about axes)
CREATE TABLE IF NOT EXISTS public.pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: events (Flagship summits, YAP conference, bootcamps, workshops)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'YAP Conference',
    date TEXT,
    time TEXT,
    venue TEXT,
    capacity INTEGER DEFAULT 100,
    registered_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Published',
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: programs (Leadership seminar, Monthly Reinvention, Teen Bootcamp, G3)
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    track TEXT,
    target_audience TEXT,
    duration TEXT,
    price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    banner_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: team_members (Executive director, tech leads, facilitators, coordinators)
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT,
    credentials TEXT,
    role TEXT,
    photo TEXT,
    bio TEXT,
    hubs TEXT[] DEFAULT ARRAY[]::TEXT[],
    socials JSONB DEFAULT '{}'::jsonb,
    accent TEXT,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: blog_posts (News releases, articles, announcements, insights)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    author TEXT,
    summary TEXT,
    content TEXT,
    category TEXT DEFAULT 'Announcements',
    banner_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'Published',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: gallery (Event photos, outreach archives, high-res showcase)
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'YAP Conference',
    image_url TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: testimonials (Alumni reviews, corps member stories, student endorsements)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    quote TEXT NOT NULL,
    avatar TEXT,
    rating INTEGER DEFAULT 5,
    enabled BOOLEAN DEFAULT TRUE,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE: announcements (Ticker updates, alert banners, website popups)
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'announcement',
    is_active BOOLEAN DEFAULT TRUE,
    link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. AUTO-UPDATE TRIGGERS
-- ==============================================================================
DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trigger_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pages_updated_at ON public.pages;
CREATE TRIGGER trigger_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_programs_updated_at ON public.programs;
CREATE TRIGGER trigger_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON public.team_members;
CREATE TRIGGER trigger_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gallery_updated_at ON public.gallery;
CREATE TRIGGER trigger_gallery_updated_at BEFORE UPDATE ON public.gallery FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER trigger_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON public.announcements;
CREATE TRIGGER trigger_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Anyone (anon public visitor) can read (SELECT).
-- Only authenticated users (admins logged in with Supabase Auth) can INSERT, UPDATE, DELETE.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public can view site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated admins can insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated admins can update site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated admins can delete site_settings" ON public.site_settings;

DROP POLICY IF EXISTS "Public can view pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated admins can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated admins can update pages" ON public.pages;
DROP POLICY IF EXISTS "Authenticated admins can delete pages" ON public.pages;

DROP POLICY IF EXISTS "Public can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated admins can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated admins can delete events" ON public.events;

DROP POLICY IF EXISTS "Public can view programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated admins can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated admins can update programs" ON public.programs;
DROP POLICY IF EXISTS "Authenticated admins can delete programs" ON public.programs;

DROP POLICY IF EXISTS "Public can view team_members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated admins can insert team_members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated admins can update team_members" ON public.team_members;
DROP POLICY IF EXISTS "Authenticated admins can delete team_members" ON public.team_members;

DROP POLICY IF EXISTS "Public can view blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can insert blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can update blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated admins can delete blog_posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Public can view gallery" ON public.gallery;
DROP POLICY IF EXISTS "Authenticated admins can insert gallery" ON public.gallery;
DROP POLICY IF EXISTS "Authenticated admins can update gallery" ON public.gallery;
DROP POLICY IF EXISTS "Authenticated admins can delete gallery" ON public.gallery;

DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated admins can delete testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authenticated admins can delete announcements" ON public.announcements;

-- site_settings
CREATE POLICY "Public can view site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert site_settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (true);

-- pages
CREATE POLICY "Public can view pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert pages" ON public.pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update pages" ON public.pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete pages" ON public.pages FOR DELETE TO authenticated USING (true);

-- events
CREATE POLICY "Public can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update events" ON public.events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete events" ON public.events FOR DELETE TO authenticated USING (true);

-- programs
CREATE POLICY "Public can view programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update programs" ON public.programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete programs" ON public.programs FOR DELETE TO authenticated USING (true);

-- team_members
CREATE POLICY "Public can view team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert team_members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update team_members" ON public.team_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete team_members" ON public.team_members FOR DELETE TO authenticated USING (true);

-- blog_posts
CREATE POLICY "Public can view blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert blog_posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update blog_posts" ON public.blog_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete blog_posts" ON public.blog_posts FOR DELETE TO authenticated USING (true);

-- gallery
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert gallery" ON public.gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update gallery" ON public.gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete gallery" ON public.gallery FOR DELETE TO authenticated USING (true);

-- testimonials
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (true);

-- announcements
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can insert announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated admins can update announcements" ON public.announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated admins can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- 5. SUPABASE STORAGE BUCKET: cms-media
-- Creates public bucket for images and configures public access
-- ==============================================================================

-- Create bucket 'cms-media' if it does not already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-media', 'cms-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies: anyone can read/download images; authenticated admins can upload/delete
DROP POLICY IF EXISTS "Public can view cms-media files" ON storage.objects;
CREATE POLICY "Public can view cms-media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Authenticated admins can upload cms-media files" ON storage.objects;
CREATE POLICY "Authenticated admins can upload cms-media files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Authenticated admins can update cms-media files" ON storage.objects;
CREATE POLICY "Authenticated admins can update cms-media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cms-media')
WITH CHECK (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Authenticated admins can delete cms-media files" ON storage.objects;
CREATE POLICY "Authenticated admins can delete cms-media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cms-media');

-- ==============================================================================
-- 6. ENABLE REALTIME BROADCASTING
-- Allows visitors to see instant live updates whenever admin saves in Supabase
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION
    WHEN duplicate_object THEN
        -- Table already in publication, ignore
        NULL;
END;
$$;
