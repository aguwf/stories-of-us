"use client";

import { Modal, ModalBody, ModalContent } from "@nextui-org/modal";
import { Typography } from "antd";
import type { EmblaOptionsType } from "embla-carousel";
import StoryCarousel from "../common/ImagesCarousel/StoryCarousel";

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
			className="top max-h-screen"
			classNames={{
				closeButton: "top-8 right-6",
			}}
		>
			<ModalContent>
				{(_onClose) => (
					<>
						{/* <ModalHeader></ModalHeader> */}
						<ModalBody>
							{/* Info */}
							<div className="mx-auto w-full max-w-screen-md ">
								<Title level={3} className="mt-16">
									{story?.name}
								</Title>
								<p className="mt-2">{story?.description}</p>
							</div>
							{/* Carousel */}
							<StoryCarousel slides={story?.images} options={OPTIONS} />
						</ModalBody>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
