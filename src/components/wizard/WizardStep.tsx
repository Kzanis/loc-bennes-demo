import { ReactNode } from "react";
import { motion } from "framer-motion";

interface WizardStepProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const WizardStep = ({ children, title, description }: WizardStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="bg-card rounded-lg border p-6 md:p-8">
        {children}
      </div>
    </motion.div>
  );
};
