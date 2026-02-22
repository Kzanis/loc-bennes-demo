import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share } from 'lucide-react';

export function PWAInstallButton() {
  const { isInstallable, isIOS, canPrompt, promptInstall } = usePWAInstall();

  // Ne rien afficher si l'app est déjà installée ou si on ne peut pas proposer l'installation
  if (!isInstallable) return null;

  // Pour iOS, on affiche un dialog avec les instructions
  if (isIOS) {
    return (
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Download className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Installer l'application</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Installer Loc Bennes
            </DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>Pour installer l'application sur votre appareil :</p>
              <ol className="list-decimal list-inside space-y-2 text-foreground">
                <li className="flex items-start gap-2">
                  <span>1.</span>
                  <span>
                    Touchez l'icône <Share className="inline h-4 w-4 mx-1" /> <strong>Partager</strong> en bas de l'écran
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2.</span>
                  <span>
                    Faites défiler et touchez <strong>"Sur l'écran d'accueil"</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3.</span>
                  <span>
                    Confirmez en touchant <strong>"Ajouter"</strong>
                  </span>
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Pour Android/Chrome, on déclenche directement le prompt
  if (canPrompt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={promptInstall}
            className="relative"
          >
            <Download className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Installer l'application</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Pour desktop sans prompt automatique, afficher les instructions
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Download className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Installer l'application</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Installer Loc Bennes
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>Pour installer l'application sur votre ordinateur :</p>
            <ol className="list-decimal list-inside space-y-2 text-foreground">
              <li className="flex items-start gap-2">
                <span>1.</span>
                <span>
                  Cliquez sur l'icône <strong>⋮</strong> (menu) en haut à droite du navigateur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>2.</span>
                <span>
                  Sélectionnez <strong>"Installer Loc Bennes"</strong> ou <strong>"Installer l'application"</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>3.</span>
                <span>
                  Ou cherchez l'icône <Download className="inline h-4 w-4 mx-1" /> dans la barre d'adresse
                </span>
              </li>
            </ol>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
