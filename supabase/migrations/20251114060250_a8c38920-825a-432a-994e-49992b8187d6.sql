-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create blood_tests table
CREATE TABLE public.blood_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  test_date DATE NOT NULL,
  
  -- Emocromo completo
  globuli_rossi DECIMAL(10,2),
  emoglobina DECIMAL(10,2),
  ematocrito DECIMAL(10,2),
  globuli_bianchi DECIMAL(10,2),
  piastrine DECIMAL(10,2),
  
  -- Glicemia e metabolismo
  glicemia DECIMAL(10,2),
  emoglobina_glicata DECIMAL(10,2),
  
  -- Funzione renale
  creatinina DECIMAL(10,2),
  azotemia DECIMAL(10,2),
  
  -- Funzione epatica
  got_ast DECIMAL(10,2),
  gpt_alt DECIMAL(10,2),
  gamma_gt DECIMAL(10,2),
  
  -- Lipidi
  colesterolo_totale DECIMAL(10,2),
  colesterolo_hdl DECIMAL(10,2),
  colesterolo_ldl DECIMAL(10,2),
  trigliceridi DECIMAL(10,2),
  
  -- Elettroliti
  sodio DECIMAL(10,2),
  potassio DECIMAL(10,2),
  
  -- Vitamine
  vitamina_d DECIMAL(10,2),
  vitamina_b12 DECIMAL(10,2),
  
  -- Tiroide
  tsh DECIMAL(10,2),
  ft3 DECIMAL(10,2),
  ft4 DECIMAL(10,2),
  
  -- Altri
  ferritina DECIMAL(10,2),
  pcr DECIMAL(10,2),
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on blood_tests
ALTER TABLE public.blood_tests ENABLE ROW LEVEL SECURITY;

-- Blood tests policies
CREATE POLICY "Users can view their own blood tests"
  ON public.blood_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blood tests"
  ON public.blood_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blood tests"
  ON public.blood_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blood tests"
  ON public.blood_tests FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for profiles
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_tests_updated_at
  BEFORE UPDATE ON public.blood_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();