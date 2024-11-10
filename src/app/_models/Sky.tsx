import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

const Sky = ({ isRotating }: { isRotating: boolean }) => {
	const { scene } = useGLTF("/assets/3d/sky.glb");
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const skyRef = useRef<Mesh>(null!);

	// Use a ref for rotation speed
	const rotationSpeed = useRef(0);
	// Define a damping factor to control rotation damping
	const dampingFactor = 0.95;

	// Note: Animation names can be found on the Sketchfab website where the 3D model is hosted.
	// It ensures smooth animations by making the rotation frame rate-independent.
	// 'delta' represents the time in seconds since the last frame.
	useFrame((_, delta) => {
		if (isRotating) {
			rotationSpeed.current = 0.25 * delta;
			skyRef.current.rotation.y += 0.25 * delta; // Adjust the rotation speed as needed
		} else {
			// Apply damping factor to slow down rotation when not scrolling
			rotationSpeed.current *= dampingFactor;

			// Stop rotation when speed is very small
			if (Math.abs(rotationSpeed.current) < 0.00001) {
				rotationSpeed.current = 0;
			}

			if (skyRef.current) {
				skyRef.current.rotation.y += rotationSpeed.current;
			}
		}
	});

	return (
		<mesh ref={skyRef}>
			<primitive object={scene} />
		</mesh>
	);
};

export default Sky;
