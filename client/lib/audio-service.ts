// Audio service for managing sounds and volume
export class AudioService {
  private static instance: AudioService
  private audioContext: AudioContext | null = null
  private masterVolume = 0.7 // Default volume (0-1)
  private isMuted = false

  private constructor() {
    this.initializeAudioContext()
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn("Web Audio API not supported:", error)
    }
  }

  // Volume management
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveVolumeSettings()
  }

  public getVolume(): number {
    return this.masterVolume
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
    this.saveVolumeSettings()
  }

  public isMutedState(): boolean {
    return this.isMuted
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    this.saveVolumeSettings()
    return this.isMuted
  }

  // Load/save settings
  public loadVolumeSettings(userId: string): void {
    const settings = localStorage.getItem(`audioSettings_${userId}`)
    if (settings) {
      const parsed = JSON.parse(settings)
      this.masterVolume = parsed.volume ?? 0.7
      this.isMuted = parsed.muted ?? false
    }
  }

  private saveVolumeSettings(): void {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user._id) {
      const settings = {
        volume: this.masterVolume,
        muted: this.isMuted,
      }
      localStorage.setItem(`audioSettings_${user._id}`, JSON.stringify(settings))
    }
  }

  // Play notification sound
  public playNotificationSound(type: "start" | "end" | "abort" | "test" = "start"): void {
    if (this.isMuted) return

    try {
      this.playBeepSound(type)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }

  // Generate beep sounds using Web Audio API
  private playBeepSound(type: "start" | "end" | "abort" | "test"): void {
    if (!this.audioContext || this.isMuted) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Different frequencies and patterns for different events
    let frequency: number
    let duration: number
    let pattern: number[] = [1] // Default single beep

    switch (type) {
      case "start":
        frequency = 800 // Higher pitch for start
        duration = 0.3
        pattern = [1, 0.2, 1] // Two beeps
        break
      case "end":
        frequency = 600 // Medium pitch for end
        duration = 0.5
        pattern = [1, 0.1, 1, 0.1, 1] // Three beeps
        break
      case "abort":
        frequency = 400 // Lower pitch for abort
        duration = 0.8
        pattern = [1] // Single long beep
        break
      case "test":
        frequency = 700
        duration = 0.4
        pattern = [1, 0.2, 1] // Two beeps
        break
      default:
        frequency = 600
        duration = 0.3
        pattern = [1]
    }

    this.playBeepPattern(oscillator, gainNode, frequency, duration, pattern, 0)
  }

  private playBeepPattern(
    oscillator: OscillatorNode,
    gainNode: GainNode,
    frequency: number,
    duration: number,
    pattern: number[],
    index: number,
  ): void {
    if (!this.audioContext || index >= pattern.length) return

    const currentTime = this.audioContext.currentTime
    const beepDuration = duration * pattern[index]
    const volume = this.masterVolume * 0.3 // Keep notification sounds relatively quiet

    oscillator.frequency.setValueAtTime(frequency, currentTime)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + beepDuration)

    if (index === 0) {
      oscillator.start(currentTime)
    }

    // Schedule next beep in pattern
    if (index < pattern.length - 1) {
      setTimeout(
        () => {
          const newOscillator = this.audioContext!.createOscillator()
          const newGainNode = this.audioContext!.createGain()
          newOscillator.connect(newGainNode)
          newGainNode.connect(this.audioContext!.destination)
          this.playBeepPattern(newOscillator, newGainNode, frequency, duration, pattern, index + 1)
        },
        (beepDuration + 0.1) * 1000,
      )
    } else {
      oscillator.stop(currentTime + beepDuration)
    }
  }

  // Test audio functionality
  public testAudio(): void {
    this.playNotificationSound("test")
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance()
