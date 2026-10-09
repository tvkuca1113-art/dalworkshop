import * as THREE from 'three';

/** Shared, never-disposed scene materials (one instance per page). */
let metal: THREE.MeshStandardMaterial | null = null;
let handleMetal: THREE.MeshStandardMaterial | null = null;

/** Powder-coated black steel: a satin dielectric coat over metal. */
export function frameMaterial(): THREE.MeshStandardMaterial {
  metal ??= new THREE.MeshStandardMaterial({ color: '#242623', metalness: 0.25, roughness: 0.42, envMapIntensity: 1, name: 'powder-coated-steel' });
  return metal;
}

/** Black handles: slightly glossier metal. */
export function handleMaterial(): THREE.MeshStandardMaterial {
  handleMetal ??= new THREE.MeshStandardMaterial({ color: '#121212', metalness: 0.65, roughness: 0.32, envMapIntensity: 1, name: 'black-handle' });
  return handleMetal;
}
