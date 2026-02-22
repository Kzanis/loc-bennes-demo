import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LBCard, LBCardContent, LBCardHeader, LBCardTitle } from "@/components/ui/lb-card";
import { UserPlus, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast.error(error.message);
        console.error("❌ Erreur inscription:", error);
        return;
      }

      console.log("✅ Inscription réussie pour:", email);
      setRegisteredEmail(email);
      setRegisteredUserId(data.user?.id || "");
      setShowProfileForm(true);
      toast.success("Compte créé ! Complétez votre profil.");
    } catch (error: any) {
      console.error("💥 Erreur technique complète:", error);
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {!showProfileForm ? (
        <div className="w-full max-w-md">
          <div className="text-center mb-8 brush-effect">
            <div className="inline-block bg-primary px-6 py-2 mb-4 transform -rotate-1">
              <Truck className="inline-block mr-2 h-6 w-6" />
              <h1 className="inline-block text-3xl font-bold">LOC BENNES</h1>
            </div>
          </div>

          <LBCard>
            <LBCardHeader>
              <LBCardTitle className="flex items-center gap-2 text-2xl">
                <UserPlus className="h-6 w-6 text-primary" />
                Créer un compte
              </LBCardTitle>
            </LBCardHeader>
            <LBCardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-red"
                >
                  {loading ? "Création..." : "CRÉER MON COMPTE"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </div>
              </form>
            </LBCardContent>
          </LBCard>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8 brush-effect">
            <div className="inline-block bg-primary px-6 py-2 mb-4 transform -rotate-1">
              <Truck className="inline-block mr-2 h-6 w-6" />
              <h1 className="inline-block text-3xl font-bold">LOC BENNES</h1>
            </div>
          </div>

          <LBCard>
            <LBCardHeader>
              <LBCardTitle className="flex items-center gap-2 text-2xl">
                <UserPlus className="h-6 w-6 text-primary" />
                Complétez votre profil
              </LBCardTitle>
            </LBCardHeader>
            <LBCardContent>
              <iframe
                src={`https://n8n.srv1196329.hstgr.cloud/form/signup?client_id=${registeredUserId}`}
                style={{
                  width: "100%",
                  height: "900px",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor: "transparent",
                }}
                title="Formulaire de profil client"
              />
              <Button
                onClick={() => navigate("/login")}
                className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity shadow-red"
              >
                Terminer et se connecter
              </Button>
            </LBCardContent>
          </LBCard>
        </div>
      )}
    </div>
  );
}
