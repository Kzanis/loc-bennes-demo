import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LBCard, LBCardContent, LBCardHeader, LBCardTitle } from '@/components/ui/lb-card';
import { LogIn, Truck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      
      // Récupérer le rôle de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        navigate('/');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      toast.error(error.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
              <LogIn className="h-6 w-6 text-primary" />
              Connexion
            </LBCardTitle>
          </LBCardHeader>
          <LBCardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-red"
              >
                {loading ? 'Connexion...' : 'SE CONNECTER'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </div>

            </form>
          </LBCardContent>
        </LBCard>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Retour au simulateur
          </Link>
        </div>
      </div>
    </div>
  );
}
