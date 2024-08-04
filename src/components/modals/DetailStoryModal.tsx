"use client";

import { Modal, ModalBody, ModalContent } from "@nextui-org/modal";
import { EmblaOptionsType } from "embla-carousel";
import StoryCarousel from "../common/ImagesCarousel/StoryCarousel";

export default function DetailStoryModal({
  isOpen,
  onOpenChange,
  images,
}: any) {
  const OPTIONS: EmblaOptionsType = { loop: true };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
      isDismissable={false}
      isKeyboardDismissDisabled
      scrollBehavior="inside"
      size="full"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <StoryCarousel slides={images} options={OPTIONS} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
