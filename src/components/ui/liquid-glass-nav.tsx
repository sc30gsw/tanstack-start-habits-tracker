import { useMantineColorScheme } from '@mantine/core'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

const DISPLACEMENT_MAP =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/2wCEAAQDAwMDAwQDAwQGBAMEBgcFBAQFBwgHBwcHBwgLCAkJCQkICwsMDAwMDAsNDQ4ODQ0SEhISEhQUFBQUFBQUFBQBBQUFCAgIEAsLEBQODg4UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/CABEIAQABAAMBEQACEQEDEQH/xAAxAAEBAQEBAQAAAAAAAAAAAAADAgQIAQYBAQEBAQEBAQAAAAAAAAAAAAMCBAEACAf/2gAMAwEAAhADEAAAAPjPor6kOgOiKhKgKhKgOhKhOhKxKgKhOgKhKhKgKxOhKhOgKhKhKgKwKhKgKgKwG841nns9J/nn2KVCdCdCVAVCVCVAdCVCdiVAVidCVAVCVAdiVCVCdAVCVCVAVCVAVAViVZxsBrPPY6R/NvsY6E6ErEqAqE6ErAqE6E7E7ErA0ErArAqAqEuiVAXRLol0S6J0JUBWBUI0BXnG88djpH81+xjoToSoSoCoTsSoYQTsTQSsCsCsCsCoCsCqAugNCXgLol4T6JUJUBUBUBsBrPFH0j+a/Yx0J0JUJUJ2BUMIRoBoJQI4BXnJAK840BUA0BeAvCXiLxF4i4JUJUBUBXnjp9Ifmv2MdEdAVCViVCdiVjGEaAaAaASgaATQSZxvONZwsB7nHoD0S8JcI/EXiPxHoi6JUBUBXnGg6R/NfsU6IqEqGLKEKE0EaCSgaAKZxXOKZhvONZxrOPc4dEuiPBLwl4T4RcM+M/GXSKwOi6R/NfsU6I6I6GLOEKEaEKUIEaJqBoBLnFMw3nBMwXnGs4VnHucOiXBLxHwz4Z8KPGXSKwKi6R/NPsU6ErKKKbObKUObKEKFCBGgkuYVzgmULyhWYKzD3OPQHwlwS8R8M+HHDPxHRFYHRdI/mn2MdCVCdiylDlShBNBJBJc4pnFc4JlC84XmzXlC82Ogo=='

interface LiquidGlassNavProps {
  children: React.ReactNode
  className?: string
}

export function LiquidGlassNav({ children, className = '' }: LiquidGlassNavProps) {
  const filterId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<HTMLDivElement>(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [glassSize, setGlassSize] = useState({ width: 400, height: 90 })

  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // マウス追跡
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    setMousePos({
      x: e.clientX,
      y: e.clientY,
    })
  }, [])

  // マウスイベントリスナー設定
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // ガラスサイズの更新
  useEffect(() => {
    const updateSize = () => {
      if (glassRef.current) {
        const rect = glassRef.current.getBoundingClientRect()
        setGlassSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // エラスティック効果の計算
  const calculateElastic = useCallback(() => {
    if (!glassRef.current || !mousePos.x || !mousePos.y) {
      return { x: 0, y: 0 }
    }

    const rect = glassRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = mousePos.x - centerX
    const deltaY = mousePos.y - centerY

    // エッジからの距離を計算
    const edgeDistanceX = Math.max(0, Math.abs(deltaX) - glassSize.width / 2)
    const edgeDistanceY = Math.max(0, Math.abs(deltaY) - glassSize.height / 2)
    const edgeDistance = Math.sqrt(edgeDistanceX * edgeDistanceX + edgeDistanceY * edgeDistanceY)

    const activationZone = 200
    if (edgeDistance > activationZone) return { x: 0, y: 0 }

    const fadeInFactor = 1 - edgeDistance / activationZone
    const elasticity = 0.15

    return {
      x: deltaX * elasticity * 0.1 * fadeInFactor,
      y: deltaY * elasticity * 0.1 * fadeInFactor,
    }
  }, [mousePos, glassSize])

  const elastic = calculateElastic()
  const displacementScale = isDark ? 64 : 40 // 正確な値に調整
  const blurAmount = 20 // ガラス越し効果のための強いblur
  const saturation = 150 // より鮮やかな色彩

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        transform: `translate(${elastic.x}px, ${elastic.y}px)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* SVGフィルター定義 */}
      <svg
        style={{
          position: 'absolute',
          width: glassSize.width,
          height: glassSize.height,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            {/* Displacementマップ */}
            <feImage
              href={DISPLACEMENT_MAP}
              result="DISPLACEMENT_MAP"
              preserveAspectRatio="xMidYMid slice"
            />

            {/* エッジマスク */}
            <feColorMatrix
              in="DISPLACEMENT_MAP"
              type="matrix"
              values="0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0 0 0 1 0"
              result="EDGE_INTENSITY"
            />

            {/* RGB色収差効果 */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * -1}
              xChannelSelector="R"
              yChannelSelector="B"
              result="RED_DISPLACED"
            />
            <feColorMatrix
              in="RED_DISPLACED"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="RED_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * -1 - 6.4}
              xChannelSelector="R"
              yChannelSelector="B"
              result="GREEN_DISPLACED"
            />
            <feColorMatrix
              in="GREEN_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="GREEN_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * -1 - 12.8}
              xChannelSelector="R"
              yChannelSelector="B"
              result="BLUE_DISPLACED"
            />
            <feColorMatrix
              in="BLUE_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="BLUE_CHANNEL"
            />

            {/* チャンネル合成 */}
            <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
            <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

            {/* Gaussian Blur for smoother aberration */}
            <feGaussianBlur in="RGB_COMBINED" stdDeviation="0.3" result="ABERRATED_BLURRED" />

            {/* Composite with edge mask */}
            <feComposite in="ABERRATED_BLURRED" in2="EDGE_INTENSITY" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* メインガラスコンテナ */}
      <div
        ref={glassRef}
        className="relative inline-flex overflow-hidden transition-all duration-200"
        style={{
          borderRadius: '100px',
          boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* バックドロップ（ワープ効果） */}
        <span
          className="absolute inset-0"
          style={{
            filter: `url(#${filterId})`,
            backdropFilter: `blur(${blurAmount}px) saturate(${saturation}%)`,
            WebkitBackdropFilter: `blur(${blurAmount}px) saturate(${saturation}%)`,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
          }}
        />

        {/* 追加のフロストレイヤー（ガラスの質感） */}
        <span
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {/* コンテンツレイヤー */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
