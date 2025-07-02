"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, X } from "lucide-react"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  // Sincroniza o estado interno com o valor externo
  useEffect(() => {
    if (value) {
      setPreview(value)
    } else {
      setPreview(null)
    }
  }, [value])

  const [preview, setPreview] = useState<string | null>(value)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreview(base64String)
        onChange(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange("")
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center relative bg-muted/50">
        {preview ? (
          <>
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              layout="fill"
              objectFit="contain"
              className="rounded-lg p-2"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 z-10 h-7 w-7"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          >
            <UploadCloud className="h-8 w-8 mb-2" />
            <span>Clique para enviar</span>
            <Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  )
}
