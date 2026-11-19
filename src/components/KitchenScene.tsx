"use client";

import React, { useEffect, useRef, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { ProductType, ProductOption } from "@/types/product";
import { createPortal } from "react-dom";
import { HiArrowsExpand, HiX } from "react-icons/hi";

// Props interface
interface KitchenSceneProps {
    product: ProductType;
    configuration: Record<string, string>; // { "Boja Fronti": "Mat Bijela", ... }
    onMeshClick?: (meshName: string) => void;
}

import { CircularProgress } from "@nextui-org/react";

function Loader() {
    return (
        <Html center>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <CircularProgress aria-label="Učitavanje..." />
                <p style={{ fontFamily: 'sans-serif', fontSize: '14px', color: '#666' }}>Učitavanje 3D modela...</p>
            </div>
        </Html>
    );
}

// Internal Model Component
function Model({ product, configuration }: KitchenSceneProps) {
    // Load the GLB model from product.model_path or fallback
    const modelPath = product.model_path || "/models/kitchen.glb";

    const { scene } = useGLTF(modelPath);

    // Texture Loader
    const textureLoader = useRef(new THREE.TextureLoader());

    // --- MAIN LOGIC: Apply Configuration ---
    useEffect(() => {
        if (!product.options) return;

        product.options.forEach((option: ProductOption) => {
            const selectedLabel = configuration[option.name];
            if (!selectedLabel) return;

            const choice = option.choices.find((c) => c.label === selectedLabel);
            if (!choice) return;

            const targets = option.targets || [];

            if (targets.length === 0) return;

            let loadedTexture: THREE.Texture | null = null;
            if (choice.texture) {
                loadedTexture = textureLoader.current.load(choice.texture);
                loadedTexture.wrapS = THREE.RepeatWrapping;
                loadedTexture.wrapT = THREE.RepeatWrapping;
            }

            targets.forEach((targetName) => {
                scene.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.name === targetName) {
                        const material = child.material as THREE.MeshStandardMaterial;

                        // 1. Apply Color
                        if (choice.hex) {
                            material.color.set(choice.hex);
                            material.map = null;
                            material.needsUpdate = true;
                        }

                        // 2. Apply Texture
                        if (loadedTexture) {
                            material.map = loadedTexture;
                            material.color.set("#ffffff");
                            material.needsUpdate = true;
                        }

                        // 3. Apply Physical Properties
                        if (choice.materialProps) {
                            if (choice.materialProps.roughness !== undefined) material.roughness = choice.materialProps.roughness;
                            if (choice.materialProps.metalness !== undefined) material.metalness = choice.materialProps.metalness;
                            if (choice.materialProps.envMapIntensity !== undefined) material.envMapIntensity = choice.materialProps.envMapIntensity;
                            material.needsUpdate = true;
                        }
                    }
                });
            });
        });

    }, [scene, product, configuration]);

    return (
        <primitive object={scene} />
    );
}

// Main Component Wrapper
export default function KitchenScene(props: KitchenSceneProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle scroll on body when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isFullscreen]);

    const SceneContent = (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 5] }}>
                <Suspense fallback={<Loader />}>
                    <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
                        <Model {...props} />
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault />
            </Canvas>

            <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    zIndex: 10
                }}
                aria-label={isFullscreen ? "Close Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <HiX size={20} /> : <HiArrowsExpand size={20} />}
            </button>
        </>
    );

    if (isFullscreen && typeof document !== 'undefined') {
        return createPortal(
            <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                background: "#f5f5f5",
                width: "100vw",
                height: "100vh"
            }}>
                {SceneContent}
            </div>,
            document.body
        );
    }

    return (
        <div style={{
            width: "100%",
            height: "100%",
            background: "#f5f5f5",
            borderRadius: "1rem",
            overflow: "hidden",
            position: "relative",
            maxWidth: "100%"
        }}>
            {SceneContent}
        </div>
    );
}
