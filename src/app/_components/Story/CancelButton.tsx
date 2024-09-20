import { Button } from "@nextui-org/react";
import { Popconfirm } from "antd";

interface CancelButtonProps {
    dataName: string;
    onClose: () => void;
    confirm: (e: any) => void;
    cancel: (e: any) => void;
}

const CancelButton = ({ dataName, onClose, confirm, cancel }: CancelButtonProps) => {
    const handleConfirm = () => confirm({ onClose });
    const handleCancel = () => cancel({ onClose });

    return dataName ? (
        <Popconfirm
            title="Discard changes?"
            description="Are you sure to discard this story?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            okText="Yes"
            cancelText="No"
        >
            <Button color="danger" variant="light">
                Cancel
            </Button>
        </Popconfirm>
    ) : (
        <Button color="danger" variant="light" onClick={onClose}>
            Cancel
        </Button>
    );
}

export default CancelButton;
