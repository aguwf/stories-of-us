import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Settings } from "lucide-react";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Animation variants for reusability
const floatButtonVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 }
};

interface FloatButtonProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: () => void;
  options?: Omit<React.ComponentProps<typeof Button>, keyof FloatButtonProps>;
  index?: number;
}

const FloatButton: React.FC<FloatButtonProps> = memo(
  ({ style, children, onClick, options, index = 0 }) => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={floatButtonVariants}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        position: "fixed",
        bottom: "90px",
        right: "20px",
        zIndex: 49,
        borderRadius: "100%",
        ...style,
      }}
    >
      <AnimatePresence>
        <Button
          className="h-10 w-10 min-w-full rounded-full p-0"
          onClick={onClick}
          {...options}
          aria-label={options?.["aria-label"] || "Float button"}
        >
          {children}
        </Button>
      </AnimatePresence>
    </motion.div>
  )
);

FloatButton.displayName = "FloatButton";

let floatButtonGroupCounter = 0;
let openGroupId: number | null = null;

interface FloatButtonGroupProps {
  buttons: FloatButtonProps[];
  closeIcon?: React.ReactNode;
  openIcon?: React.ReactNode;
}

// Type for custom event
interface CloseFloatButtonGroupEvent extends CustomEvent {
  detail: { groupId: number };
}

const FloatButtonGroup: React.FC<FloatButtonGroupProps> = memo(
  ({ buttons, closeIcon, openIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [offset, setOffset] = useState(0);
    const groupRef = useRef<HTMLDivElement>(null);
    const groupId = useRef(floatButtonGroupCounter);

    useEffect(() => {
      groupId.current = ++floatButtonGroupCounter;
      setOffset((floatButtonGroupCounter - 1) * 50);
      return () => {
        floatButtonGroupCounter--;
      };
    }, []);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          groupRef.current &&
          !groupRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => {
      if (!isOpen && openGroupId !== null && openGroupId !== groupId.current) {
        window.dispatchEvent(
          new CustomEvent("closeFloatButtonGroup", {
            detail: { groupId: openGroupId },
          })
        );
      }
      openGroupId = isOpen ? null : groupId.current;
      setIsOpen(!isOpen);
    };

    useEffect(() => {
      const handleCloseGroup = (event: CloseFloatButtonGroupEvent) => {
        if (event.detail.groupId === groupId.current) {
          setIsOpen(false);
        }
      };

      window.addEventListener(
        "closeFloatButtonGroup",
        handleCloseGroup as EventListener
      );
      return () =>
        window.removeEventListener(
          "closeFloatButtonGroup",
          handleCloseGroup as EventListener
        );
    }, []);

    return (
      <motion.div
        ref={groupRef}
        variants={floatButtonVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          position: "fixed",
          bottom: `${40 + offset}px`,
          right: "20px",
          zIndex: isOpen ? 50 : 49,
        }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={floatButtonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {buttons.map((buttonProps, index) => (
                <FloatButton
                  key={`float-button-${index}`}
                  index={index + 1}
                  {...buttonProps}
                  style={{
                    position: "static",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <FloatButton
          onClick={toggleOpen}
          options={{
            variant: "default",
            "aria-label": isOpen ? "Close float button group" : "Open float button group",
          }}
        >
          {isOpen ? closeIcon : openIcon}
        </FloatButton>
      </motion.div>
    );
  }
);

FloatButtonGroup.displayName = "FloatButtonGroup";

export { FloatButton, FloatButtonGroup };
