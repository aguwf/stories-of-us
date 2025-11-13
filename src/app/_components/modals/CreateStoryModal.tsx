"use client";

import { UploadV2 } from "@/app/_components/common/UploadV2";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoryType } from "@/types";

import useStoryModal from "@/hooks/useStoryModal";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import CancelButton from "../Story/CancelButton";
import SubmitButton from "../Story/SubmitButton";

export interface CreateStoryModalProps {
	selectedStory?: StoryType | null;
	createIndex?: number | null;
	maxIndex?: number | null;
	setCreateIndex: (index: number | null) => void;
}

export interface CreateStoryModalRef {
	openModal: () => void;
}

const CreateStoryModal = forwardRef<CreateStoryModalRef, CreateStoryModalProps>(
	(props, ref) => {
		const {
			isOpen,
			onClose,
			onOpen,
			fileList,
			setFileList,
			isUploading,
			form,
			handleSubmit,
			resetModal,
			selectedStory,
		} = useStoryModal(props);

		useImperativeHandle(
			ref,
			() => ({
				openModal: onOpen,
			}),
			[onOpen]
		);

		const confirm = useCallback(
			({ onClose }: { onClose: () => void }) => {
				onClose();
				resetModal();
			},
			[resetModal]
		);

		const cancel = useCallback(({ onClose }: { onClose: () => void }) => {
			onClose();
		}, []);

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="pt-16 max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader className="mb-4">
						<DialogTitle>
							{props.selectedStory ? "Edit Story" : "Create new memory"}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit}>
						<div>
							<div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
								<Label
									htmlFor="name"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Title
								</Label>
								<Input
									{...form.register("name")}
									error={form.formState.errors.name?.message}
									placeholder="Enter your title"
									id="name"
								/>
							</div>
							<div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
								<Label
									htmlFor="description"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Description
								</Label>
								<Textarea
									{...form.register("description")}
									error={form.formState.errors.description?.message}
									placeholder="Enter your description"
									id="description"
								/>
							</div>
							<div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
								<Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
									Cover Image
								</Label>
								<UploadV2 fileList={fileList} setFileList={setFileList} />
							</div>
						</div>

						<DialogFooter className="gap-2">
							<CancelButton
								dataName={form.getValues("name")}
								onClose={onClose}
								confirm={confirm}
								cancel={cancel}
							/>
							<SubmitButton
								isUploading={isUploading}
								type="submit"
								handleSubmit={handleSubmit}
								selectedStory={selectedStory}
							/>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	}
);

export default CreateStoryModal;
