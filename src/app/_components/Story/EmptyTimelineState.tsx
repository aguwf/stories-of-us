import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Image from "next/image";

interface EmptyTimelineStateProps {
  openCreateModal: () => void;
}

export default function EmptyTimelineState({ openCreateModal }: EmptyTimelineStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 py-8 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="relative w-64 h-64 mb-6">
        <Image 
          src="/assets/images/empty-timeline.svg" 
          alt="Empty Timeline" 
          fill={true}
          className="object-contain"
          priority={true}
        />
      </div>
      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Your Timeline Awaits</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Every journey begins with a single step. Share your first moment, thought or experience 
        and start building your personal timeline today.
      </p>
      <Button
        onClick={openCreateModal} 
        className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
        size="lg"
      >
        <PlusCircle size={18} />
        Create Your First Post
      </Button>
    </div>
  );
}