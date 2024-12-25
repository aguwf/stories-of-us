import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Animation variants for reusability
const floatButtonVariants: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

interface FloatButtonProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: () => void;
  options?: Omit<React.ComponentProps<typeof Button>, keyof FloatButtonProps>;
  index?: number;
  className?: string;
}

const FloatButton: React.FC<FloatButtonProps> = memo(
  ({ style, children, onClick, options, index = 0, className }) => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={floatButtonVariants}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("fixed right-5 bottom-24 rounded-full z-[49]", className)}
    >
      <AnimatePresence>
        <motion.button
          className={"flex items-center justify-center p-0 w-10 h-10 rounded-full bg-primary hover:bg-primary/90"}
          onClick={onClick}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          // {...options}
          aria-label={options?.["aria-label"] || "Float button"}
        >
          {children}
        </motion.button>
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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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
        className={`flex flex-row gap-2 fixed right-5 z-[${isOpen ? 50 : 49}]`}
        style={{ bottom: 40 + offset + "px" }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={floatButtonVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-row gap-1"
            >
              {buttons.map((buttonProps, index) => (
                <FloatButton
                  key={`float-button-${index}`}
                  index={index + 1}
                  {...buttonProps}
                  className={`static w-full h-full`}
                  style={{ bottom: 40 + offset + "px" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <FloatButton
          onClick={toggleOpen}
          options={{
            variant: "default",
            "aria-label": isOpen
              ? "Close float button group"
              : "Open float button group",
          }}
          className={`static w-full h-full`}
        >
          {isOpen ? closeIcon : openIcon}
        </FloatButton>
      </motion.div>
    );
  }
);

FloatButtonGroup.displayName = "FloatButtonGroup";

export { FloatButton, FloatButtonGroup };
