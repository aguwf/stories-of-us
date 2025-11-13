import { memo } from "react";

interface StoryCardStatsProps {
	heartCount: number;
	viewCount: number;
	shareCount: number;
}

const StoryCardStats = memo<StoryCardStatsProps>(
	({ heartCount, viewCount, shareCount }) => (
		<div className="flex justify-between items-center mt-6">
			<div className="flex gap-2 items-center">
				<span className="text-xs text-gray-400">
					{heartCount} {heartCount === 1 ? "heart" : "hearts"}
				</span>
			</div>
			<div className="flex gap-2">
				<div className="flex gap-2 items-center">
					<span className="text-xs text-gray-400">{viewCount} seen</span>
				</div>
				<div className="flex gap-2 items-center">
					<span className="text-xs text-gray-400">{shareCount} shared</span>
				</div>
			</div>
		</div>
	)
);

StoryCardStats.displayName = "StoryCardStats";

export default StoryCardStats;
