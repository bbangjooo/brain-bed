import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

interface Scene3DProps {
  analyser: AnalyserNode | null
}

function FloatingOrb({ position, scale, color, speed }: {
  position: [number, number, number]
  scale: number
  color: string
  speed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime * speed
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3
    meshRef.current.position.x = position[0] + Math.cos(t * 0.7) * 0.15
  })

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.8}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  )
}

function ParticleField({ analyser }: { analyser: AnalyserNode | null }) {
  const pointsRef = useRef<THREE.Points>(null)
  const smoothedAudio = useRef(0)
  const dataArray = useMemo(() => analyser ? new Uint8Array(analyser.frequencyBinCount) : null, [analyser])

  const { positions, basePositions, count } = useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    const basePositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 4

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi) - 5

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      basePositions[i * 3] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z
    }
    return { positions, basePositions, count }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position.array as Float32Array
    const t = state.clock.elapsedTime

    let audioLevel = 0
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray)
      audioLevel = dataArray.reduce((sum, v) => sum + v, 0) / (dataArray.length * 255)
    }
    // Smooth audio response to prevent jerky motion
    smoothedAudio.current += (audioLevel - smoothedAudio.current) * 0.05

    const breathe = Math.sin(t * 0.3) * 0.15
    const audioReact = smoothedAudio.current * 0.4

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3]
      const by = basePositions[i * 3 + 1]
      const bz = basePositions[i * 3 + 2]

      const dist = Math.sqrt(bx * bx + by * by + (bz + 5) * (bz + 5))
      const scale = 1 + breathe + audioReact * (1 - dist / 7)

      pos[i * 3] = bx * scale + Math.sin(t * 0.5 + i * 0.01) * 0.02
      pos[i * 3 + 1] = by * scale + Math.cos(t * 0.3 + i * 0.02) * 0.02
      pos[i * 3 + 2] = bz
    }
    geo.attributes.position.needsUpdate = true

    // Slow rotation
    pointsRef.current.rotation.y = t * 0.02
    pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function Scene3D({ analyser }: Scene3DProps) {
  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    gl.setClearColor(new THREE.Color(0x000000), 0)
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={handleCreated}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#8b5cf6" />

        <FloatingOrb position={[-2.5, 1.5, -3]} scale={1.2} color="#4338ca" speed={0.4} />
        <FloatingOrb position={[2, -1, -4]} scale={0.8} color="#6366f1" speed={0.6} />
        <FloatingOrb position={[0, 2, -6]} scale={1.5} color="#7c3aed" speed={0.3} />
        <FloatingOrb position={[-1.5, -2, -5]} scale={0.6} color="#8b5cf6" speed={0.5} />

        <ParticleField analyser={analyser} />
      </Canvas>
    </div>
  )
}
