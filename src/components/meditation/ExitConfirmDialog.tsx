interface ExitConfirmDialogProps {
  remainingMinutes: number
  onContinue: () => void
  onExit: () => void
}

export default function ExitConfirmDialog({
  remainingMinutes,
  onContinue,
  onExit,
}: ExitConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
        style={{
          background: 'rgba(30, 30, 50, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <p className="font-display text-xl mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Leave so soon?
        </p>
        <p className="text-sm mb-8" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          {remainingMinutes} {remainingMinutes === 1 ? 'minute' : 'minutes'} remaining.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            Keep Resting
          </button>
          <button
            onClick={onExit}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  )
}
