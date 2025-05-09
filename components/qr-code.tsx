"use client"

import { useEffect, useRef } from "react"
import QRCodeLib from "qrcode"

interface QRCodeProps {
  value: string
  size?: number
}

export default function QRCode({ value, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [value, size])

  return (
    <div className="bg-white p-4 rounded-lg">
      <canvas ref={canvasRef} />
    </div>
  )
}
