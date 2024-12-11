// import { Button } from "@nextui-org/react";
// import { Image, Space } from "antd";
// import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
// import Autoplay from "embla-carousel-autoplay";
// import useEmblaCarousel from "embla-carousel-react";
// import React from "react";
// import { useCallback } from "react";
// import styles from "./StoryCarousel.module.css";
// import {
// 	NextButton,
// 	PrevButton,
// 	usePrevNextButtons,
// } from "./StoryCarouselArrowButton";
// import { Download, FlipHorizontal2, FlipVertical2, RotateCcwSquare, RotateCwSquare, ZoomIn, ZoomOut } from "lucide-react";

// type PropType = {
// 	slides: string[];
// 	options?: EmblaOptionsType;
// };

// const StoryCarousel: React.FC<PropType> = (props) => {
// 	const { slides, options } = props;

// 	const [current, setCurrent] = React.useState(0);

// 	const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);

// 	const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
// 		const autoplay = emblaApi?.plugins()?.autoplay;
// 		if (!autoplay) return;

// 		const resetOrStop =
// 			autoplay.options.stopOnInteraction === false
// 				? autoplay.reset
// 				: autoplay.stop;

// 		resetOrStop();
// 	}, []);

// 	const onDownload = () => {
// 		const url = slides[current] ?? "";
// 		const suffix = url?.slice(url.lastIndexOf("."));
// 		const filename = Date.now() + (suffix ?? "");

// 		fetch(url)
// 			.then((response) => response.blob())
// 			.then((blob) => {
// 				const blobUrl = URL.createObjectURL(new Blob([blob]));
// 				const link = document.createElement("a");
// 				link.href = blobUrl;
// 				link.download = filename;
// 				document.body.appendChild(link);
// 				link.click();
// 				URL.revokeObjectURL(blobUrl);
// 				link.remove();
// 			});
// 	};

// 	// const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
// 	// 	emblaApi,
// 	// 	onNavButtonClick,
// 	// );

// 	const {
// 		prevBtnDisabled,
// 		nextBtnDisabled,
// 		onPrevButtonClick,
// 		onNextButtonClick,
// 	} = usePrevNextButtons(emblaApi, onNavButtonClick);

// 	return (
// 		<section className={styles.embla}>
// 			<div className={styles.embla__viewport} ref={emblaRef}>
// 				<div className={styles.embla__container}>
// 					<Image.PreviewGroup
// 						preview={{
// 							toolbarRender: (
// 								_,
// 								{
// 									transform: { scale },
// 									actions: {
// 										onFlipY,
// 										onFlipX,
// 										onRotateLeft,
// 										onRotateRight,
// 										onZoomOut,
// 										onZoomIn,
// 									},
// 								},
// 							) => (
// 								<Space size={12} className="toolbar-wrapper">
// 									<Button variant="light" isIconOnly onClick={onDownload}>
// 										<Download color="default" />
// 									</Button>
// 									<Button variant="light" isIconOnly onClick={onFlipY}>
// 										<FlipHorizontal2 color="default" />
// 									</Button>
// 									<Button variant="light" isIconOnly onClick={onFlipX}>
// 										<FlipVertical2 color="default" />
// 									</Button>
// 									<Button variant="light" isIconOnly onClick={onRotateLeft}>
// 										<RotateCcwSquare color="default" />
// 									</Button>
// 									<Button variant="light" isIconOnly onClick={onRotateRight}>
// 										<RotateCwSquare color="default" />
// 									</Button>
// 									<Button
// 										variant="light"
// 										isIconOnly
// 										disabled={scale === 1}
// 										onClick={onZoomOut}
// 									>
// 										<ZoomOut color="default" />
// 									</Button>
// 									<Button
// 										variant="light"
// 										isIconOnly
// 										disabled={scale === 50}
// 										onClick={onZoomIn}
// 									>
// 										<ZoomIn color="default" />
// 									</Button>
// 								</Space>
// 							),
// 							onChange: (index) => {
// 								setCurrent(index);
// 							},
// 						}}
// 					>
// 						{slides.map((src, index) => (
// 							<div className={styles.embla__slide} key={index + src}>
// 								<Image
// 									className="object-contain"
// 									height={500}
// 									src={src}
// 									alt=""
// 								/>
// 							</div>
// 						))}
// 					</Image.PreviewGroup>
// 				</div>
// 			</div>

// 			<div className={styles.embla__controls}>
// 				<div className={styles.embla__buttons}>
// 					<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
// 					<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
// 				</div>

// 				{/* <div className={styles.embla__dots}>
// 					{scrollSnaps.map((_, index) => (
// 						<DotButton
// 							key={scrollSnaps.toString()}
// 							onClick={() => onDotButtonClick(index)}
// 							className={`${styles.embla__dot} ${index === selectedIndex ? styles["embla__dot--selected"] : ""}`}
// 						/>
// 					))}
// 				</div> */}
// 			</div>
// 		</section>
// 	);
// };

// export default StoryCarousel;
