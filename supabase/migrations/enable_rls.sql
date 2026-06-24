-- Enable Row Level Security (RLS) for all tables
-- Run this migration via Supabase dashboard or CLI

-- Cafe
ALTER TABLE public."Cafe" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cafe_self" ON public."Cafe" USING (auth.uid() = id);

-- User
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_self" ON public."User" USING (auth.uid() = id);

-- Mood
ALTER TABLE public."Mood" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mood_read" ON public."Mood" USING (true); -- adjust as needed

-- Drink
ALTER TABLE public."Drink" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drink_cafe" ON public."Drink" USING (cafeId = auth.uid());

-- Order
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_cafe" ON public."Order" USING (cafeId = auth.uid());

-- Analysis
ALTER TABLE public."Analysis" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analysis_cafe" ON public."Analysis" USING (cafeId = auth.uid());

-- Event
ALTER TABLE public."Event" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_cafe" ON public."Event" USING (cafeId = auth.uid());
