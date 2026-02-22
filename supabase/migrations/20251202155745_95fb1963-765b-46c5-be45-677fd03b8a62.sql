-- Table pour mémoriser les chantiers par client
CREATE TABLE public.chantiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_chantier TEXT NOT NULL,
  adresse TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Un client ne peut pas avoir deux chantiers avec le même nom
  UNIQUE(user_id, nom_chantier)
);

-- Activer RLS pour la sécurité
ALTER TABLE public.chantiers ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs peuvent voir leurs propres chantiers
CREATE POLICY "Users can view their own chantiers" ON public.chantiers
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent créer leurs propres chantiers
CREATE POLICY "Users can insert their own chantiers" ON public.chantiers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent modifier leurs propres chantiers
CREATE POLICY "Users can update their own chantiers" ON public.chantiers
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent supprimer leurs propres chantiers
CREATE POLICY "Users can delete their own chantiers" ON public.chantiers
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_chantiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chantiers_updated_at
  BEFORE UPDATE ON public.chantiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chantiers_updated_at();