import { useCallback, useState } from "react";

function useDisclosure(
	defaultOpen = false,
	onOpenCallback?: () => void,
	onCloseCallback?: () => void
) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const onOpen = useCallback(() => {
		setIsOpen(true);
		if (onOpenCallback) onOpenCallback();
	}, [onOpenCallback]);

	const onClose = useCallback(() => {
		setIsOpen(false);
		if (onCloseCallback) onCloseCallback();
	}, [onCloseCallback]);

	const toggle = useCallback(() => setIsOpen(prev => !prev), []);

	return {
		isOpen,
		onOpen,
		onClose,
		toggle,
	};
}

export default useDisclosure;
