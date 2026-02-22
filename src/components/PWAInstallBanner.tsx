import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PWAInstallBanner() {
  const { isInstallable, isIOS, canPrompt, promptInstall, dismissBanner } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="relative bg-card border-2 border-primary rounded-xl p-4 shadow-lg shadow-primary/20">
          {/* Bouton fermer */}
          <button
            onClick={dismissBanner}
            className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          {isIOS ? (
            // Instructions iOS
            <div className="pr-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Share className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Installer Loc Bennes
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Touchez <span className="inline-flex items-center"><Share className="w-3 h-3 mx-0.5" /></span> Partager, 
                    puis <strong>"Sur l'écran d'accueil"</strong>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={dismissBanner}
                  className="text-xs"
                >
                  Compris
                </Button>
              </div>
            </div>
          ) : canPrompt ? (
            // Bouton Android/Chrome
            <div className="pr-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    Installer Loc Bennes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Accédez rapidement à l'application depuis votre écran d'accueil
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissBanner}
                  className="text-xs text-muted-foreground"
                >
                  Plus tard
                </Button>
                <Button
                  size="sm"
                  onClick={promptInstall}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Installer
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
