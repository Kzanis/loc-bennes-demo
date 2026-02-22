import { useState, useEffect, useRef } from "react";
import logoLB from "@/assets/logo-lb.svg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WizardStep } from "@/components/wizard/WizardStep";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LogOut, Truck, Package, ArrowLeft, ArrowRight, Send, Loader2, CalendarIcon, ImageIcon, Camera } from "lucide-react";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useChantiers, type Chantier } from "@/hooks/useChantiers";
import { ChantierAutocomplete } from "@/components/ChantierAutocomplete";
import { PricingTable } from "@/components/PricingTable";

type Categorie = "Inerte" | "DIB" | "Autre";
type TypeCommande = "" | "LOCATION_BENNE" | "BIGBAG";

interface FormData {
  client_id: string;
  type_dechet: string;
  categorie: Categorie | "";
  volume_m3: string;
  
  nom_chantier: string;
  adresse: string;
  code_postal: string;
  ville: string;
  observations: string;
}

interface FormDataBigBag {
  client_id: string;
  pack_bigbag: string;
  type_dechet_bigbag: string;
  secteur_bigbag: string;
  poids_bigbag: string;
  adresse_enlevement: string;
  code_postal_enlevement: string;
  ville_enlevement: string;
  nom_contact_sur_place: string;
  tel_contact_sur_place: string;
  date_enlevement: string;
  observations_bigbag: string;
}

const WASTE_TYPES = [
  { value: "Gravats propres", categorie: "Inerte" as Categorie },
  { value: "Gravats sales", categorie: "Inerte" as Categorie },
  { value: "Terre & cailloux", categorie: "Inerte" as Categorie },
  { value: "DIB", categorie: "DIB" as Categorie },
  { value: "Bois", categorie: "Autre" as Categorie },
  { value: "Végétaux", categorie: "Autre" as Categorie },
  { value: "Plâtre", categorie: "Autre" as Categorie },
];

const VOLUMES = {
  Inerte: ["3 m³", "5 m³"],
  DIB: ["5 m³", "9 m³"],
  Autre: ["5 m³", "9 m³"],
};

const BENNE_DIMENSIONS: Record<string, string> = {
  "3 m³": "3,2m × 2m × 0,5m (H)",
  "5 m³": "3,2m × 2m × 0,9m (H)",
  "9 m³": "3,2m × 2m × 1,5m (H)",
};

const BIGBAG_PACKS = [
  "Pack 3 BigBag 90×90 (limite 1T/unité)",
  "Pack 6 BigBag 80×80 (limite 1T/unité)",
];

const BIGBAG_WASTE_TYPES = ["Gravats propres", "Gravats + plâtre", "DIB"];

const BIGBAG_SECTORS = [
  "Canton de Fayence",
  "Fréjus",
  "Cannes",
  "Antibes",
  "Autre (sur devis)",
];

