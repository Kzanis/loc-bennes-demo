import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const DashboardClient = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <div className="max-w-2xl mx-auto text-center space-y-6 mt-16">
          <h2 className="text-2xl font-semibold">Besoin d'une benne ?</h2>
          <p className="text-muted-foreground">
            Remplissez notre formulaire de demande en quelques étapes simples
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/location-benne")}
            className="text-lg px-8 py-6"
          >
            Nouvelle demande de location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
