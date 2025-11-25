import { X } from "lucide-react";
import type { ComponentProps, FunctionComponent } from "react";

import {
  MapControls,
  MapControlsProps,
  StoreList,
  StoreListProps,
} from "@/app/_components/Map";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mapControlsProps: MapControlsProps;
  storeListProps: StoreListProps;
}

export const DesktopSidebar: FunctionComponent<DesktopSidebarProps> = ({
  isOpen,
  onClose,
  mapControlsProps,
  storeListProps,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="p-0 w-[320px] sm:w-[380px] bg-white dark:bg-gray-900 flex flex-col"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Stores</h2>
        </div>
        <div className="p-4 border-b">
          <MapControls
            {...mapControlsProps}
            storeListProps={storeListProps}
            onClose={onClose}
            className="shadow-none p-0 md:p-4"
            showAddLocation={false}
            showSearch={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
