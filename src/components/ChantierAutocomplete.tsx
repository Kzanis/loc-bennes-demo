import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chantier } from "@/hooks/useChantiers";

interface ChantierAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (chantier: Chantier) => void;
  chantiers: Chantier[];
  searchChantiers: (query: string) => Chantier[];
}

export function ChantierAutocomplete({
  value,
  onChange,
  onSelect,
  chantiers,
  searchChantiers,
}: ChantierAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredChantiers, setFilteredChantiers] = useState<Chantier[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les suggestions quand la valeur change
  useEffect(() => {
    const results = searchChantiers(value);
    setFilteredChantiers(results);
  }, [value, searchChantiers]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelectChantier = (chantier: Chantier) => {
    onChange(chantier.nom_chantier);
    onSelect(chantier);
    setIsOpen(false);
  };

  const showDropdown = isOpen && (filteredChantiers.length > 0 || (value.trim() && chantiers.length > 0));

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="site-name">Nom du chantier (optionnel)</Label>
      <Input
        id="site-name"
        placeholder="Ex: Villa Dupont, Résidence Les Oliviers..."
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredChantiers.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                Chantiers enregistrés
              </div>
              {filteredChantiers.map((chantier) => (
                <button
                  key={chantier.id}
                  type="button"
                  onClick={() => handleSelectChantier(chantier)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                    "flex items-start gap-3"
                  )}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{chantier.nom_chantier}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {chantier.adresse}, {chantier.code_postal} {chantier.ville}
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : value.trim() ? (
            <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau chantier : "{value}"</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
