"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Trash2, Plus, Target, Image as ImageIcon, Loader2, Grid3X3, Upload, MousePointer2, CheckCircle2 } from "lucide-react"
import { useRef } from "react"

interface HotspotZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  isCorrect?: boolean
}

interface HotspotQuestionProps {
  imageUrl: string
  setImageUrl: (url: string) => void
  imageAlt: string
  setImageAlt: (alt: string) => void
  instructions: string
  setInstructions: (value: string) => void
  zones: HotspotZone[]
  setZones: (zones: HotspotZone[]) => void
  subject?: string
  difficulty?: string
}

export function HotspotQuestion({
  imageUrl,
  setImageUrl,
  imageAlt,
  setImageAlt,
  instructions,
  setInstructions,
  zones,
  setZones,
  subject = "General",
  difficulty: initialDifficulty = "medium"
}: HotspotQuestionProps) {

  const fixedImageSrc = "/world%20map.PNG"

  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty)
  const [showGrid, setShowGrid] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null)
  const [renderImageSrc, setRenderImageSrc] = useState<string>(fixedImageSrc)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (imageUrl !== fixedImageSrc) {
      setImageUrl(fixedImageSrc)
    }
    if (renderImageSrc !== fixedImageSrc) {
      setRenderImageSrc(fixedImageSrc)
    }
  }, [fixedImageSrc, imageUrl, renderImageSrc, setImageUrl])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl || !imageContainerRef.current) return

    // Prevent default to avoid drag behaviors
    e.preventDefault()

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setStartPos({ x, y })
    setIsDrawing(true)
    setSelectedZone(null) // Deselect existing
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos || !imageContainerRef.current) return

    e.preventDefault()
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const currentX = ((e.clientX - rect.left) / rect.width) * 100
    const currentY = ((e.clientY - rect.top) / rect.height) * 100

    // Calculate dimensions
    const width = Math.abs(currentX - startPos.x)
    const height = Math.abs(currentY - startPos.y)

    // Calculate top-left based on direction of drag
    const x = Math.min(startPos.x, currentX)
    const y = Math.min(startPos.y, currentY)

    // Only add if it has some size
    if (width > 2 && height > 2) {
      const newZone: HotspotZone = {
        id: `zone-${Date.now()}`,
        x,
        y,
        width,
        height,
        isCorrect: false
      }

      setZones([...zones, newZone])
      setSelectedZone(newZone.id)
    }

    setIsDrawing(false)
    setStartPos(null)
  }

  // Helper to trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleZoneAdd = () => {
    const newZone: HotspotZone = {
      id: `zone-${Date.now()}`,
      x: 50,
      y: 50,
      width: 10,
      height: 10,
      isCorrect: false
    }
    setZones([...zones, newZone])
    setSelectedZone(newZone.id)
  }

  const handleZoneUpdate = (id: string, updates: Partial<HotspotZone>) => {
    setZones(zones.map(zone =>
      zone.id === id ? { ...zone, ...updates } : zone
    ))
  }

  const handleZoneDelete = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id))
    if (selectedZone === id) {
      setSelectedZone(null)
    }
  }

  const handleGenerateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!instructions?.trim() && !imageAlt?.trim()) {
      alert('Please provide some instructions or image description first.');
      return;
    }

    setIsGeneratingInstructions(true);

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as an Assessment Design Specialist. Your task is to write clear instructions for a Hotspot/Image Interaction question.

INPUT INSTRUCTION/DRAFT: "${instructions}"
IMAGE DESCRIPTION: "${imageAlt}"
SUBJECT: "${subject}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. Create a clear, concise instruction telling the student what to identify or click on in the image.
2. Return ONLY the instruction text.
3. Do not include labels like "Instructions:".

