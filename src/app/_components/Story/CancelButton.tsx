import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface CancelButtonProps {
	dataName: string;
	onClose: () => void;
	confirm: (e: any) => void;
	cancel: (e: any) => void;
}

const CancelButton = ({
	dataName,
	onClose,
	confirm,
	cancel,
}: CancelButtonProps) => {
	const handleConfirm = () => confirm({ onClose });
	const handleCancel = () => cancel({ onClose });

	return dataName ? (
		<Popover>
			<PopoverTrigger asChild={true}>
				<Button className="bg-accent" variant="default">
					Cancel
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">Discard changes?</h4>
						<p className="text-sm text-muted-foreground">
							Are you want to save your draft?
						</p>
					</div>
					<div className="flex justify-end gap-2">
						<Button size="sm" variant="ghost" onClick={handleConfirm}>
							No
						</Button>
						<Button size="sm" color="danger" onClick={handleCancel}>
							Yes
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	) : (
		<Button color="danger" variant="ghost" onClick={onClose}>
			Cancel
		</Button>
	);
};

export default CancelButton;
