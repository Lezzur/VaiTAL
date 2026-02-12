-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE,
  doctor_name TEXT,
  file_url TEXT, -- URL to the stored image
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for prescriptions
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Policies for prescriptions
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  description TEXT,
  contraindications TEXT,
  warnings TEXT,
  instructions TEXT,
  confidence FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for medicines
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

-- Policies for medicines
-- Medicines are accessed via prescriptions, so we check the prescription's owner
CREATE POLICY "Users can view medicines for their prescriptions" ON medicines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medicines for their prescriptions" ON medicines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medicines for their prescriptions" ON medicines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medicines for their prescriptions" ON medicines
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM prescriptions
      WHERE prescriptions.id = medicines.prescription_id
      AND prescriptions.user_id = auth.uid()
    )
  );

-- Create storage bucket for prescription images if it doesn't exist
-- Note: managing storage buckets via SQL is possible but often easier in UI. 
-- We'll try to insert into storage.buckets if permissions allow.
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own prescription images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can view their own prescription images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'prescriptions' AND
    auth.uid() = owner
  );
