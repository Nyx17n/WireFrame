import type { SoundChoice } from '@shared/schemas/settings.schema'

const SOUND_PATHS: Record<SoundChoice, string> = {
  classic: './sounds/notification.mp3',
  bell: './sounds/notification-bell.wav'
}

let activeAudio: HTMLAudioElement | null = null

export async function playAlertSoundPreview(
  choice: SoundChoice,
  volumePercent: number
): Promise<void> {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
  }

  const audio = new Audio(SOUND_PATHS[choice])
  audio.volume = Math.max(0, Math.min(1, volumePercent / 100))
  activeAudio = audio
  await audio.play()
}

