import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Chantier {
  id: string;
  user_id: string;
  nom_chantier: string;
  adresse: string;
  code_postal: string;
  ville: string;
  created_at: string;
  updated_at: string;
}

export function useChantiers(userId: string | undefined) {
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les chantiers de l'utilisateur
  useEffect(() => {
    if (!userId) {
      setChantiers([]);
      return;
    }

    const fetchChantiers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("chantiers")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) {
          console.error("Erreur chargement chantiers:", error);
        } else {
          setChantiers(data || []);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChantiers();
  }, [userId]);

  // Sauvegarder ou mettre à jour un chantier
  const saveChantier = async (
    nomChantier: string,
    adresse: string,
    codePostal: string,
    ville: string
  ): Promise<boolean> => {
    if (!userId || !nomChantier.trim()) return false;

    try {
      const { error } = await supabase.from("chantiers").upsert(
        {
          user_id: userId,
          nom_chantier: nomChantier.trim(),
          adresse,
          code_postal: codePostal,
          ville,
        },
        {
          onConflict: "user_id,nom_chantier",
        }
      );

      if (error) {
        console.error("Erreur sauvegarde chantier:", error);
        return false;
      }

      // Rafraîchir la liste
      const { data } = await supabase
        .from("chantiers")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      setChantiers(data || []);
      return true;
    } catch (err) {
      console.error("Erreur:", err);
      return false;
    }
  };

  // Rechercher des chantiers par nom
  const searchChantiers = (query: string): Chantier[] => {
    if (!query.trim()) return chantiers.slice(0, 5);
    
    const lowerQuery = query.toLowerCase();
    return chantiers.filter((c) =>
      c.nom_chantier.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    chantiers,
    isLoading,
    saveChantier,
    searchChantiers,
  };
}