GOAL: Clear, student-friendly instructions.`
        })
      });

      const data = await response.json();
      if (data.success && data.response) {
        setInstructions(data.response.trim());
      }
    } catch (error) {
      console.error("Instruction Generation Error:", error);
    } finally {
      setIsGeneratingInstructions(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="hotspotInstructions" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instructions</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={handleGenerateInstructions}
            disabled={isGeneratingInstructions}
          >
            {isGeneratingInstructions ? (
              <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-2.5 w-2.5 mr-1" />
            )}
            AI MAGIC
          </Button>
        </div>
        <div className="relative">
          <Input
            id="hotspotInstructions"
            placeholder="e.g. Click the nucleus..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={isGeneratingInstructions}
            className="h-9 text-sm border-slate-200 focus:ring-indigo-500"
          />
          {isGeneratingInstructions && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded z-10">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Image Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Canvas</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={`h-6 px-1.5 text-[10px] font-bold ${showGrid ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}
            >
              <Grid3X3 className="h-3 w-3 mr-1" />
              GRID
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={triggerFileUpload}
              className="h-6 px-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600"
            >
              <Upload className="h-3 w-3 mr-1" />
              SWAP
            </Button>
          </div>
        </div>

        {/* Canvas Container */}
        <div
          className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 min-h-[240px] relative select-none group shadow-inner"
          ref={imageContainerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {imageUrl ? (
            <>
              <img
                src={renderImageSrc}
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Overlay Grid */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none z-10">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-black/5 dark:border-white/5" />
                  ))}
                </div>
              )}

              {/* Hotspot Zones Overlay */}
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`absolute border-2 cursor-pointer transition-all duration-200 z-20 hover:z-30 ${selectedZone === zone.id
                    ? 'border-indigo-600 bg-indigo-600/20 shadow-lg'
                    : zone.isCorrect
                      ? 'border-emerald-500 bg-emerald-500/10 hover:border-emerald-600'
                      : 'border-white/80 bg-black/10 hover:border-indigo-600/60 hover:bg-indigo-600/5'
                    }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedZone(zone.id)
                  }}
                >
                  <div className="flex items-center justify-center h-full relative">
                    <div className={`rounded-full p-0.5 ${selectedZone === zone.id ? 'bg-indigo-600 text-white' : zone.isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/80 text-black/80'}`}>
                      <Target className="h-2.5 w-2.5" />
                    </div>
                    {zone.isCorrect && (
                      <div className="absolute top-0 right-0 p-0.5">
                        <CheckCircle2 className="h-2 w-2 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={triggerFileUpload}
            >
              <ImageIcon className="h-8 w-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Reference Image</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
        <p className="text-[9px] text-slate-400 font-medium italic">Click & drag to create a hotspot zone</p>
      </div>

      {/* Zones List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Zones ({zones.length})</Label>
          <Button variant="ghost" size="sm" onClick={handleZoneAdd} className="h-6 px-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-600">
            <Plus className="h-3 w-3 mr-1" /> MANUAL
          </Button>
        </div>

        <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
          {zones.length === 0 ? (
            <div className="py-4 text-center border border-dashed border-slate-100 rounded-lg bg-slate-50/30">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No zones created</p>
            </div>
          ) : (
            zones.map((zone, index) => (
              <div
                key={zone.id}
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${selectedZone === zone.id
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                onClick={() => setSelectedZone(zone.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedZone === zone.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold ${selectedZone === zone.id ? 'text-indigo-900' : 'text-slate-700'}`}>Zone {index + 1}</span>
                      {zone.isCorrect && (
                        <Badge className="h-3.5 px-1 bg-emerald-50 text-[8px] font-black text-emerald-600 border-emerald-100 uppercase tracking-tighter">Target</Badge>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">X:{Math.round(zone.x)} Y:{Math.round(zone.y)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 px-1.5 text-[10px] font-black uppercase tracking-tight ${zone.isCorrect ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-400'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleZoneUpdate(zone.id, { isCorrect: !zone.isCorrect })
                    }}
                  >
                    {zone.isCorrect ? 'Master' : 'Mark Key'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleZoneDelete(zone.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Compact Settings */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level</Label>
          <Select
            value={currentDifficulty}
            onValueChange={(val) => {
              if (val !== currentDifficulty) {
                setCurrentDifficulty(val)
              }
            }}
          >
            <SelectTrigger className="h-8 text-[11px] font-medium border-slate-100 bg-slate-50/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</Label>
          <Input type="number" defaultValue="1" min="1" className="h-8 text-[11px] font-medium border-slate-100 bg-slate-50/50" />
        </div>
      </div>
    </div>
  )
}
