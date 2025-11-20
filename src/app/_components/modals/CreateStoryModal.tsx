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
import type { StoryType } from "@/types";

import useStoryModal from "@/hooks/useStoryModal";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CancelButton from "@/app/_components/Story/CancelButton";
import SubmitButton from "@/app/_components/Story/SubmitButton";
import { FormattingAction } from "@/app_components/Story/PostFormattingToolbar";
import LocationPicker from "@/app_components/Story/LocationPicker";
import FeelingActivityPicker from "@/app_components/Story/FeelingActivityPicker";
import PrivacySelector from "@/app_components/Story/PrivacySelector";
import RichTextEditor from "@/app_components/Story/RichTextEditor";

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

    const [activeActions, setActiveActions] = useState<FormattingAction[]>([]);

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

    const handleToolbarAction = (action: FormattingAction) => {
      if (action === "add-media") {
        // Logic to handle media upload
        return;
      }

      if (activeActions.includes(action)) {
        setActiveActions(activeActions.filter((a) => a !== action));
      } else {
        setActiveActions([...activeActions, action]);
      }
    };

    const handleLocationChange = (
      location: string,
      lat?: number,
      lng?: number
    ) => {
      form.setValue("location", location);
      if (lat) form.setValue("locationLat", lat);
      if (lng) form.setValue("locationLng", lng);
    };

    const handleFeelingActivityChange = (
      type: "feeling" | "activity",
      value: string
    ) => {
      form.setValue(type, value);
    };

    const handlePrivacyChange = (value: "public" | "friends" | "onlyme") => {
      form.setValue("privacy", value);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="pt-16 max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {props.selectedStory ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs
              defaultValue="standard"
              onValueChange={(v) => form.setValue("postFormat", v as any)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="poll">Poll</TabsTrigger>
              </TabsList>

              <TabsContent value="standard" className="pt-4">
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
                    placeholder="Enter your title"
                    id="name"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5 mb-4">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Description
                  </Label>
                  <RichTextEditor
                    content={form.watch("description") || ""}
                    onChange={(content) =>
                      form.setValue("description", content)
                    }
                    placeholder="What's on your mind?"
                    onSpecialAction={handleToolbarAction}
                  />

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
                </div>

                <div className="grid w-full items-center gap-1.5 mb-4">
                  <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Media
                  </Label>
                  <UploadV2 fileList={fileList} setFileList={setFileList} />
                </div>
              </TabsContent>

              <TabsContent value="background" className="pt-4">
                <div className="grid w-full items-center gap-1.5 mb-4">
                  <Label
                    htmlFor="description-bg"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Text
                  </Label>
                  <RichTextEditor
                    content={form.watch("description") || ""}
                    onChange={(content) =>
                      form.setValue("description", content)
                    }
                    placeholder="Share your thoughts"
                    className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  />
                </div>
                {/* Background style picker would go here */}
              </TabsContent>

              <TabsContent value="poll" className="pt-4">
                {/* Poll creation UI would go here */}
                <div className="p-8 text-center text-muted-foreground">
                  Poll feature coming soon
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between mt-6 mb-4">
              <Label className="text-sm font-medium">
                Who can see your post?
              </Label>
              <PrivacySelector
                value={form.watch("privacy") || "public"}
                onChange={handlePrivacyChange}
              />
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

CreateStoryModal.displayName = "CreateStoryModal";

export default CreateStoryModal;
