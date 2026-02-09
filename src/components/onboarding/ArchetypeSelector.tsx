import { motion } from "framer-motion";
import { Anchor, HeartHandshake, Sprout, Link } from "lucide-react";
import { ARCHETYPE_CONFIGS } from "@/config/archetypes";
import type { IdentityArchetype } from "@/types/session";

interface ArchetypeSelectorProps {
  selected: IdentityArchetype | null;
  onSelect: (archetype: IdentityArchetype) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "anchor": Anchor,
  "heart-handshake": HeartHandshake,
  "sprout": Sprout,
  "link": Link,
};

export function ArchetypeSelector({ selected, onSelect }: ArchetypeSelectorProps) {
  const archetypes = Object.values(ARCHETYPE_CONFIGS);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Choose your growth identity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Which resonates with who you want to become?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {archetypes.map((config, i) => {
          const Icon = ICON_MAP[config.icon] || Anchor;
          const isSelected = selected === config.id;

          return (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                onClick={() => onSelect(config.id)}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                <Icon className={`w-8 h-8 ${isSelected ? "text-primary" : "text-muted-foreground"} mb-3`} />
                <h3 className="font-medium text-foreground">{config.label}</h3>
                <p className="text-sm text-muted-foreground italic mt-1">{config.tagline}</p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Show description of selected archetype */}
      {selected && (
        <motion.div
          key={selected}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            {ARCHETYPE_CONFIGS[selected].description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
