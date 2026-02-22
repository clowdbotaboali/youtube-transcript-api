CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES public.users(id) NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  credits_added integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  payer_contact text,
  transfer_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payments'
      AND policyname = 'Users can view their own payments.'
  ) THEN
    CREATE POLICY "Users can view their own payments."
      ON public.payments
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
