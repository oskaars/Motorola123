"use client"
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
}

// Prosty model króla szachowego z podstawowych kształtów
const SimplePieceModel = () => {
  return (
    <group>
      {/* Podstawa */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 0.4, 16]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Trzon */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 16]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Korona - dolna część */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 0.3, 16]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Korona - górna część */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.6, 0.2, 16]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Krzyż - pion */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Krzyż - poziom */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.15, 0.15]} />
        <meshStandardMaterial color="#dddddd" roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
};

const ChessPiece = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [loadingFailed, setLoadingFailed] = useState(false);

  // Nasłuchiwanie ruchu myszy
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Ładowanie modelu OBJ z MTL
  useEffect(() => {
    // Najpierw próbujemy załadować MTL
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/models/');
    mtlLoader.load(
      'king.mtl',
      (materials) => {
        materials.preload();

        // Po załadowaniu MTL, ładujemy OBJ
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/');
        objLoader.load(
          'king.obj',
          (object) => {
            console.log("Model OBJ z MTL załadowany pomyślnie");

            // Ustawiamy cienie
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // Skalowanie i centrowanie
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            object.scale.set(scale, scale, scale);

            // Centrowanie
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center.multiplyScalar(scale));

            setModel(object);
          },
          undefined,
          (error) => {
            console.error("Błąd ładowania modelu OBJ:", error);
            setLoadingFailed(true);
          }
        );
      },
      undefined,
      (error) => {
        console.error("Błąd ładowania materiałów MTL:", error);

        // Próbujemy załadować sam OBJ bez materiałów
        const objLoader = new OBJLoader();
        objLoader.setPath('/models/');
        objLoader.load(
          'king.obj',
          (object) => {
            console.log("Model OBJ załadowany pomyślnie bez MTL");

            // Ustawiamy domyślny materiał
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                  color: 0xdddddd,
                  roughness: 0.7,
                  metalness: 0.2
                });
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // Skalowanie i centrowanie
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            object.scale.set(scale, scale, scale);

            // Centrowanie
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center.multiplyScalar(scale));

            setModel(object);
          },
          undefined,
          (error) => {
            console.error("Nie udało się załadować modelu OBJ:", error);
            setLoadingFailed(true);
          }
        );
      }
    );
  }, []);

  // Animacja obracania w kierunku kursora
// Animacja przesuwania w kierunku kursora w płaszczyźnie XY
  useFrame(() => {
    if (groupRef.current) {
      // Przesuwanie figury w płaszczyźnie XY zamiast obracania
      const targetX = mousePosition.x * 3; // Zwiększony zakres ruchu
      const targetY = mousePosition.y * 2;

      // Płynne przesunięcie z interpolacją
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.05 // Prędkość śledzenia kursora
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.05
      );

      // Lekkie pochylenie w kierunku ruchu
      const tiltAmount = 0.2;
      groupRef.current.rotation.z = -mousePosition.x * tiltAmount;
      groupRef.current.rotation.x = mousePosition.y * tiltAmount;

      // Stały obrót wokół własnej osi dla dodatkowego efektu
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      {(loadingFailed || !model) ? <SimplePieceModel /> : <primitive object={model} />}
    </group>
  );
};

const ChessPiece3DFollower: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
      <Canvas shadows>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />

        <Suspense fallback={<SimplePieceModel />}>
          <ChessPiece />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ChessPiece3DFollower;
