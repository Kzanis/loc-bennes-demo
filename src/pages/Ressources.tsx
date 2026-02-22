import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LBCard, LBCardContent, LBCardHeader, LBCardTitle } from "@/components/ui/lb-card";
import { Truck, LogOut, TruckIcon, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Ressource {
  id: string;
  nom: string;
  statut: string;
  details?: string;
}

export default function Ressources() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bennes, setBennes] = useState<Ressource[]>([]);
  const [camions, setCamions] = useState<Ressource[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRessources();
  }, []);

  const fetchRessources = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée");
        navigate("/login");
        return;
      }

      const [bennesRes, camionsRes, chauffeursRes] = await Promise.all([
        fetch("https://creatorweb.fr/webhook/LOC_BENNES/bennes", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("https://creatorweb.fr/webhook/LOC_BENNES/camions", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch("https://creatorweb.fr/webhook/LOC_BENNES/chauffeurs", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      const bennesData = await bennesRes.json();
      const camionsData = await camionsRes.json();
      const chauffeursData = await chauffeursRes.json();

      setBennes(bennesData.bennes || []);
      setCamions(camionsData.camions || []);
      setChauffeurs(chauffeursData.chauffeurs || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des ressources");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (type: string, id: string, newStatus: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée");
        return;
      }

      await fetch(`https://creatorweb.fr/webhook/LOC_BENNES/${type}/${id}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statut: newStatus }),
      });

      toast.success("Statut mis à jour");
      fetchRessources();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (statut: string) => {
    return statut.toLowerCase() === "disponible"
      ? "bg-green-500/20 text-green-500 border-green-500/30"
      : "bg-red-500/20 text-red-500 border-red-500/30";
  };

  const RessourceCard = ({ item, type }: { item: Ressource; type: string }) => (
    <LBCard>
      <LBCardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">{item.nom}</p>
            {item.details && <p className="text-sm text-muted-foreground">{item.details}</p>}
          </div>
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(item.statut)}>{item.statut}</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newStatus = item.statut === "Disponible" ? "En service" : "Disponible";
                handleStatusChange(type, item.id, newStatus);
              }}
            >
              Changer statut
            </Button>
          </div>
        </div>
      </LBCardContent>
    </LBCard>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary px-4 py-2 transform -rotate-1">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LOC BENNES</h1>
                <p className="text-sm text-muted-foreground">Gestion des ressources</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Ressources</h2>
          <p className="text-muted-foreground">Gérez vos bennes, camions et chauffeurs</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <Tabs defaultValue="bennes" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="bennes">Bennes</TabsTrigger>
              <TabsTrigger value="camions">Camions</TabsTrigger>
              <TabsTrigger value="chauffeurs">Chauffeurs</TabsTrigger>
            </TabsList>

            <TabsContent value="bennes" className="space-y-4 mt-6">
              <LBCardHeader className="px-0">
                <LBCardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-6 w-6 text-primary" />
                  Bennes ({bennes.length})
                </LBCardTitle>
              </LBCardHeader>
              {bennes.map((benne) => (
                <RessourceCard key={benne.id} item={benne} type="bennes" />
              ))}
            </TabsContent>

            <TabsContent value="camions" className="space-y-4 mt-6">
              <LBCardHeader className="px-0">
                <LBCardTitle className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Camions ({camions.length})
                </LBCardTitle>
              </LBCardHeader>
              {camions.map((camion) => (
                <RessourceCard key={camion.id} item={camion} type="camions" />
              ))}
            </TabsContent>

            <TabsContent value="chauffeurs" className="space-y-4 mt-6">
              <LBCardHeader className="px-0">
                <LBCardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Chauffeurs ({chauffeurs.length})
                </LBCardTitle>
              </LBCardHeader>
              {chauffeurs.map((chauffeur) => (
                <RessourceCard key={chauffeur.id} item={chauffeur} type="chauffeurs" />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
