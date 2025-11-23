"use client";

import CancelButton from "@/app/_components/Story/CancelButton";
import SubmitButton from "@/app/_components/Story/SubmitButton";
import { UploadV2 } from "@/app/_components/common/UploadV2";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useStoryModal from "@/hooks/useStoryModal";
import type { StoryType } from "@/types";
import FeelingActivityPicker from "@/app_components/Story/FeelingActivityPicker";
import LocationPicker from "@/app_components/Story/LocationPicker";
import PrivacySelector from "@/app_components/Story/PrivacySelector";
import RichTextEditor from "@/app_components/Story/RichTextEditor";
import type { FormattingAction } from "@/app_components/Story/PostFormattingToolbar";
import {
	forwardRef,
	useCallback,
	useEffect,
	type FormEvent,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";

export interface CreateStoryModalProps {
	selectedStory?: StoryType | null;
	createIndex?: number | null;
	maxIndex?: number | null;
	setCreateIndex: (index: number | null) => void;
}

export interface CreateStoryModalRef {
	openModal: () => void;
}

const backgroundPresets = [
	"bg-gradient-to-r from-blue-500 to-purple-600 text-white",
	"bg-gradient-to-r from-amber-500 to-pink-500 text-white",
	"bg-gradient-to-r from-emerald-500 to-cyan-500 text-white",
	"bg-gradient-to-r from-indigo-600 to-sky-500 text-white",
	"bg-gradient-to-r from-slate-900 to-slate-700 text-slate-100",
];

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

		const [manualActions, setManualActions] = useState<FormattingAction[]>([]);
		const [openMediaPicker, setOpenMediaPicker] =
			useState<(() => void) | null>(null);
		const [pollQuestion, setPollQuestion] = useState("");
		const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
		const privacyRowRef = useRef<HTMLDivElement>(null);
		const [isPrivacyHighlighted, setIsPrivacyHighlighted] = useState(false);
		const cachedDescriptionRef = useRef<string>(form.watch("description") || "");

		const postFormat = form.watch("postFormat");
		const backgroundStyle = form.watch("backgroundStyle");
		const privacyValue = form.watch("privacy") || "public";
		const watchLocation = form.watch("location");
		const watchFeeling = form.watch("feeling");
		const watchActivity = form.watch("activity");
		const scheduleAt = form.watch("scheduledPublishTime");
		const mentionedUsers = form.watch("mentionedUsers") || [];
		const description = form.watch("description") || "";

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

		const pollDescription = useMemo(() => {
			const options = pollOptions.filter(opt => opt.trim().length > 0);
			return JSON.stringify({
				question: pollQuestion.trim(),
				options,
			});
		}, [pollOptions, pollQuestion]);

		useEffect(() => {
			if (postFormat === "poll") {
				form.setValue("description", pollDescription);
			} else {
				if (description === pollDescription) {
					form.setValue("description", cachedDescriptionRef.current);
				} else {
					cachedDescriptionRef.current = description;
				}
			}
		}, [description, form, pollDescription, postFormat]);

		useEffect(() => {
			if (!isOpen) {
				setManualActions([]);
				return;
			}

			if (selectedStory) {
				const preset: FormattingAction[] = [];
				if (selectedStory.location) preset.push("location");
				if (selectedStory.feeling || selectedStory.activity)
					preset.push("feeling");
				if (selectedStory.mentionedUsers?.length) preset.push("tag");
				if (selectedStory.scheduledPublishTime) preset.push("schedule");
				if (selectedStory.privacy && selectedStory.privacy !== "public")
					preset.push("privacy");
				setManualActions(preset);
			} else {
				setManualActions([]);
			}
		}, [isOpen, selectedStory]);

		useEffect(() => {
			if (selectedStory?.postFormat === "poll" && selectedStory.description) {
				try {
					const parsed = JSON.parse(selectedStory.description);
					setPollQuestion(parsed?.question || "");
					setPollOptions(parsed?.options?.length ? parsed.options : ["", ""]);
				} catch {
					setPollQuestion(selectedStory.description);
					setPollOptions(["", ""]);
				}
			} else {
				setPollQuestion("");
				setPollOptions(["", ""]);
			}
		}, [selectedStory]);

		const autoActions = useMemo(() => {
			const next: FormattingAction[] = [];
			if (watchLocation) next.push("location");
			if (watchFeeling || watchActivity) next.push("feeling");
			if (mentionedUsers.length) next.push("tag");
			if (scheduleAt) next.push("schedule");
			if (privacyValue !== "public") next.push("privacy");
			return next;
		}, [
			watchLocation,
			watchFeeling,
			watchActivity,
			mentionedUsers,
			scheduleAt,
			privacyValue,
		]);

		const activeActions = useMemo(
			() => Array.from(new Set([...manualActions, ...autoActions])),
			[manualActions, autoActions]
		);

		const toggleAction = (action: FormattingAction) => {
			setManualActions(prev =>
				prev.includes(action)
					? prev.filter(a => a !== action)
					: [...prev, action]
			);
		};

		const handleToolbarAction = (action: FormattingAction) => {
			if (action === "add-media") {
				openMediaPicker?.();
				return;
			}

			if (action === "privacy") {
				privacyRowRef.current?.scrollIntoView({ behavior: "smooth" });
				setIsPrivacyHighlighted(true);
				setTimeout(() => setIsPrivacyHighlighted(false), 1200);
				return;
			}

			toggleAction(action);
		};

		const handleLocationChange = (
			location: string,
			lat?: number,
			lng?: number
		) => {
			form.setValue("location", location);
			if (lat) form.setValue("locationLat", lat);
			if (lng) form.setValue("locationLng", lng);
			toggleAction("location");
		};

		const handleFeelingActivityChange = (
			type: "feeling" | "activity",
			value: string
		) => {
			form.setValue(type, value);
			toggleAction("feeling");
		};

		const handleMentionChange = (value: string) => {
			const mentions = value
				.split(",")
				.map(item => item.trim())
				.filter(Boolean);
			form.setValue("mentionedUsers", mentions);
			if (mentions.length) toggleAction("tag");
		};

		const handleScheduleChange = (value: string) => {
			const parsed = value ? new Date(value) : undefined;
			form.setValue("scheduledPublishTime", parsed as any);
			if (value) toggleAction("schedule");
		};

		const handlePrivacyChange = (value: "public" | "friends" | "onlyme") => {
			form.setValue("privacy", value);
			toggleAction("privacy");
		};

		const handleFormSubmit = (event: FormEvent) => {
			if (postFormat === "poll") {
				const validOptions = pollOptions.filter(opt => opt.trim().length > 0);
				if (!pollQuestion.trim()) {
					event.preventDefault();
					toast.error("Please enter a poll question");
					return;
				}
				if (validOptions.length < 2) {
					event.preventDefault();
					toast.error("Add at least 2 poll options");
					return;
				}
			}
			handleSubmit(event);
		};

		const scheduleValue = useMemo(() => {
			if (!scheduleAt) return "";
			const date = new Date(scheduleAt);
			const isoString = date.toISOString();
			return isoString.substring(0, 16);
		}, [scheduleAt]);

		const renderMetadata = () => (
			<div className="space-y-3 rounded-md border bg-muted/40 p-3">
				<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					Extras
				</div>

				{activeActions.includes("location") && (
					<LocationPicker
						location={form.watch("location") || ""}
						onLocationChange={handleLocationChange}
					/>
				)}

				{activeActions.includes("feeling") && (
					<FeelingActivityPicker
						feeling={form.watch("feeling") || ""}
						activity={form.watch("activity") || ""}
						onSelect={handleFeelingActivityChange}
					/>
				)}

				{activeActions.includes("tag") && (
					<div className="grid gap-1.5">
						<Label htmlFor="mention">Tag friends</Label>
						<Input
							id="mention"
							placeholder="user-1, user-2"
							defaultValue={mentionedUsers.join(", ")}
							onBlur={e => handleMentionChange(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Type usernames or emails separated by commas.
						</p>
					</div>
				)}

				{activeActions.includes("schedule") && (
					<div className="grid gap-1.5">
						<Label htmlFor="schedule">Schedule</Label>
						<Input
							id="schedule"
							type="datetime-local"
							value={scheduleValue}
							onChange={e => handleScheduleChange(e.target.value)}
						/>
					</div>
				)}
			</div>
		);

		const renderBackgroundSelector = () => (
			<div className="grid grid-cols-5 gap-2">
				{backgroundPresets.map(value => {
					const isActive = backgroundStyle === value;
					return (
						<button
							key={value}
							type="button"
							className={`h-10 rounded-md border transition hover:scale-[1.02] ${value} ${
								isActive ? "ring-2 ring-offset-2 ring-primary" : "border-transparent"
							}`}
							onClick={() => form.setValue("backgroundStyle", value)}
							aria-label={`Choose background ${value}`}
						/>
					);
				})}
			</div>
		);

		const renderPollOptions = () => (
			<div className="space-y-2">
				<Label className="text-sm font-medium leading-none">Options</Label>
				<div className="space-y-2">
					{pollOptions.map((option, index) => (
						<div key={index} className="flex items-center gap-2">
							<Input
								value={option}
								onChange={e => {
									const next = [...pollOptions];
									next[index] = e.target.value;
									setPollOptions(next);
								}}
								placeholder={`Option ${index + 1}`}
							/>
							{pollOptions.length > 2 && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() =>
										setPollOptions(prev => prev.filter((_, i) => i !== index))
									}
								>
									Remove
								</Button>
							)}
						</div>
					))}
					{pollOptions.length < 6 && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setPollOptions(prev => [...prev, ""])}
						>
							Add option
						</Button>
					)}
				</div>
			</div>
		);

		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="pt-14 max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
					<DialogHeader className="mb-4">
						<DialogTitle>
							{props.selectedStory ? "Edit Post" : "Create New Post"}
						</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleFormSubmit}>
						<div className="grid w-full items-center gap-1.5 mb-4">
							<Label
								htmlFor="name"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Title
							</Label>
							<Input
								{...form.register("name")}
								error={form.formState.errors.name?.message}
								placeholder="Add a short headline"
								id="name"
							/>
						</div>

						<Tabs
							value={postFormat}
							onValueChange={v => form.setValue("postFormat", v as any)}
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="standard">Standard</TabsTrigger>
								<TabsTrigger value="background">Background</TabsTrigger>
								<TabsTrigger value="poll">Poll</TabsTrigger>
							</TabsList>

							<TabsContent value="standard" className="pt-4">
								<div className="space-y-4">
									<div className="grid w-full items-center gap-2">
										<Label
											htmlFor="description"
											className="text-sm font-medium leading-none"
										>
											Description
										</Label>
										<RichTextEditor
											content={description}
											onChange={content => form.setValue("description", content)}
											placeholder="What's on your mind?"
											onSpecialAction={handleToolbarAction}
											activeActions={activeActions}
										/>
									</div>

									{renderMetadata()}

									<div className="grid w-full items-center gap-2">
										<div className="flex items-center justify-between">
											<Label className="text-sm font-medium">Media</Label>
											<span className="text-xs text-muted-foreground">
												Images or videos (up to 9)
											</span>
										</div>
										<UploadV2
											fileList={fileList}
											setFileList={setFileList}
											accept="image/*,video/*"
											onPickerReady={trigger => setOpenMediaPicker(() => trigger)}
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="background" className="pt-4">
								<div className="space-y-4">
									<div className="grid w-full items-center gap-2">
										<Label className="text-sm font-medium leading-none">
											Background post
										</Label>
										<div
											className={`rounded-xl p-3 border ${
												backgroundStyle || backgroundPresets[0]
											} bg-blend-overlay`}
										>
											<RichTextEditor
												content={description}
												onChange={content =>
													form.setValue("description", content)
												}
												placeholder="Share one bold thought..."
												className="text-center text-base font-semibold leading-6 min-h-[140px]"
												onSpecialAction={handleToolbarAction}
												activeActions={activeActions}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium leading-none">
											Quick backgrounds
										</Label>
										{renderBackgroundSelector()}
									</div>
								</div>
							</TabsContent>

							<TabsContent value="poll" className="pt-4">
								<div className="space-y-4">
									<div className="grid gap-2">
										<Label className="text-sm font-medium leading-none">
											Question
										</Label>
										<Input
											value={pollQuestion}
											onChange={e => setPollQuestion(e.target.value)}
											placeholder="What do you want to ask?"
										/>
									</div>

									{renderPollOptions()}

									{renderMetadata()}
								</div>
							</TabsContent>
						</Tabs>

						<div
							ref={privacyRowRef}
							className={`flex items-center justify-between mt-6 mb-4 rounded-md border p-3 transition ${
								isPrivacyHighlighted ? "ring-2 ring-offset-2 ring-primary" : ""
							}`}
						>
							<Label className="text-sm font-medium">Who can see your post?</Label>
							<PrivacySelector value={privacyValue} onChange={handlePrivacyChange} />
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
								handleSubmit={handleFormSubmit as any}
								selectedStory={selectedStory}
							/>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	}
);

CreateStoryModal.displayName = "CreateStoryModal";

export default CreateStoryModal;
