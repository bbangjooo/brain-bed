import CoreGraphics
import Foundation

// Brain Bed Keyboard Blocker
// Based on the approach from raycast/extensions/clean-keyboard
//
// Uses CGEventTap to intercept all keyboard events at the system level.
// Unlock hotkey: Cmd+Shift+Escape (configurable via --unlock-key argument)
// Exit signals: receives "unlock" on stdin, or the unlock hotkey is pressed.
//
// Usage:
//   keyboard-blocker [--duration <seconds>] [--unlock-key <cmd+shift+escape>]
//
// When the keyboard is unlocked (by hotkey or duration expiry),
// it prints "unlocked" to stdout and exits.

// MARK: - Key Codes

let kVK_Escape: CGKeyCode = 0x35
let kVK_Command: CGEventFlags = .maskCommand
let kVK_Shift: CGEventFlags = .maskShift

// MARK: - Configuration

struct Config {
  var duration: Int? = nil  // nil = until explicitly unlocked
  var unlockModifiers: CGEventFlags = [.maskCommand, .maskShift]
  var unlockKeyCode: CGKeyCode = 0x35  // Escape
}

func parseArgs() -> Config {
  var config = Config()
  let args = CommandLine.arguments

  var i = 1
  while i < args.count {
    switch args[i] {
    case "--duration":
      i += 1
      if i < args.count { config.duration = Int(args[i]) }
    case "--unlock-key":
      i += 1
      // For now, only support cmd+shift+escape (default)
      // Could be extended to parse key combos
    default:
      break
    }
    i += 1
  }

  return config
}

// MARK: - Event Handler

class KeyboardBlocker {
  let config: Config
  var isLocked = true
  var eventTap: CFMachPort?

  init(config: Config) {
    self.config = config
  }

  func start() {
    setupEventTap()
    setupStdinListener()

    if let duration = config.duration {
      scheduleTimer(duration: duration)
    }

    // Print ready signal
    print("locked", terminator: "\n")
    fflush(stdout)

    CFRunLoopRun()
  }

  func unlock() {
    isLocked = false

    // Disable the event tap
    if let tap = eventTap {
      CGEvent.tapEnable(tap: tap, enable: false)
    }

    print("unlocked", terminator: "\n")
    fflush(stdout)

    CFRunLoopStop(CFRunLoopGetCurrent())
  }

  private func setupEventTap() {
    let eventMask = CGEventMask(
      (1 << CGEventType.keyDown.rawValue) |
      (1 << CGEventType.keyUp.rawValue) |
      (1 << CGEventType.flagsChanged.rawValue)
    )

    guard let tap = CGEvent.tapCreate(
      tap: .cghidEventTap,
      place: .headInsertEventTap,
      options: .defaultTap,
      eventsOfInterest: eventMask,
      callback: keyEventCallback,
      userInfo: UnsafeMutableRawPointer(
        Unmanaged.passUnretained(self).toOpaque()
      )
    ) else {
      // Event tap creation failed — likely no Accessibility permission
      fputs("error:accessibility_permission_required\n", stderr)
      exit(1)
    }

    self.eventTap = tap

    let runLoopSource = CFMachPortCreateRunLoopSource(
      kCFAllocatorDefault, tap, 0
    )
    CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
    CGEvent.tapEnable(tap: tap, enable: true)
  }

  private func setupStdinListener() {
    // Listen for "unlock" command on stdin (from Electron)
    DispatchQueue.global(qos: .userInteractive).async { [weak self] in
      while let line = readLine() {
        if line.trimmingCharacters(in: .whitespacesAndNewlines) == "unlock" {
          DispatchQueue.main.async {
            self?.unlock()
          }
          break
        }
      }
    }
  }

  private func scheduleTimer(duration: Int) {
    let timer = Timer(timeInterval: TimeInterval(duration), repeats: false) { [weak self] _ in
      self?.unlock()
    }
    RunLoop.current.add(timer, forMode: .common)
  }

  func handleKeyEvent(
    proxy: CGEventTapProxy,
    type: CGEventType,
    event: CGEvent
  ) -> Unmanaged<CGEvent>? {
    // If not locked, pass all events through
    guard isLocked else {
      return Unmanaged.passRetained(event)
    }

    // Allow flagsChanged events through (modifier key state updates)
    // but block keyDown and keyUp
    if type == .flagsChanged {
      return Unmanaged.passRetained(event)
    }

    guard type == .keyDown || type == .keyUp else {
      return Unmanaged.passRetained(event)
    }

    let keyCode = CGKeyCode(event.getIntegerValueField(.keyboardEventKeycode))
    let flags = event.flags

    // Check for unlock hotkey: Cmd+Shift+Escape
    let hasCmd = flags.contains(.maskCommand)
    let hasShift = flags.contains(.maskShift)

    if hasCmd && hasShift && keyCode == config.unlockKeyCode {
      if type == .keyDown {
        unlock()
      }
      return nil  // Consume the unlock key event
    }

    // Block all other keyboard events
    return nil
  }
}

// MARK: - C Callback

func keyEventCallback(
  proxy: CGEventTapProxy,
  type: CGEventType,
  event: CGEvent,
  refcon: UnsafeMutableRawPointer?
) -> Unmanaged<CGEvent>? {
  guard let refcon = refcon else {
    return Unmanaged.passRetained(event)
  }

  // Handle event tap being disabled by the system
  if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
    // Re-enable the tap
    let blocker = Unmanaged<KeyboardBlocker>.fromOpaque(refcon).takeUnretainedValue()
    if let tap = blocker.eventTap {
      CGEvent.tapEnable(tap: tap, enable: true)
    }
    return Unmanaged.passRetained(event)
  }

  let blocker = Unmanaged<KeyboardBlocker>.fromOpaque(refcon).takeUnretainedValue()
  return blocker.handleKeyEvent(proxy: proxy, type: type, event: event)
}

// MARK: - Main

let config = parseArgs()
let blocker = KeyboardBlocker(config: config)
blocker.start()
