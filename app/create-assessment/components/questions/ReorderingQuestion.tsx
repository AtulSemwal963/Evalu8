"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Trash2, GripVertical, Plus, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { motion, Reorder } from "framer-motion"

interface OrderingItem {
  id: number
  text: string
}

interface ReorderingQuestionProps {
  instructions: string
  setInstructions: (value: string) => void
  items: OrderingItem[]
  setItems: (items: OrderingItem[]) => void
  explanation: string
  setExplanation: (value: string) => void
  correctOrder?: string[]
  setCorrectOrder: (value: string[]) => void
  subject?: string
  difficulty?: string
}

export function ReorderingQuestion({
  instructions,
  setInstructions,
  items,
  setItems,
  explanation,
  setExplanation,
  correctOrder,
  setCorrectOrder,
  subject = "General",
  difficulty: initialDifficulty = "medium"
}: ReorderingQuestionProps) {

  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false)
  const [isGeneratingItems, setIsGeneratingItems] = useState(false)
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty)

  const handleItemChange = (id: number, text: string) => {
    const oldItem = items.find(i => i.id === id)
    const oldText = String(oldItem?.text || "")
    const nextItems = items.map(item =>
      item.id === id ? { ...item, text } : item
    )
    setItems(nextItems)

    // Sync correctOrder strings if the text changes
    if (correctOrder?.includes(oldText)) {
      setCorrectOrder(correctOrder.map(t => t === oldText ? text : t))
    }
  }

  const handleAddItem = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1
    const nextItems = [...items, { id: newId, text: "" }]
    setItems(nextItems)
  }

  const handleRemoveItem = (id: number) => {
    const nextItems = items.filter(item => item.id !== id)
    setItems(nextItems)
    setCorrectOrder([]) // Clear sequence to avoid mismatch
  }

  const handleGenerateInstructions = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!instructions?.trim()) {
      alert('Please type a topic or draft instruction first.');
      return;
    }

    setIsGeneratingInstructions(true);

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as an Assessment Design Specialist. Your task is to write clear instructions for a Reordering/Sequence question.

INPUT TOPIC/DRAFT: "${instructions}"
SUBJECT: "${subject}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. Create a clear, concise instruction telling the student what to order and how (e.g., "chronological order", "smallest to largest").
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

  const handleGenerateItems = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!instructions?.trim()) {
      alert('Please provide instructions first so I know what to generate items for.');
      return;
    }

    setIsGeneratingItems(true);

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as an Assessment Design Specialist. Your task is to generate data for a Reordering/Sequence question.

INSTRUCTIONS: "${instructions}"
SUBJECT: "${subject}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. Generate 4-6 items that need to be ordered according to the instructions.
2. Return a "pool" array where items are in a RANDOM, scrambled order.
3. Return a "correctOrder" array where items are in the TRUE, correct logical sequence.
4. Ensure the items are factually correct and distinguishable.
5. Items in both arrays must match exactly in text.