const WASTE_TYPE_DESCRIPTIONS: Record<string, { title: string; items: string[]; examples?: string }> = {
  "Gravats propres": {
    title: "Gravats propres",
    items: ["Béton", "Carrelage", "Brique", "Tuile"],
  },
  "Gravats sales": {
    title: "Gravats sales (Gravasal)",
    items: ["80% de gravats propres", "20% max de plâtre"],
    examples: "Béton cellulaire, brique plâtrée, carrelage collé sur BA13, etc."
  },
  "Végétaux": {
    title: "Végétaux",
    items: ["Feuillage", "Petites branches (Ø 13cm max)"],
  },
  "Bois": {
    title: "Bois",
    items: ["Meuble", "Palettes", "Fenêtres"],
  },
  "DIB": {
    title: "DIB (Déchets Industriels Banals)",
    items: ["Plastique", "Carton", "Polystyrène", "Isolant"],
    examples: "Le tout peut être mélangé"
  },
  "Terre & cailloux": {
    title: "Terre & cailloux",
    items: ["Terre végétale", "Cailloux", "Pierres"],
  },
  "Plâtre": {
    title: "Plâtre",
    items: ["Plaques de plâtre", "BA13", "Carreaux de plâtre"],
  },
  "Gravats + plâtre": {
    title: "Gravats + plâtre",
    items: ["80% de gravats propres", "20% max de plâtre"],
    examples: "Béton cellulaire, brique plâtrée, carrelage collé sur BA13, etc."
  },
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [pendingTypeCommande, setPendingTypeCommande] = useState<TypeCommande>("");
  const [typeCommande, setTypeCommande] = useState<TypeCommande>("");
  
  // States pour le dialog de confirmation des déchets
  const [showWasteConfirmDialog, setShowWasteConfirmDialog] = useState(false);
  const [pendingWasteType, setPendingWasteType] = useState<string>("");
  const [wastePhoto, setWastePhoto] = useState<File | null>(null);
  const [wastePhotoPreview, setWastePhotoPreview] = useState<string>("");
  
  // Refs pour les inputs cachés
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Hook pour gérer les chantiers enregistrés
  const { chantiers, saveChantier, searchChantiers } = useChantiers(user?.id);

  const [formData, setFormData] = useState<FormData>({
    client_id: user?.id || "",
    type_dechet: "",
    categorie: "",
    volume_m3: "",
    nom_chantier: "",
    adresse: "",
    code_postal: "",
    ville: "",
    observations: "",
  });

  const [formDataBigBag, setFormDataBigBag] = useState<FormDataBigBag>({
    client_id: user?.id || "",
    pack_bigbag: "",
    type_dechet_bigbag: "",
    secteur_bigbag: "",
    poids_bigbag: "",
    adresse_enlevement: "",
    code_postal_enlevement: "",
    ville_enlevement: "",
    nom_contact_sur_place: "",
    tel_contact_sur_place: "",
    date_enlevement: "",
    observations_bigbag: "",
  });

  // Synchroniser le client_id quand l'utilisateur est chargé
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, client_id: user.id }));
      setFormDataBigBag(prev => ({ ...prev, client_id: user.id }));
    }
  }, [user?.id]);

  const totalSteps = typeCommande === "BIGBAG" ? 7 : typeCommande === "LOCATION_BENNE" ? 5 : 0;

  const handleWasteTypeSelect = (value: string) => {
    setPendingWasteType(value);
    setShowWasteConfirmDialog(true);
  };
  
  const handleBigBagWasteTypeSelect = (value: string) => {
    setPendingWasteType(value);
    setShowWasteConfirmDialog(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWastePhoto(file);
      // Créer une preview pour l'affichage uniquement
      const reader = new FileReader();
      reader.onload = (event) => {
        setWastePhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWasteType = () => {
    if (typeCommande === "LOCATION_BENNE") {
      const wasteType = WASTE_TYPES.find((w) => w.value === pendingWasteType);
      setFormData({
        ...formData,
        type_dechet: pendingWasteType,
        categorie: wasteType?.categorie || "",
        volume_m3: "",
      });
      setCurrentStep(2);
    } else if (typeCommande === "BIGBAG") {
      setFormDataBigBag({
        ...formDataBigBag,
        type_dechet_bigbag: pendingWasteType,
      });
      setCurrentStep(3);
    }
    
    // Reset dialog states (mais garder la photo pour l'envoi)
    setShowWasteConfirmDialog(false);
    setPendingWasteType("");
  };

  const handleVolumeSelect = (value: string) => {
    setFormData({ ...formData, volume_m3: value });
    setCurrentStep(3);
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Retour au choix (étape 0)
      setCurrentStep(0);
      setTypeCommande("");
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleSubmit = async () => {
    // Validation de sécurité
    const currentClientId = typeCommande === "BIGBAG" ? formDataBigBag.client_id : formData.client_id;
    if (!currentClientId) {
      toast.error("Erreur : utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Créer un FormData au lieu de JSON
      const formDataToSend = new FormData();
      
      // Ajouter tous les champs selon le type de commande
      if (typeCommande === "BIGBAG") {
        formDataToSend.append("type_commande", "BIGBAG");
        Object.entries(formDataBigBag).forEach(([key, value]) => {
          if (value) {
            formDataToSend.append(key, value);
          }
        });
      } else {
        formDataToSend.append("type_commande", "LOCATION_BENNE");
        Object.entries(formData).forEach(([key, value]) => {
          if (value) {
            formDataToSend.append(key, value);
          }
        });
      }
      
      // Ajouter la photo si présente (fichier réel)
      if (wastePhoto) {
        formDataToSend.append("photo", wastePhoto);
      }
      
      console.log("Envoi du formulaire avec multipart/form-data");
      
      // Appel à l'Edge Function proxy avec multipart/form-data
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-proxy`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            // PAS de Content-Type - le navigateur le définit automatiquement avec boundary
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Réponse du proxy:", result);
        toast.success("Demande envoyée avec succès !");
        
        // Sauvegarder le chantier si un nom a été fourni (pour Location de Benne)
        if (typeCommande === "LOCATION_BENNE" && formData.nom_chantier.trim()) {
          await saveChantier(
            formData.nom_chantier,
            formData.adresse,
            formData.code_postal,
            formData.ville
          );
        }
        
        // Réinitialiser et retourner à l'étape 0
        setCurrentStep(0);
        setTypeCommande("");
        setFormData({
          client_id: user?.id || "",
          type_dechet: "",
          categorie: "",
          volume_m3: "",
          nom_chantier: "",
          adresse: "",
          code_postal: "",
          ville: "",
          observations: "",
        });
        setFormDataBigBag({
          client_id: user?.id || "",
          pack_bigbag: "",
          type_dechet_bigbag: "",
          secteur_bigbag: "",
          poids_bigbag: "",
          adresse_enlevement: "",
          code_postal_enlevement: "",
          ville_enlevement: "",
          nom_contact_sur_place: "",
          tel_contact_sur_place: "",
          date_enlevement: "",
          observations_bigbag: "",
        });
        
        // Réinitialiser les états photo après succès
        setWastePhoto(null);
        setWastePhotoPreview("");
      } else {
        // Récupérer le message d'erreur détaillé
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Réponse d'erreur du proxy:", errorData);
          if (errorData.error || errorData.message) {
            errorMessage += `\n\nDétails: ${errorData.error || errorData.message}`;
          }
        } catch (e) {
          console.error("Impossible de lire la réponse d'erreur:", e);
        }
        toast.error(errorMessage, { duration: 10000 });
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      toast.error(`Erreur réseau: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { duration: 10000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {isAuthenticated ? (
        <div className="flex-1">
          {/* Header avec déconnexion */}
          <div className="w-full p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={logoLB}
                alt="Loc Bennes"
                className="h-12 w-12 md:h-14 md:w-14 object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Loc Bennes
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <PWAInstallButton />
              <Button 
                variant="outline"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="container mx-auto px-4 py-8">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={handleBack} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            )}

            {currentStep > 0 && <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />}

            {/* ÉTAPE 0 - Choix du type de commande */}
            {currentStep === 0 && (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-8 max-w-4xl w-full">
                  <h2 className="text-2xl md:text-3xl font-semibold">
                    Que souhaitez-vous ?
                  </h2>
                  
                    <div className="grid md:grid-cols-2 gap-6">
                    <Button
                      size="lg"
                      onClick={() => {
                        setPendingTypeCommande("LOCATION_BENNE");
                        setShowPricingDialog(true);
                      }}
                      className="h-auto py-8 px-6 flex flex-col items-center gap-4 text-lg"
                    >
                      <Truck className="h-12 w-12" />
                      <span>Location de Benne</span>
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        setPendingTypeCommande("BIGBAG");
                        setShowPricingDialog(true);
                      }}
                      className="h-auto py-8 px-6 flex flex-col items-center gap-4 text-lg border-primary text-primary hover:bg-primary/10"
                    >
                      <Package className="h-12 w-12" />
                      <span>Retrait Bigs bags</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PARCOURS LOCATION DE BENNE */}
            {typeCommande === "LOCATION_BENNE" && currentStep === 1 && (
              <WizardStep title="Type de déchet" description="Sélectionnez le type de déchet à évacuer">
                <div className="space-y-4">
                  <Label htmlFor="waste-type">Quel type de déchet souhaitez-vous évacuer ?</Label>
                  <Select onValueChange={handleWasteTypeSelect} value={formData.type_dechet}>
                    <SelectTrigger id="waste-type">
                      <SelectValue placeholder="Choisissez un type de déchet" />
                    </SelectTrigger>
                    <SelectContent>
                      {WASTE_TYPES.map((waste) => (
                        <SelectItem key={waste.value} value={waste.value}>
                          {waste.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </WizardStep>
            )}

            {typeCommande === "LOCATION_BENNE" && currentStep === 2 && formData.categorie && (
              <WizardStep title="Volume de la benne" description="Choisissez la taille adaptée à vos besoins">
                <div className="space-y-4">
                  <Label htmlFor="volume">Volume souhaité (m³)</Label>
                  <Select onValueChange={handleVolumeSelect} value={formData.volume_m3}>
                    <SelectTrigger id="volume">
                      <SelectValue placeholder="Sélectionnez un volume" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOLUMES[formData.categorie].map((vol) => (
                        <SelectItem key={vol} value={vol}>
                          <div className="flex flex-col">
                            <span className="font-medium">Benne {vol}</span>
                            <span className="text-xs text-muted-foreground">
                              {BENNE_DIMENSIONS[vol]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}


            {typeCommande === "LOCATION_BENNE" && currentStep === 3 && (
              <WizardStep title="Adresse de livraison" description="Où devons-nous livrer la benne ?">
                <div className="space-y-4">
                  <ChantierAutocomplete
                    value={formData.nom_chantier}
                    onChange={(value) => setFormData({ ...formData, nom_chantier: value })}
                    onSelect={(chantier: Chantier) => {
                      setFormData({
                        ...formData,
                        nom_chantier: chantier.nom_chantier,
                        adresse: chantier.adresse,
                        code_postal: chantier.code_postal,
                        ville: chantier.ville,
                      });
                    }}
                    chantiers={chantiers}
                    searchChantiers={searchChantiers}
                  />
                  <div>
                    <Label htmlFor="address">Adresse complète</Label>
                    <Input
                      id="address"
                      placeholder="12 rue de la République"
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal">Code postal</Label>
                      <Input
                        id="postal"
                        placeholder="83440"
                        value={formData.code_postal}
                        onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Fayence"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleNext} disabled={!formData.adresse || !formData.code_postal || !formData.ville}>
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "LOCATION_BENNE" && currentStep === 4 && (
              <WizardStep title="Observations" description="Informations complémentaires (optionnel)">
                <div className="space-y-4">
                  <Label htmlFor="observations">Informations utiles</Label>
                  <Textarea
                    id="observations"
                    placeholder="Ex: accès difficile, code portail 1234, hauteur limitée à 3m..."
                    rows={5}
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  />
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleNext}>
                      Voir le récapitulatif
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "LOCATION_BENNE" && currentStep === 5 && (
              <WizardStep title="Récapitulatif" description="Vérifiez vos informations avant l'envoi">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Type de déchet:</span>
                      <span>{formData.type_dechet}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Catégorie:</span>
                      <span>{formData.categorie}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Volume:</span>
                      <span>{formData.volume_m3}</span>
                    </div>
                    {formData.nom_chantier && (
                      <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                        <span className="font-medium">Nom du chantier:</span>
                        <span>{formData.nom_chantier}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Adresse:</span>
                      <span>{formData.adresse}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Code postal:</span>
                      <span>{formData.code_postal}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Ville:</span>
                      <span>{formData.ville}</span>
                    </div>
                    {formData.observations && (
                      <div className="p-3 bg-muted/50 rounded">
                        <span className="font-medium block mb-1">Observations:</span>
                        <span className="text-sm">{formData.observations}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer ma demande
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {/* PARCOURS BIGBAG */}
            {typeCommande === "BIGBAG" && currentStep === 1 && (
              <WizardStep title="Choix du pack BigBag" description="Sélectionnez votre pack">
                <div className="space-y-4">
                  <Label htmlFor="pack-bigbag">Quel pack souhaitez-vous ?</Label>
                  <Select
                    onValueChange={(value) => {
                      setFormDataBigBag({ ...formDataBigBag, pack_bigbag: value });
                      handleNext();
                    }}
                    value={formDataBigBag.pack_bigbag}
                  >
                    <SelectTrigger id="pack-bigbag">
                      <SelectValue placeholder="Choisissez un pack" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIGBAG_PACKS.map((pack) => (
                        <SelectItem key={pack} value={pack}>
                          {pack}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 2 && (
              <WizardStep title="Type de déchet" description="Quel type de déchet allez-vous jeter ?">
                <div className="space-y-4">
                  <Label htmlFor="waste-bigbag">Type de déchet</Label>
                  <Select
                    onValueChange={handleBigBagWasteTypeSelect}
                    value={formDataBigBag.type_dechet_bigbag}
                  >
                    <SelectTrigger id="waste-bigbag">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIGBAG_WASTE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 3 && (
              <WizardStep title="Secteur d'enlèvement" description="Où se situe votre chantier ?">
                <div className="space-y-4">
                  <Label htmlFor="sector-bigbag">Secteur</Label>
                  <Select
                    onValueChange={(value) => {
                      setFormDataBigBag({ ...formDataBigBag, secteur_bigbag: value });
                      handleNext();
                    }}
                    value={formDataBigBag.secteur_bigbag}
                  >
                    <SelectTrigger id="sector-bigbag">
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIGBAG_SECTORS.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 4 && (
              <WizardStep title="Poids estimé" description="Estimation du poids total (optionnel)">
                <div className="space-y-4">
                  <Label htmlFor="weight-bigbag">Poids estimé total (en tonnes, max 1T / BigBag)</Label>
                  <Input
                    id="weight-bigbag"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ex: 2.5"
                    value={formDataBigBag.poids_bigbag}
                    onChange={(e) => setFormDataBigBag({ ...formDataBigBag, poids_bigbag: e.target.value })}
                  />
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleNext}>
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 5 && (
              <WizardStep title="Adresse d'enlèvement" description="Où devons-nous venir récupérer les BigBag ?">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adresse-enlevement">Adresse d'enlèvement *</Label>
                    <Input
                      id="adresse-enlevement"
                      placeholder="12 rue de la République"
                      value={formDataBigBag.adresse_enlevement}
                      onChange={(e) => setFormDataBigBag({ ...formDataBigBag, adresse_enlevement: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal-enlevement">Code postal *</Label>
                      <Input
                        id="postal-enlevement"
                        placeholder="83440"
                        value={formDataBigBag.code_postal_enlevement}
                        onChange={(e) => setFormDataBigBag({ ...formDataBigBag, code_postal_enlevement: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ville-enlevement">Ville *</Label>
                      <Input
                        id="ville-enlevement"
                        placeholder="Fayence"
                        value={formDataBigBag.ville_enlevement}
                        onChange={(e) => setFormDataBigBag({ ...formDataBigBag, ville_enlevement: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-4">Contact sur place</p>
                    <div>
                      <Label htmlFor="nom-contact">Nom du contact *</Label>
                      <Input
                        id="nom-contact"
                        placeholder="Nom du contact sur place"
                        value={formDataBigBag.nom_contact_sur_place}
                        onChange={(e) => setFormDataBigBag({ ...formDataBigBag, nom_contact_sur_place: e.target.value })}
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="tel-contact">Téléphone du contact *</Label>
                      <Input
                        id="tel-contact"
                        type="tel"
                        placeholder="06 12 34 56 78"
                        value={formDataBigBag.tel_contact_sur_place}
                        onChange={(e) => setFormDataBigBag({ ...formDataBigBag, tel_contact_sur_place: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-4">Date d'enlèvement souhaitée *</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formDataBigBag.date_enlevement 
                            ? format(new Date(formDataBigBag.date_enlevement), "PPP", { locale: fr })
                            : "Sélectionnez une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formDataBigBag.date_enlevement ? new Date(formDataBigBag.date_enlevement) : undefined}
                          onSelect={(date) => setFormDataBigBag({
                            ...formDataBigBag,
                            date_enlevement: date ? date.toISOString() : ""
                          })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        !formDataBigBag.adresse_enlevement ||
                        !formDataBigBag.code_postal_enlevement ||
                        !formDataBigBag.ville_enlevement ||
                        !formDataBigBag.nom_contact_sur_place ||
                        !formDataBigBag.tel_contact_sur_place ||
                        !formDataBigBag.date_enlevement
                      }
                    >
                      Suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 6 && (
              <WizardStep title="Observations" description="Informations complémentaires (optionnel)">
                <div className="space-y-4">
                  <Label htmlFor="observations-bigbag">Informations utiles</Label>
                  <Textarea
                    id="observations-bigbag"
                    placeholder="Ex: accès difficile, code portail 1234, hauteur limitée..."
                    rows={5}
                    value={formDataBigBag.observations_bigbag}
                    onChange={(e) => setFormDataBigBag({ ...formDataBigBag, observations_bigbag: e.target.value })}
                  />
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleNext}>
                      Voir le récapitulatif
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}

            {typeCommande === "BIGBAG" && currentStep === 7 && (
              <WizardStep title="Récapitulatif" description="Vérifiez vos informations avant l'envoi">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Type de commande:</span>
                      <span>BigBag</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Pack:</span>
                      <span>{formDataBigBag.pack_bigbag}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Type de déchet:</span>
                      <span>{formDataBigBag.type_dechet_bigbag}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Secteur:</span>
                      <span>{formDataBigBag.secteur_bigbag}</span>
                    </div>
                    {formDataBigBag.poids_bigbag && (
                      <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                        <span className="font-medium">Poids estimé:</span>
                        <span>{formDataBigBag.poids_bigbag} tonnes</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Adresse d'enlèvement:</span>
                      <span>{formDataBigBag.adresse_enlevement}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Code postal:</span>
                      <span>{formDataBigBag.code_postal_enlevement}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Ville:</span>
                      <span>{formDataBigBag.ville_enlevement}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Contact sur place:</span>
                      <span>{formDataBigBag.nom_contact_sur_place} - {formDataBigBag.tel_contact_sur_place}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded">
                      <span className="font-medium">Date d'enlèvement:</span>
                      <span>{format(new Date(formDataBigBag.date_enlevement), "PPP", { locale: fr })}</span>
                    </div>
                    {formDataBigBag.observations_bigbag && (
                      <div className="p-3 bg-muted/50 rounded">
                        <span className="font-medium block mb-1">Observations:</span>
                        <span className="text-sm">{formDataBigBag.observations_bigbag}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer ma demande
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </WizardStep>
            )}
          </div>

          {/* Dialog de confirmation du type de déchet */}
          <Dialog open={showWasteConfirmDialog} onOpenChange={setShowWasteConfirmDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirmez votre type de déchet</DialogTitle>
                <DialogDescription>
                  Vérifiez que votre déchet correspond bien à cette catégorie
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Titre et liste des éléments inclus */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold text-lg mb-3">
                    {WASTE_TYPE_DESCRIPTIONS[pendingWasteType]?.title}
                  </p>
                  <p className="text-sm font-medium mb-2">Ce type de déchet comprend :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {WASTE_TYPE_DESCRIPTIONS[pendingWasteType]?.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {WASTE_TYPE_DESCRIPTIONS[pendingWasteType]?.examples && (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      {WASTE_TYPE_DESCRIPTIONS[pendingWasteType].examples}
                    </p>
                  )}
                </div>
                
                {/* Upload de photo */}
                <div className="space-y-2">
                  <Label>Photo de vos déchets (optionnel)</Label>
                  <div className="flex gap-2">
                    {/* Bouton pour prendre une photo */}
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Prendre une photo
                    </Button>
                    
                    {/* Bouton pour choisir dans la galerie */}
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Galerie
                    </Button>
                  </div>
                  
                  {/* Input caché pour l'appareil photo */}
                  <input 
                    ref={cameraInputRef}
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {/* Input caché pour la galerie */}
                  <input 
                    ref={galleryInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  
                  {wastePhotoPreview && (
                    <div className="mt-3">
                      <img 
                        src={wastePhotoPreview} 
                        alt="Aperçu" 
                        className="max-h-40 rounded-lg border object-cover w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowWasteConfirmDialog(false);
                    setWastePhoto(null);
                    setWastePhotoPreview("");
                    setPendingWasteType("");
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleConfirmWasteType}>
                  Confirmer ce type de déchet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de tarification */}
          <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {pendingTypeCommande === "LOCATION_BENNE" 
                    ? "Grille tarifaire - Location de Benne" 
                    : "Grille tarifaire - Retrait BigBag"}
                </DialogTitle>
                <DialogDescription>
                  Tarifs estimatifs HT - Le prix final dépend du poids réel
                </DialogDescription>
              </DialogHeader>
              
              {pendingTypeCommande && (
                <PricingTable type={pendingTypeCommande as "LOCATION_BENNE" | "BIGBAG"} />
              )}
              
              <DialogFooter className="gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPricingDialog(false);
                    setPendingTypeCommande("");
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={() => {
                  setTypeCommande(pendingTypeCommande);
                  setCurrentStep(1);
                  setShowPricingDialog(false);
                  setPendingTypeCommande("");
                }}>
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-8 p-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Loc Bennes
              </h1>
              <p className="text-xl text-muted-foreground">
                Solution d'évacuation des déchets
              </p>
            </div>
            
            <div className="space-x-4">
              <Button 
                size="lg"
                onClick={() => navigate("/login")}
                className="text-lg px-8 py-6"
              >
                Se connecter
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/signup")}
                className="text-lg px-8 py-6"
              >
                Créer un compte
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t" />
    </div>
  );
};

export default Index;
