import type { CreateStoryModalProps } from "@/app/_components/modals/CreateStoryModal";
import useDisclosure from "@/hooks/useDisclosure";
import { api } from "@/trpc/react";
import { handleUploadImage } from "@/utils/uploadHelper";
import { StoryFormValidation } from "@/validations/StoryValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRPCClientErrorLike } from "@trpc/client";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type StoryFormData = z.infer<typeof StoryFormValidation>;

const useStoryModal = ({
  selectedStory,
  createIndex,
  maxIndex,
  setCreateIndex,
}: CreateStoryModalProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure(false);
  const [fileList, setFileList] = useState<(File | string)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const utils = api.useUtils();

  const form = useForm<StoryFormData>({
    resolver: zodResolver(StoryFormValidation),
    defaultValues: {
      name: selectedStory?.name ?? "",
      description: selectedStory?.description ?? "",
      location: selectedStory?.location ?? "",
      locationLat: selectedStory?.locationLat,
      locationLng: selectedStory?.locationLng,
      feeling: selectedStory?.feeling ?? "",
      activity: selectedStory?.activity ?? "",
      privacy: selectedStory?.privacy ?? "public",
      backgroundStyle: selectedStory?.backgroundStyle ?? "",
      mentionedUsers: selectedStory?.mentionedUsers ?? [],
      postFormat: selectedStory?.postFormat ?? "standard",
      pollQuestion: "",
      pollOptions: ["", ""],
      scheduledPublishTime: selectedStory?.scheduledPublishTime,
    },
  });

  const resetModal = useCallback(() => {
    setFileList([]);
    setIsUploading(false);
    form.reset({
      name: "",
      description: "",
      location: "",
      locationLat: undefined,
      locationLng: undefined,
      feeling: "",
      activity: "",
      privacy: "public",
      backgroundStyle: "",
      mentionedUsers: [],
      postFormat: "standard",
      pollQuestion: "",
      pollOptions: ["", ""],
      scheduledPublishTime: undefined,
    });
    setCreateIndex(null);
    onClose();
  }, [onClose, setCreateIndex, form]);

  const handleMutationSuccess = useCallback(
    async (action: string) => {
      setIsUploading(false);
      toast.success(`${action} successfully`);
      await utils.story.invalidate();
      resetModal();
    },
    [utils.story, resetModal]
  );

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleMutationError = useCallback((error: TRPCClientErrorLike<any>) => {
    setIsUploading(false);
    toast.error(error.message || "An error occurred");
  }, []);

  const createStory = api.story.create.useMutation({
    onSuccess: () => handleMutationSuccess("Create"),
    onError: handleMutationError,
  });

  const updateStory = api.story.update.useMutation({
    onSuccess: () => handleMutationSuccess("Update"),
    onError: handleMutationError,
  });

  useEffect(() => {
    if (selectedStory) {
      form.reset({
        name: selectedStory.name,
        description: selectedStory.description || "",
        location: selectedStory.location || "",
        locationLat: selectedStory.locationLat,
        locationLng: selectedStory.locationLng,
        feeling: selectedStory.feeling || "",
        activity: selectedStory.activity || "",
        privacy: selectedStory.privacy || "public",
        backgroundStyle: selectedStory.backgroundStyle || "",
        mentionedUsers: selectedStory.mentionedUsers || [],
        postFormat: selectedStory.postFormat || "standard",
        pollQuestion: "",
        pollOptions: ["", ""],
        scheduledPublishTime: selectedStory.scheduledPublishTime,
      });
      setFileList(selectedStory.images);
      onOpen();
    } else {
      resetModal();
    }
  }, [selectedStory, resetModal, form, onOpen]);

  const uploadNewImages = async (
    newImages: File[],
    existedImages: string[]
  ) => {
    try {
      if (!newImages.length) return existedImages;

      const uploadedImages = await handleUploadImage(newImages);
      const urls = uploadedImages
        ?.map((image) => image?.url)
        .filter(Boolean) as string[];
      return [...existedImages, ...urls];
    } catch (error) {
      if (error instanceof Error) {
        handleMutationError({
          message: error.message,
          data: { code: "INTERNAL_SERVER_ERROR" },
          shape: { message: error.message, code: -32603 },
        });
      } else {
        handleMutationError({
          message: "Upload failed",
          data: { code: "INTERNAL_SERVER_ERROR" },
          shape: { message: "Upload failed", code: -32603 },
        });
      }
      throw error;
    }
  };

  const createStoryData = useCallback(
    (allImages: string[]) => {
      const {
        pollOptions = [],
        pollQuestion,
        description,
        postFormat,
        scheduledPublishTime,
        ...restValues
      } = form.getValues();

      const cleanedOptions = pollOptions
        ?.map(option => option.trim())
        .filter(Boolean);

      const pollPrompt = pollQuestion || description || "";

      const descriptionWithPoll =
        postFormat === "poll" && cleanedOptions.length
          ? `<p>${pollPrompt}</p><ul>${cleanedOptions
              .map(option => `<li>${option}</li>`)
              .join("")}</ul>`
          : description;

      return {
        ...restValues,
        description: descriptionWithPoll,
        postFormat,
        scheduledPublishTime: scheduledPublishTime || undefined,
        coverImage: selectedStory?.coverImage || allImages[0] || "",
        images: allImages,
        sort:
          createIndex !== null && createIndex !== undefined
            ? createIndex
            : maxIndex !== null && maxIndex !== undefined
              ? (maxIndex || 0) + 100
              : 0,
        ...(createIndex !== null && { index: createIndex }),
      };
    },
    [form, selectedStory, createIndex, maxIndex]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleSubmit = useCallback(async () => {
    const { postFormat, pollOptions = [] } = form.getValues();
    if (postFormat === "poll") {
      const validOptions = pollOptions.filter(option => option.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error("Please provide at least 2 poll options");
        return;
      }
    }

    if (fileList.length === 0) {
      toast.error("You need to select at least one image");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading...");

    const existedImages = fileList.filter(
      (file): file is string => typeof file === "string"
    );
    const newImages = fileList.filter(
      (file): file is File => file instanceof File
    );

    try {
      const allImages = await uploadNewImages(newImages, existedImages);
      const storyData = createStoryData(allImages);

      if (selectedStory?.id) {
        await updateStory.mutateAsync({ id: selectedStory.id, ...storyData });
      } else {
        await createStory.mutateAsync(storyData);
      }
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
      setIsUploading(false);
      // Error already handled in uploadNewImages
      console.error("Submission failed:", error);
    }
  }, [fileList, createStoryData, selectedStory, createStory, updateStory]);

  return {
    isOpen,
    onClose,
    onOpen,
    fileList,
    setFileList,
    isUploading,
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    resetModal,
    selectedStory,
  };
};

export default useStoryModal;
