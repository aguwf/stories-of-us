import type React from 'react';
import { memo, useEffect, useState, useRef } from 'react';
import { Button } from "@nextui-org/react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings01Icon } from 'hugeicons-react';
import clsx from 'clsx';

interface FloatButtonProps {
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onClick?: () => void;
    options?: React.ComponentProps<typeof Button>;
    index?: number;
}

const FloatButton: React.FC<FloatButtonProps> = memo(({ style, children, onClick, options, index = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            zIndex: 100,
            borderRadius: '100%',
            ...style,
        }}
    >
        <AnimatePresence>
            <Button className="h-10 w-10 min-w-full rounded-full p-0" onClick={onClick} {...options}>
                {children}
            </Button>
        </AnimatePresence>
    </motion.div>
));

let floatButtonGroupCounter = 0;
let openGroupId: number | null = null;

interface FloatButtonGroupProps {
    buttons: FloatButtonProps[];
    closeIcon?: React.ReactNode;
    openIcon?: React.ReactNode;
}

const FloatButtonGroup: React.FC<FloatButtonGroupProps> = memo(({ buttons, closeIcon, openIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [offset, setOffset] = useState(0);
    const groupRef = useRef<HTMLDivElement>(null);
    const groupId = useRef(floatButtonGroupCounter);

    useEffect(() => {
        groupId.current = ++floatButtonGroupCounter;
        setOffset((floatButtonGroupCounter - 1) * 50);
        return () => { floatButtonGroupCounter--; };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (groupRef.current && !groupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        if (!isOpen && openGroupId !== null && openGroupId !== groupId.current) {
            window.dispatchEvent(new CustomEvent('closeFloatButtonGroup', { detail: { groupId: openGroupId } }));
        }
        openGroupId = isOpen ? null : groupId.current;
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleCloseGroup = (event: CustomEvent) => {
            if (event.detail.groupId === groupId.current) {
                setIsOpen(false);
            }
        };

        window.addEventListener('closeFloatButtonGroup', handleCloseGroup as EventListener);
        return () => window.removeEventListener('closeFloatButtonGroup', handleCloseGroup as EventListener);
    }, []);

    return (
        <motion.div
            ref={groupRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
                position: 'fixed',
                bottom: `${40 + offset}px`,
                right: '20px',
                zIndex: isOpen ? 101 : 100,
            }}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}
                    >
                        {buttons.map((buttonProps, index) => (
                            <FloatButton
                                key={`float-button-${buttonProps.onClick?.toString() || index}`}
                                index={index + 1}
                                style={{
                                    position: 'static',
                                    width: '100%',
                                    height: '100%',
                                }}
                                {...buttonProps}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <Button
                onClick={toggleOpen}
                className={clsx("h-10 w-10 min-w-full rounded-full p-0", isOpen && 'mt-2')}
            >
                {isOpen ? (closeIcon || <Settings01Icon size={16} />) : (openIcon || <Settings01Icon size={16} />)}
            </Button>
        </motion.div>
    );
});

FloatButtonGroup.displayName = 'FloatButtonGroup';
FloatButton.displayName = 'FloatButton';

export { FloatButton, FloatButtonGroup };
