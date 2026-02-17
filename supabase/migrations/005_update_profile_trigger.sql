-- Update profile trigger to capture names from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, user_type, first_name, last_name, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'both'),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '')) , ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')) , ''),
    TIMEZONE('utc', NOW())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    updated_at = TIMEZONE('utc', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
