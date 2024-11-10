"use client";

import { Island } from "@/app/_models/Island";
import { PlaneModel } from "@/app/_models/Plane";
import Sky from "@/app/_models/Sky";
import { Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";

const IslandScene = () => {
	const [isRotating, setIsRotating] = useState(false);
	// @ts-ignore
	const [currentStage, setCurrentStage] = useState<number | null>(1);
	const scrollDelta = useRef(0);

	const adjustIslandForScreenSize = () => {
		let screenScale: [number, number, number];
		let screenPosition: [number, number, number];

		if (window.innerWidth < 768) {
			screenScale = [0.9, 0.9, 0.9];
			screenPosition = [0, -6.5, -43.4];
		} else {
			screenScale = [1, 1, 1];
			screenPosition = [0, -6.5, -63.4];
		}

		return [screenScale, screenPosition];
	};

	const [islandScale, islandPosition] = adjustIslandForScreenSize();

	const handleMouseWheel = (event: any) => {
		event.stopPropagation();
		event.preventDefault();
		setIsRotating(true);

		scrollDelta.current = event.deltaY < 0 ? 0.01 : -0.01;

		setTimeout(() => {
			setIsRotating(false);
		}, 250);
	};

	return (
		<Canvas
			className={`h-screen w-full bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`}
			camera={{ near: 0.1, far: 1000 }}
			onWheel={handleMouseWheel}
		>
			<directionalLight position={[1, 1, 1]} intensity={2} />
			<ambientLight intensity={0.5} />
			<pointLight position={[10, 5, 10]} intensity={2} />
			<spotLight
				position={[0, 50, 10]}
				angle={0.15}
				penumbra={1}
				intensity={2}
			/>
			<hemisphereLight color="#b1e1ff" groundColor="#000000" intensity={1} />

			<Suspense
				fallback={
					<Html>
						<div className="flex items-center justify-center">
							<div className="h-20 w-20 animate-spin rounded-full border-2 border-blue-500 border-t-blue-500 border-opacity-20" />
						</div>
					</Html>
				}
			>
				<Sky isRotating={isRotating} />
				<Island
					isRotating={isRotating}
					setIsRotating={setIsRotating}
					position={islandPosition}
					setCurrentStage={setCurrentStage}
					rotation={[0.1, 4.7077, 0]}
					scale={islandScale}
					scrollDelta={scrollDelta.current}
				/>
				<PlaneModel isRotating={isRotating} />
			</Suspense>
		</Canvas>
	);
};

export default IslandScene;