OUTPUT FORMAT:
{
  "pool": ["Item C", "Item A", "Item D", "Item B"],
  "correctOrder": ["Item A", "Item B", "Item C", "Item D"]
}`
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.pool && Array.isArray(parsed.pool) && parsed.correctOrder) {
              setItems(parsed.pool.map((text: string, index: number) => ({
                id: Date.now() + index,
                text
              })));
              setCorrectOrder(parsed.correctOrder);
            }
          }
        } catch (e) {
          console.error('JSON parsing error:', e);
        }
      }
    } catch (error) {
      console.error("Item Generation Error:", error);
    } finally {
      setIsGeneratingItems(false);
    }
  };

  const handleGenerateExplanation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!instructions?.trim()) {
      alert('Please provide instructions first.');
      return;
    }

    if (items.length < 2) {
      alert('Please add at least 2 items first.');
      return;
    }

    setIsGeneratingExplanation(true);

    try {
      const itemsText = items.map(i => i.text).join(', ');

      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as a Subject Matter Expert in ${subject}. Your task is to explain the correct order for a sequence question.

INSTRUCTIONS: "${instructions}"
ITEMS TO ORDER: "${itemsText}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. First, clearly state the CORRECT ORDER of the items.
2. Then, explain WHY this is the correct order.
3. Keep the language simple, direct, and educational.
4. Output format must be strictly the raw explanation text.

GOAL: Helpful, clear, and concise explanation starting with the correct order.`
        })
      });

      const data = await response.json();
      if (data.success && data.response) {
        setExplanation(data.response.trim());
      }
    } catch (error) {
      console.error("Explanation Generation Error:", error);
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  const handleNumberClick = (itemText: string) => {
    if ((correctOrder || []).includes(itemText)) return
    setCorrectOrder([...(correctOrder || []), itemText])
  }

  const clearSequence = () => {
    setCorrectOrder([])
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="orderingInstructions" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instructions</Label>
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
          <Textarea
            id="orderingInstructions"
            placeholder="e.g. Order by date..."
            className="min-h-[60px] text-sm resize-none border-slate-200 focus:ring-indigo-500 font-google"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={isGeneratingInstructions}
          />
          {isGeneratingInstructions && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded z-10">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Item Pool - SINGLE COLUMN */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Pool</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={handleGenerateItems}
              disabled={isGeneratingItems}
            >
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              FILL ALL
            </Button>
          </div>
          <div className="space-y-2 relative">
            <div className="space-y-1.5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-1 bg-white rounded-lg border border-slate-100 hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="w-5 h-5 bg-slate-50 rounded text-[10px] font-bold flex items-center justify-center text-slate-400">
                      {index + 1}
                    </div>
                    <Input
                      placeholder={`Define item...`}
                      value={item.text}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      className="flex-1 h-8 text-[13px] border-none bg-transparent focus-visible:ring-0 px-1 font-google"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-6 w-6 text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full h-8 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border-dashed border border-slate-200 mt-1"
              onClick={handleAddItem}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Item
            </Button>
            {isGeneratingItems && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded z-10">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer Sequence Section - CLICK MODE */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <Label className="text-xs font-black text-slate-900 uppercase tracking-widest font-google">Set Answer Sequence</Label>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter opacity-70">Click numbers in correct order</span>
            </div>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={clearSequence}
            className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest no-underline h-auto p-0"
          >
            Clear All
          </Button>
        </div>

        <div className="flex flex-col gap-6 p-8 bg-slate-50/50 rounded-3xl border-2 border-slate-100 border-dashed">
          {/* Numbers to click */}
          <div className="flex flex-wrap gap-3 justify-center">
            {items.map((item, idx) => {
              const text = String(item?.text || "")
              const isSelected = (correctOrder || []).includes(text)
              const hasText = text.trim().length > 0
              return (
                <button
                  key={item.id}
                  onClick={() => hasText && handleNumberClick(text)}
                  disabled={isSelected || !hasText}
                  className={`
                    w-12 h-12 rounded-xl text-lg font-black transition-all flex items-center justify-center shadow-sm
                    ${isSelected || !hasText
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed scale-90'
                      : 'bg-white text-slate-600 hover:bg-indigo-600 hover:text-white hover:scale-110 active:scale-95 border border-slate-200'
                    }
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="h-[2px] w-12 bg-slate-200 mx-auto opacity-50"></div>

          {/* Current Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-center min-h-[60px]">
            {(correctOrder || []).length === 0 ? (
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic opacity-60">Sequence will appear here...</p>
            ) : (
              (correctOrder || []).map((text, idx) => {
                const originalIdx = items.findIndex(i => String(i.text || "") === text) + 1
                return (
                  <div key={idx} className="flex items-center gap-3 animate-in fade-in h-12">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 bg-white rounded-2xl border-2 border-indigo-500 shadow-lg flex items-center justify-center">
                        <span className="text-xl font-black text-indigo-600">{originalIdx}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter max-w-[60px] truncate">{text}</span>
                    </div>
                    {idx < (correctOrder || []).length - 1 && (
                      <ArrowRight className="h-3 w-3 text-slate-300 mt-[-20px]" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="explanation" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reasoning</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={handleGenerateExplanation}
            disabled={isGeneratingExplanation}
          >
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            EXPLAIN
          </Button>
        </div>
        <Textarea
          id="explanation"
          placeholder="How to solve..."
          className="min-h-[60px] text-xs border-slate-200 focus:ring-indigo-500 font-google"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          disabled={isGeneratingExplanation}
        />
      </div>

      {/* Compact Settings */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level</Label>
          <Select value={currentDifficulty} onValueChange={setCurrentDifficulty}>
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
