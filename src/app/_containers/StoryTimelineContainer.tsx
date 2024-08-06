"use client";

import ListStory from "@/components/common/ListStory";
import Toolbar from "@/components/common/Toolbar";
import CreateStoryModal from "@/components/modals/CreateStoryModal";
import { useDisclosure } from "@nextui-org/react";
import { FloatButton } from "antd";
import { Add01Icon, Add02Icon, Settings01Icon } from "hugeicons-react";
import { useEffect, useState } from "react";

const StoryTimelineContainer = () => {
  const {
    isOpen: isOpenCreateModal,
    onOpen: onOpenCreateModal,
    onOpenChange: onOpenChangeCreateModal,
  } = useDisclosure();

  const [selectedStory, setSelectedStory] = useState<any>(null);

  useEffect(() => {
    if (selectedStory) {
      onOpenCreateModal();
    }
  }, [selectedStory]);

  return (
    <div className="container mx-auto px-4">
      <Toolbar onOpenCreateModal={onOpenCreateModal} />
      <ListStory setSelectedStory={setSelectedStory} />
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        icon={<Settings01Icon size={18} />}
      >
        <FloatButton
          icon={<Add01Icon size={18} />}
          onClick={onOpenCreateModal}
        />
      </FloatButton.Group>
      <CreateStoryModal
        isOpen={isOpenCreateModal}
        onOpenChange={onOpenChangeCreateModal}
        selectedStory={selectedStory}
      />
    </div>
  );
};

export default StoryTimelineContainer;
