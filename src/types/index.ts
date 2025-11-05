export * from "./story";
export * from "./user";
export * from "./media";
export * from "./base";

export interface CommentType {
	id: string;
	userId: string;
	userName: string;
	userAvatar: string;
	content: string;
	createdAt: Date;
	reactions: {
		[key: string]: string[]; // emoji: userId[]
	};
	replies?: CommentType[];
}
