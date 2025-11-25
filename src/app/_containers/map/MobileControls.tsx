import type { ComponentProps, FunctionComponent } from "react";

import { MapControls } from "@/app/_components/Map";

interface MobileControlsProps {
  mapControlsProps: ComponentProps<typeof MapControls>;
}

export const MobileControls: FunctionComponent<MobileControlsProps> = ({
  mapControlsProps,
}) => (
  <div className="absolute top-4 left-4 right-4 z-10">
    <MapControls {...mapControlsProps} />
  </div>
);
