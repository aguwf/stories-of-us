"use client";

/**
 * IMPORTANT: Loading glTF models into a Three.js scene is a lot of work.
 * Before we can configure or animate our model's meshes, we need to iterate through
 * each part of our model's meshes and save them separately.
 *
 * But luckily there is an app that turns gltf or glb files into jsx components
 * For this model, visit https://gltf.pmnd.rs/
 * And get the code. And then add the rest of the things.
 * YOU DON'T HAVE TO WRITE EVERYTHING FROM SCRATCH
 */

import { a } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, type JSX } from "react";
import type { Group, Mesh } from "three";

type IslandProps = {
  isRotating: boolean;
  setIsRotating: (isRotating: boolean) => void;
  scrollDelta: number;
  currentFocusPoint?: number[];
} & JSX.IntrinsicElements["group"];

export function Island({
  isRotating,
  setIsRotating,
  scrollDelta,
  ...props
}: IslandProps) {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const islandRef = useRef<Group>(null!);
  // Get access to the Three.js renderer and viewport
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF("/assets/3d/island.glb");

  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;

  // Handle pointer (mouse or touch) down event
  const handlePointerDown = useCallback(
    (event: PointerEvent | TouchEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setIsRotating(true);

      // Calculate the clientX based on whether it's a touch event or a mouse event
      // Store the current clientX position for reference
      // @ts-ignore
      lastX.current = event.touches ? event.touches[0].clientX : event.clientX;
    },
    [setIsRotating]
  );

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = useCallback(
    (event: PointerEvent | TouchEvent) => {
      event.stopPropagation();
      event.preventDefault();
      setIsRotating(false);
    },
    [setIsRotating]
  );

  // Handle pointer (mouse or touch) move event
  const handlePointerMove = useCallback(
    (event: PointerEvent | TouchEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (isRotating) {
        // If rotation is enabled, calculate the change in clientX position
        // @ts-ignore
        const clientX = event.touches
          ? // @ts-ignore
            event.touches[0].clientX
          : // @ts-ignore
            event.clientX;

        // calculate the change in the horizontal position of the mouse cursor or touch input,
        // relative to the viewport's width
        const delta = (clientX - lastX.current) / viewport.width;

        // Update the island's rotation based on the mouse/touch movement
        islandRef.current.rotation.y += delta * 0.01 * Math.PI;

        // Update the reference for the last clientX position
        lastX.current = clientX;

        // Update the rotation speed
        rotationSpeed.current = delta * 0.01 * Math.PI;
      }
    },
    [isRotating, viewport.width]
  );

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        if (!isRotating) setIsRotating(true);

        islandRef.current.rotation.y += 0.005 * Math.PI;
        rotationSpeed.current = 0.007;
      } else if (event.key === "ArrowRight") {
        if (!isRotating) setIsRotating(true);

        islandRef.current.rotation.y -= 0.005 * Math.PI;
        rotationSpeed.current = -0.007;
      }
    },
    [isRotating, setIsRotating]
  );

  // Handle keyup events
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        setIsRotating(false);
      }
    },
    [setIsRotating]
  );

  useEffect(() => {
    // Add event listeners for pointer, keyboard, and mousewheel events
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    gl,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    handleKeyDown,
    handleKeyUp,
  ]);

  // Update the island's rotation based on the mouse wheel movement
  useEffect(() => {
    islandRef.current.rotation.y += scrollDelta * Math.PI;

    // Update the rotation speed
    rotationSpeed.current = scrollDelta * Math.PI;
  }, [scrollDelta]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating, apply damping to slow down the rotation (smoothly)
    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    }
  });

  return (
    // Island 3D model from: https://sketchfab.com/3d-models/foxs-islands-163b68e09fcc47618450150be7785907
    <a.group ref={islandRef} {...props}>
      {nodes.polySurface944_tree_body_0 && (
        <mesh
          geometry={(nodes.polySurface944_tree_body_0 as Mesh).geometry} // Cast to Mesh
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.polySurface945_tree1_0 && (
        <mesh
          geometry={(nodes.polySurface945_tree1_0 as Mesh).geometry} // Cast to Mesh
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.polySurface946_tree2_0 && (
        <mesh
          geometry={(nodes.polySurface946_tree2_0 as Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.polySurface947_tree1_0 && (
        <mesh
          geometry={(nodes.polySurface947_tree1_0 as Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.polySurface948_tree_body_0 && (
        <mesh
          geometry={(nodes.polySurface948_tree_body_0 as Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.polySurface949_tree_body_0 && (
        <mesh
          geometry={(nodes.polySurface949_tree_body_0 as Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      )}
      {nodes.pCube11_rocks1_0 && (
        <mesh
          geometry={(nodes.pCube11_rocks1_0 as Mesh).geometry}
          material={materials.PaletteMaterial001}
        />
      )}
    </a.group>
  );
}
