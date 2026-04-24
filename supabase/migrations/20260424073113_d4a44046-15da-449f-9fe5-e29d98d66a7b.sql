-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  suburb_result_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);

CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notification preferences
CREATE TABLE public.notification_preferences (
  user_id UUID NOT NULL PRIMARY KEY,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  inapp_enabled BOOLEAN NOT NULL DEFAULT true,
  phone_e164 TEXT,
  alert_frequency TEXT NOT NULL DEFAULT 'instant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prefs" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own prefs" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own prefs" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Match alert criteria
CREATE TABLE public.match_alert_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suburb TEXT,
  state TEXT,
  beds_min INTEGER,
  price_min INTEGER,
  price_max INTEGER,
  property_type TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.match_alert_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own criteria" ON public.match_alert_criteria
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- property_listings extensions
ALTER TABLE public.property_listings ALTER COLUMN address DROP NOT NULL;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS bedrooms_min INTEGER;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS price_min INTEGER;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS price_max INTEGER;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS realestate_url TEXT;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS domain_url TEXT;
ALTER TABLE public.property_listings ADD COLUMN IF NOT EXISTS search_label TEXT;
ALTER TABLE public.property_listings ALTER COLUMN price DROP NOT NULL;

-- suburb_results extensions
ALTER TABLE public.suburb_results ADD COLUMN IF NOT EXISTS population_total INTEGER;
ALTER TABLE public.suburb_results ADD COLUMN IF NOT EXISTS median_age INTEGER;
ALTER TABLE public.suburb_results ADD COLUMN IF NOT EXISTS household_composition TEXT;
ALTER TABLE public.suburb_results ADD COLUMN IF NOT EXISTS suburb_history TEXT;

-- Realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;