import { cn } from "@/lib/utils";
import { MAP_STYLES } from "@/utils/mapConstants";
import { Check, Globe, Map as MapIcon, Moon, Sun } from "lucide-react";
import type { FunctionComponent } from "react";

interface MapStyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const STYLES = [
  {
    id: MAP_STYLES.MAPBOX_STYLE,
    label: "Streets",
    icon: MapIcon,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: MAP_STYLES.SATELLITE,
    label: "Satellite",
    icon: Globe,
    color: "bg-green-100 text-green-600",
  },
  {
    id: MAP_STYLES.LIGHT,
    label: "Light",
    icon: Sun,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: MAP_STYLES.DARK,
    label: "Dark",
    icon: Moon,
    color: "bg-slate-800 text-slate-200",
  },
];

export const MapStyleSwitcher: FunctionComponent<MapStyleSwitcherProps> = ({
  currentStyle,
  onStyleChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onStyleChange(style.id)}
          className={cn(
            "relative flex items-center gap-2 p-2 rounded-lg border transition-all",
            currentStyle === style.id
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <div className={cn("p-1.5 rounded-md", style.color)}>
            <style.icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {style.label}
          </span>
          {currentStyle === style.id && (
            <div className="absolute top-1 right-1">
              <Check className="w-3 h-3 text-primary" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
