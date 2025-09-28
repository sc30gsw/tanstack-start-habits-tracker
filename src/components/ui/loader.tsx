import { IconLoader } from '@tabler/icons-react'

export function Loader() {
  return (
    <div className="my-48 flex animate-spin items-center justify-center">
      <IconLoader
        size={48}
        stroke={2}
        color="#339af0"
        style={{
          animationDuration: '0.3s',
        }}
      />
    </div>
  )
}
