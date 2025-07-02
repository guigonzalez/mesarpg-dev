"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { SheetField } from "@/lib/types"

interface AttributeBoxProps {
  field: SheetField
  onChange: (value: number) => void
}

export function AttributeBox({ field, onChange }: AttributeBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 p-2 border rounded-lg bg-muted/50 text-center transition-all hover:border-primary/50">
      <Label htmlFor={field.name} className="text-xs text-muted-foreground uppercase tracking-wider">
        {field.name}
      </Label>
      <Input
        id={field.name}
        type="number"
        value={field.value as number}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10) || 0)}
        className="w-full text-3xl font-bold text-center bg-transparent border-none h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}
