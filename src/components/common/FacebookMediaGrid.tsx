import type React from "react";
// import Modal from "./Modal";

interface ImagesProps {
	images: string[];
	hideOverlay?: boolean;
	renderOverlay?: () => string;
	overlayBackgroundColor?: string;
	onClickEach?: (data: { src: string; index: number }) => void;
	countFrom?: number;
}

const FacebookMediaGrid: React.FC<ImagesProps> = ({
	images,
	hideOverlay = true,
	overlayBackgroundColor = "#222222",
	countFrom = 5,
}) => {
	// const [modal, setModal] = useState(false);
	// const [index, setIndex] = useState(0);
	// const [url, setUrl] = useState("");

	if (countFrom <= 0 || countFrom > 5) {
		console.warn("countFrom is limited to 5!");
	}

	// const onClose = () => {
	//   setModal(false);
	// };

	const renderOne = () => {
		const overlay =
			images.length > countFrom && countFrom === 1
				? renderCountOverlay(true)
				: renderOverlay();

		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
				<div
					className="height-one background col-span-12 border md:col-span-12"
					style={{ background: `url(${images[0]})` }}
				>
					{overlay}
				</div>
			</div>
		);
	};

	const renderTwo = () => {
		const overlay =
			images.length > countFrom && [2, 3].includes(countFrom)
				? renderCountOverlay(true)
				: renderOverlay();
		const conditionalRender =
			[3, 4].includes(images.length) ||
			(images.length > countFrom && [3, 4].includes(countFrom));

		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
				<div
					className="height-two background col-span-6 border md:col-span-6"
					style={{
						background: `url(${conditionalRender ? images[1] : images[0]})`,
					}}
				>
					{renderOverlay()}
				</div>
				<div
					className="height-two background col-span-6 border md:col-span-6"
					style={{
						background: `url(${conditionalRender ? images[2] : images[1]})`,
					}}
				>
					{overlay}
				</div>
			</div>
		);
	};

	const renderThree = () => {
		const conditionalRender =
			images.length === 4 || (images.length > countFrom && countFrom === 4);
		const overlay =
			!countFrom ||
			countFrom > 5 ||
			(images.length > countFrom && [4, 5].includes(countFrom))
				? renderCountOverlay(true)
				: renderOverlay(conditionalRender ? 3 : 4);

		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
				<div
					className="height-three background col-span-6 border md:col-span-4"
					style={{
						background: `url(${conditionalRender ? images[1] : images[2]})`,
					}}
				>
					{renderOverlay(conditionalRender ? 1 : 2)}
				</div>
				<div
					className="height-three background col-span-6 border md:col-span-4"
					style={{
						background: `url(${conditionalRender ? images[2] : images[3]})`,
					}}
				>
					{renderOverlay(conditionalRender ? 2 : 3)}
				</div>
				<div
					className="height-three background col-span-6 border md:col-span-4"
					style={{
						background: `url(${conditionalRender ? images[3] : images[4]})`,
					}}
				>
					{overlay}
				</div>
			</div>
		);
	};

	const renderOverlay = (id?: number) => {
		if (hideOverlay) {
			return false;
		}

		return [
			<div
				key={`cover-${id}`}
				className="cover slide"
				style={{ backgroundColor: overlayBackgroundColor }}
			/>,
			<div
				key={`cover-text-${id}`}
				className="cover-text slide animate-text"
				style={{ fontSize: "100%" }}
			>
				{renderOverlay()}
			</div>,
		];
	};

	const renderCountOverlay = (more: boolean) => {
		const extra = images.length - (countFrom && countFrom > 5 ? 5 : countFrom);

		return [
			more && <div key="count" className="cover" />,
			more && (
				<div
					key="count-sub"
					className="cover-text"
					style={{ fontSize: "200%" }}
				>
					<p>+{extra}</p>
				</div>
			),
		];
	};

	const imagesToShow = [...images];

	if (countFrom && images.length > countFrom) {
		imagesToShow.length = countFrom;
	}

	return (
		<div className="grid-container">
			{[1, 3, 4].includes(imagesToShow.length) && renderOne()}
			{imagesToShow.length >= 2 && imagesToShow.length !== 4 && renderTwo()}
			{imagesToShow.length >= 4 && renderThree()}
		</div>
	);
};

export default FacebookMediaGrid;
