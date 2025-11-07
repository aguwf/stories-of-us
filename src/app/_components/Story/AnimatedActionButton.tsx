import { Button } from "@/components/ui/button";
import { memo } from "react";
import { motion } from "framer-motion";
import { Icon, IconName } from "../common/icon";
import {
    ANIMATION_DURATION,
    ANIMATION_SCALE_KEYFRAMES,
    ANIMATION_TIMES,
} from "@/utils/constants";

interface AnimatedActionButtonProps {
    isActive: boolean;
    activeIcon: IconName;
    inactiveIcon: IconName;
    activeLabel: string;
    inactiveLabel: string;
    onClick: () => void;
}

const AnimatedActionButton = memo<AnimatedActionButtonProps>(
    ({
        isActive,
        activeIcon,
        inactiveIcon,
        activeLabel,
        inactiveLabel,
        onClick,
    }) => (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 p-0 w-1/3"
            onClick={onClick}
        >
            <motion.div
                animate={{ scale: isActive ? ANIMATION_SCALE_KEYFRAMES : 1 }}
                transition={{ duration: ANIMATION_DURATION, times: ANIMATION_TIMES }}
            >
                <Icon
                    className="!h-5 !w-5"
                    name={isActive ? activeIcon : inactiveIcon}
                />
                {isActive ? activeLabel : inactiveLabel}
            </motion.div>
        </Button>
    ),
);

AnimatedActionButton.displayName = "AnimatedActionButton";

export default AnimatedActionButton;
