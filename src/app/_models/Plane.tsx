/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Author: AntijnvanderGun (https://sketchfab.com/AntijnvanderGun)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/stylized-ww1-plane-c4edeb0e410f46e8a4db320879f0a1db
Title: Stylized WW1 Plane
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import React, { useEffect, useRef } from "react";
import type { Mesh } from "three";

type PlaneModelProps = {
	isRotating: boolean;
	[key: string]: any;
};

export function PlaneModel({ isRotating, ...props }: PlaneModelProps) {
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const ref = useRef<Mesh>(null!);
	const { scene, animations } = useGLTF("/assets/3d/plane.glb");
	const { actions } = useAnimations(animations, ref);

	useEffect(() => {
		if (actions?.["Take 001"]) {
			// Check if actions and the specific action exist
			if (isRotating) {
				if (!actions["Take 001"].isRunning()) {
					actions["Take 001"].reset().play();
				}
			} else {
				actions["Take 001"].play();
			}
		}
	}, [actions, isRotating]);

	return (
		<mesh {...props} ref={ref}>
			<primitive object={scene} />
		</mesh>
	);
}
