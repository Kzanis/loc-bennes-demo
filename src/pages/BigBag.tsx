import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BigBag = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-3xl font-bold">Page en construction</h1>
        <Button onClick={() => navigate("/")}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default BigBag;
