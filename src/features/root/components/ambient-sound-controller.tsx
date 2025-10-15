import { getRouteApi, useLocation } from '@tanstack/react-router'
import { type ReactNode, useEffect, useRef } from 'react'
import type { SearchParams } from '~/features/habits/types/schemas/search-params'
import { type AmbientSound, AmbientSoundManager } from '~/features/root/utils/ambient-sound'

type AmbientSoundControllerProps = {
  children: (props: {
    selectedSoundId: AmbientSound['id']
    volume: number
    handleSoundChange: (soundId: AmbientSound['id']) => void
    handleVolumeChange: (volume: number) => void
  }) => ReactNode
}

export function AmbientSoundController({ children }: AmbientSoundControllerProps) {
  const routeApi = getRouteApi('__root__')
  const navigate = routeApi.useNavigate()
  const location = useLocation()
  const searchParams = routeApi.useSearch()

  const selectedSoundId = searchParams.ambientSound ?? 'none'
  const volume = searchParams.ambientVolume ?? 50

  const managerRef = useRef<AmbientSoundManager | null>(null)

  useEffect(() => {
    managerRef.current = new AmbientSoundManager()

    return () => {
      managerRef.current?.dispose()
      managerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!managerRef.current) {
      return
    }

    if (selectedSoundId === 'none') {
      managerRef.current.stop()
    } else {
      managerRef.current.play(selectedSoundId)
    }
  }, [selectedSoundId])

  useEffect(() => {
    if (!managerRef.current) {
      return
    }

    managerRef.current.setVolume(volume / 100)
  }, [volume])

  const handleSoundChange = (soundId: AmbientSound['id']) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientSound: soundId as SearchParams['ambientSound'],
      }),
    })
  }

  const handleVolumeChange = (value: number) => {
    navigate({
      to: location.pathname,
      search: (prev) => ({
        ...prev,
        ambientVolume: value,
      }),
    })
  }

  return (
    <>
      {children({
        selectedSoundId,
        volume,
        handleSoundChange,
        handleVolumeChange,
      })}
    </>
  )
}
