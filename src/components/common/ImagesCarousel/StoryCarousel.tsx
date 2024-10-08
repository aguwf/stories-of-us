import { Image } from "antd";
import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import type React from "react";
import { useCallback } from "react";
import styles from "./StoryCarousel.module.css";
import {
	NextButton,
	PrevButton,
	usePrevNextButtons,
} from "./StoryCarouselArrowButton";

type PropType = {
	slides: string[];
	options?: EmblaOptionsType;
};

const StoryCarousel: React.FC<PropType> = (props) => {
	const { slides, options } = props;
	const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()]);

	const onNavButtonClick = useCallback((emblaApi: EmblaCarouselType) => {
		const autoplay = emblaApi?.plugins()?.autoplay;
		if (!autoplay) return;

		const resetOrStop =
			autoplay.options.stopOnInteraction === false
				? autoplay.reset
				: autoplay.stop;

		resetOrStop();
	}, []);

	// const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(
	// 	emblaApi,
	// 	onNavButtonClick,
	// );

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi, onNavButtonClick);

	return (
		<section className={styles.embla}>
			<div className={styles.embla__viewport} ref={emblaRef}>
				<div className={styles.embla__container}>
					<Image.PreviewGroup>
						{slides.map((src, index) => (
							<div className={styles.embla__slide} key={index + src}>
								<Image
									className="object-contain"
									height={500}
									src={src}
									alt=""
								/>
							</div>
						))}
					</Image.PreviewGroup>
				</div>
			</div>

			<div className={styles.embla__controls}>
				<div className={styles.embla__buttons}>
					<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
					<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
				</div>

				{/* <div className={styles.embla__dots}>
					{scrollSnaps.map((_, index) => (
						<DotButton
							key={scrollSnaps.toString()}
							onClick={() => onDotButtonClick(index)}
							className={`${styles.embla__dot} ${index === selectedIndex ? styles["embla__dot--selected"] : ""}`}
						/>
					))}
				</div> */}
			</div>
		</section>
	);
};

export default StoryCarousel;
