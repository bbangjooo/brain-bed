import { useEffect, useRef, useState, useCallback } from 'react'

const TRACKS = [
  { title: 'Gymnopédies No.1', artist: 'Erik Satie', file: 'gymnopedies-no1.mp3' },
  { title: 'Gymnopédies No.2', artist: 'Erik Satie', file: 'gymnopedie-no2.mp3' },
  { title: 'Gnossienne No.1', artist: 'Erik Satie', file: 'gnossienne-no1.mp3' },
  { title: 'Clair de Lune', artist: 'Claude Debussy', file: 'clair-de-lune.ogg' },
  { title: 'Rêverie', artist: 'Claude Debussy', file: 'reverie.mp3' },
  { title: 'Prelude in E minor', artist: 'Frédéric Chopin', file: 'prelude-e-minor.mp3' },
  { title: 'Nocturne Op.9 No.2', artist: 'Frédéric Chopin', file: 'nocturne-op9-no2.mp3' },
  { title: 'Moonlight Sonata (1st Mvt)', artist: 'Ludwig van Beethoven', file: 'moonlight-sonata-1st.mp3' },
  { title: 'Canon in D', artist: 'Johann Pachelbel', file: 'canon-in-d.mp3' },
  { title: 'Pavane Op.50', artist: 'Gabriel Fauré', file: 'pavane.mp3' },
  { title: 'Le Cygne (The Swan)', artist: 'Camille Saint-Saëns', file: 'le-cygne.mp3' },
  { title: 'Piano Concerto No.2 (1st Mvt)', artist: 'Sergei Rachmaninoff', file: 'rach-piano-concerto-2-1st.mp3' },
  { title: 'Symphony No.2 (3rd Mvt)', artist: 'Sergei Rachmaninoff', file: 'rach-symphony-2-3rd.mp3' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface AudioPlayerProps {
  autoplay: boolean
  onAnalyserReady?: (analyser: AnalyserNode) => void
}

export default function AudioPlayer({ autoplay, onAnalyserReady }: AudioPlayerProps) {
  const [playlist] = useState(() => shuffleArray(TRACKS))
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [hasAudio, setHasAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const connectedRef = useRef(false)

  const setupAudioContext = useCallback((audio: HTMLAudioElement) => {
    if (connectedRef.current || !onAnalyserReady) return

    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8

      const source = ctx.createMediaElementSource(audio)
      const gainNode = ctx.createGain()
      gainNode.gain.value = volume

      source.connect(analyser)
      analyser.connect(gainNode)
      gainNode.connect(ctx.destination)

      audioContextRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      gainNodeRef.current = gainNode
      connectedRef.current = true

      onAnalyserReady(analyser)
    } catch {
      // Fallback: no audio context
    }
  }, [onAnalyserReady, volume])

  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    const track = playlist[currentTrack]
    audio.src = `./resources/audio/${track.file}`

    audio.addEventListener('canplay', () => {
      setHasAudio(true)
      audioRef.current = audio

      if (onAnalyserReady) {
        setupAudioContext(audio)
      }

      if (autoplay) {
        fadeIn(audio)
      }
    })

    audio.addEventListener('ended', () => {
      setCurrentTrack((prev) => (prev + 1) % playlist.length)
    })

    audio.addEventListener('error', () => {
      setHasAudio(false)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [currentTrack])

  function fadeIn(audio: HTMLAudioElement) {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = 0
    } else {
      audio.volume = 0
    }
    audio.play().catch(() => {})
    setIsPlaying(true)

    let vol = 0
    const targetVol = volume
    const interval = setInterval(() => {
      vol += 0.05
      if (vol >= targetVol) {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = targetVol
        } else {
          audio.volume = targetVol
        }
        clearInterval(interval)
      } else {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = vol
        } else {
          audio.volume = vol
        }
      }
    }, 100)
  }

  function toggleMute() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVol
    } else if (audioRef.current) {
      audioRef.current.volume = newVol
    }
  }

  const track = playlist[currentTrack]

  return (
    <div className="flex items-center gap-4 px-6">
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {track.title} — {track.artist}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="p-1 rounded-full transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          title={isPlaying ? 'Mute' : 'Play'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, rgba(255,255,255,0.6) ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
          }}
        />
      </div>

      {!hasAudio && (
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
          No audio files found
        </p>
      )}
    </div>
  )
}
