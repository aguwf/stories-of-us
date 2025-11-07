import useDisclosure from "@/hooks/useDisclosure";
import { api } from "@/trpc/react";
import { handleUploadImage } from "@/utils/uploadHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRPCClientErrorLike } from "@trpc/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { CreateStoryModalProps } from "@/app/_components/modals/CreateStoryModal";
import { useUserStore } from "@/app/_store/userStore";

const storySchema = z.object({
  name: z.string().min(1, "Title is required"),
  description: z.string(),
});

type StoryFormData = z.infer<typeof storySchema>;

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
  const { user } = useUserStore();

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      name: selectedStory?.name ?? "",
      description: selectedStory?.description ?? "",
    },
  });

  const resetModal = useCallback(() => {
    setFileList([]);
    setIsUploading(false);
    form.reset();
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
      });
      setFileList(selectedStory.images);
      onOpen();
    } else {
      resetModal();
    }
  }, [selectedStory, resetModal, form]);

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
    (allImages: string[]) => ({
      ...form.getValues(),
      coverImage: selectedStory?.coverImage || allImages[0] || "",
      images: allImages,
      sort: createIndex ?? maxIndex ? (maxIndex || 0) + 100 : 0,
      userId: user?.id || "default-id",
      ...(createIndex !== null && { index: createIndex }),
    }),
    [form, selectedStory, createIndex, maxIndex, user]
  );

  const handleSubmit = useCallback(async () => {
    if (fileList.length === 0) {
      toast.error("You need to select at least one image");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading...");

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
    } catch (error) {
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
