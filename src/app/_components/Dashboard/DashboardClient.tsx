"use client";


import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import type { StoryType } from "@/types";

import { useEffect, useRef, useState } from "react";
import { StoryCard } from "@/app/_components/Story/Card";
import CreateStoryModal from "@/app/_components/modals/CreateStoryModal";
import type { CreateStoryModalRef } from "@/app/_components/modals/CreateStoryModal";
import EmptyTimelineState from "@/app/_components/Story/EmptyTimelineState";

export default function DashboardClient() {
	const modalRef = useRef<CreateStoryModalRef>(null);
	const [selectedStory, setSelectedStory] = useState<StoryType | null>(null);
	const [createIndex, setCreateIndex] = useState<number | null>(null);
	const [maxIndex, setMaxIndex] = useState<number | null>(null);

    // Changed to useQuery to handle loading state manually and avoid suspension
	const { data: stories, isLoading, refetch } = api.story.getMyStories.useQuery({
		orderBy: "desc",
		page: 1,
		totalItems: 50,
		sort: "createdAt",
	});

	const [storyList, setStoryList] = useState<StoryType[]>([]);

	useEffect(() => {
		if (stories?.storyList) {
			setStoryList(stories.storyList);
		}
	}, [stories]);

	useEffect(() => {
		if (storyList.length > 0) {
			const maxSort = Math.max(...storyList.map(story => story.sort ?? 0));
			setMaxIndex(maxSort);
		}
	}, [storyList]);

    // Refresh list when modal closes or action completes
    useEffect(() => {
        if (!selectedStory && createIndex === null) {
            void refetch();
        }
    }, [selectedStory, createIndex, refetch]);


	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-2xl space-y-4">
				{[1, 2, 3].map(id => (
					<Card key={id} className="w-full">
						<CardHeader className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								</div>
								<Skeleton className="h-8 w-8 rounded-md" />
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
							<Skeleton className="h-48 w-full rounded-lg" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<h1 className="text-2xl font-bold mb-6">My Stories</h1>

			{storyList.length === 0 ? (
				<EmptyTimelineState openCreateModal={() => modalRef.current?.openModal()} />
			) : (
				<div className="space-y-6">
					{storyList.map((item, index) => {
                         const nextItem = storyList[index + 1];
                         const nextSort = (nextItem?.sort ?? item.sort ?? 0) + 1;
                         const sort = ((item.sort ?? 0) + nextSort) / 2;

						return (
							<div key={item.id}>
                                {item.status !== 'approved' && (
                                    <div className="mb-2 px-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </span>
                                    </div>
                                )}
								<StoryCard
									item={item}
									setSelectedStory={(story) => {
                                        setSelectedStory(story);
                                    }}
									sort={sort}
									setCreateIndex={setCreateIndex}
									openModal={() => modalRef.current?.openModal()}
								/>
							</div>
						);
					})}
				</div>
			)}

			<CreateStoryModal
				ref={modalRef}
				selectedStory={selectedStory}
				createIndex={createIndex}
				maxIndex={maxIndex}
				setCreateIndex={setCreateIndex}
			/>
		</div>
	);
}
