/* eslint-disable */

"use client";

import { Modal, ModalBody, ModalContent } from "@nextui-org/modal";
import { type EmblaOptionsType } from "embla-carousel";
import StoryCarousel from "../common/ImagesCarousel/StoryCarousel";
import { Typography } from "antd";

const { Title } = Typography;

export default function DetailStoryModal({ isOpen, onOpenChange, story }: any) {
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
      className="max-h-screen top"
      classNames={{
        closeButton: "top-8 right-6",
      }}
    >
      <ModalContent>
        {(_onClose) => (
          <>
            {/* <ModalHeader></ModalHeader> */}
            <ModalBody>
              <StoryCarousel slides={story?.images} options={OPTIONS} />
              {/* Info */}
              <Title level={3} className="mt-4">
                {story?.name}
              </Title>
              <p className="mt-2">{story?.description}</p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
