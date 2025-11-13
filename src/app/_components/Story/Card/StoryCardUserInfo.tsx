import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICON_SIZE_LARGE } from "@/utils/constants";
import { memo } from "react";
import { Icon } from "../../common/Icon";

export interface FormattedDateInfo {
	month: string;
	day: number;
	year: number;
}

interface StoryCardUserInfoProps {
	userName: string;
	userAvatar: string;
	dateInfo: FormattedDateInfo;
}

const StoryCardUserInfo = memo<StoryCardUserInfoProps>(
	({ userName, userAvatar, dateInfo }) => (
		<div className="flex gap-3 items-center">
			<Avatar>
				<AvatarImage src={userAvatar} alt={userName} />
				<AvatarFallback>
					<Icon className={ICON_SIZE_LARGE} name="user-outline" />
				</AvatarFallback>
			</Avatar>
			<div>
				<p className="text-sm font-medium">{userName}</p>
				<div className="flex gap-1">
					<span className="font-medium text-[#9f9f9f] text-sm">
						{dateInfo.month}
					</span>
					<span className="font-medium text-[#9f9f9f] text-sm">
						{dateInfo.day}
					</span>
					<span className="font-medium text-[#9f9f9f] text-sm">
						{dateInfo.year}
					</span>
				</div>
			</div>
		</div>
	)
);

StoryCardUserInfo.displayName = "StoryCardUserInfo";

export default StoryCardUserInfo;
