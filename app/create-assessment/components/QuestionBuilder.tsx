"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Save, Sparkles, Lightbulb, Trash2, GripVertical, Image as ImageIcon, Target } from "lucide-react"
import { useAssessmentDetails, useAssessmentActions, useQuestions } from "../store/assessment-store"

export function QuestionBuilder() {
  const assessmentDetails = useAssessmentDetails()
  const { addQuestion } = useAssessmentActions()
  const savedQuestions = useQuestions()
  const [currentQuestionType, setCurrentQuestionType] = useState("mcq")
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([])
  const [orderingItems, setOrderingItems] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
    { id: 3, text: "" },
    { id: 4, text: "" }
  ])
  const [hotspotZones, setHotspotZones] = useState<Array<{id: string, x: number, y: number, width: number, height: number}>>([])
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [questionStem, setQuestionStem] = useState("")
  const [answerOptions, setAnswerOptions] = useState(["", "", "", "", ""])
  const [explanation, setExplanation] = useState("")

  const questionTypes = [
    { id: "mcq", name: "Multiple Choice Question" },
    { id: "reordering", name: "Reordering" },
    { id: "hotspot", name: "Hotspot" },
  ]

  const handleCorrectAnswerChange = (value: string) => {
    if (allowMultipleAnswers) {
      if (correctAnswers.includes(value)) {
        setCorrectAnswers(correctAnswers.filter((answer: string) => answer !== value))
      } else {
        setCorrectAnswers([...correctAnswers, value])
      }
    } else {
      setCorrectAnswers([value])
    }
  }

  const handleOrderingItemChange = (id: number, text: string) => {
    setOrderingItems(items => 
      items.map(item => 
        item.id === id ? { ...item, text } : item
      )
    )
  }

  const handleAddOrderingItem = () => {
    setOrderingItems(items => [...items, { id: Math.max(...items.map(i => i.id)) + 1, text: "" }])
  }

  const handleRemoveOrderingItem = (id: number) => {
    setOrderingItems(items => items.filter(item => item.id !== id))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setOrderingItems(items => {
      const newItems = [...items]
      const [movedItem] = newItems.splice(fromIndex, 1)
      newItems.splice(toIndex, 0, movedItem)
      return newItems
    })
  }

  const handleHotspotZoneAdd = () => {
    const newZone = {
      id: `zone-${Date.now()}`,
      x: 50,
      y: 50,
      width: 80,
      height: 60
    }
    setHotspotZones(zones => [...zones, newZone])
    setSelectedZone(newZone.id)
  }

  const handleHotspotZoneUpdate = (id: string, updates: Partial<{x: number, y: number, width: number, height: number}>) => {
    setHotspotZones(zones => 
      zones.map(zone => 
        zone.id === id ? { ...zone, ...updates } : zone
      )
    )
  }

  const handleHotspotZoneDelete = (id: string) => {
    setHotspotZones(zones => zones.filter(zone => zone.id !== id))
    if (selectedZone === id) {
      setSelectedZone(null)
    }
  }

  const handleSaveQuestion = () => {
    const newQuestion: any = {
      id: Date.now().toString(),
      type: currentQuestionType,
      stem: questionStem,
      timestamp: new Date().toISOString()
    }

    if (currentQuestionType === "mcq") {
      newQuestion.options = answerOptions
      newQuestion.correctAnswers = correctAnswers
      newQuestion.explanation = explanation
      newQuestion.allowMultipleAnswers = allowMultipleAnswers
    } else if (currentQuestionType === "reordering") {
      newQuestion.items = orderingItems
      newQuestion.instructions = "Arrange the following items in the correct order"
    } else if (currentQuestionType === "hotspot") {
      newQuestion.zones = hotspotZones
      newQuestion.instructions = "Click on the correct areas in the image"
    }

    addQuestion(newQuestion)
    
    // Reset form
    setQuestionStem("")
    setAnswerOptions(["", "", "", ""])
    setCorrectAnswers([])
    setExplanation("")
    setOrderingItems([
      { id: 1, text: "" },
      { id: 2, text: "" },
      { id: 3, text: "" },
      { id: 4, text: "" }
    ])
    setHotspotZones([])
    setSelectedZone(null)
  }

  return (
    <div className="space-y-6">
      {/* Question Type Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="questionType">Question Type:</Label>
            <Select value={currentQuestionType} onValueChange={setCurrentQuestionType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CardDescription>
        {currentQuestionType === "mcq" && "Create multiple choice questions with stems and distractors"}
        {currentQuestionType === "reordering" && "Create ordering questions with sequence logic"}
        {currentQuestionType === "hotspot" && "Create interactive hotspot questions with image zones"}
      </CardDescription>

      {/* Question Type Specific Builder */}
      {currentQuestionType === "mcq" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Multiple Choice Question</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Multiple Answers Toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="multipleAnswers">Allow Multiple Correct Answers</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable this for questions with more than one correct answer
                    </p>
                  </div>
                  <input
                    id="multipleAnswers"
                    type="checkbox"
                    checked={allowMultipleAnswers}
                    onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="questionStem">Question Stem</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="questionStem"
                    placeholder="Enter your question here..."
                    className="min-h-[100px]"
                    value={questionStem}
                    onChange={(e) => setQuestionStem(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Answer Options 
                      {allowMultipleAnswers && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (Select all that apply)
                        </span>
                      )}
                    </Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate All
                    </Button>
                  </div>
                  <RadioGroup 
                    value={allowMultipleAnswers ? correctAnswers[0] || "" : correctAnswers[0] || ""}
                    onValueChange={handleCorrectAnswerChange}
                  >
                    <div className="space-y-2">
                      {["a", "b", "c", "d"].map((option, index) => (
                        <div key={option} className="flex items-center gap-2">
                          {allowMultipleAnswers ? (
                            <input
                              type="checkbox"
                              checked={correctAnswers.includes(option)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCorrectAnswers([...correctAnswers, option])
                                } else {
                                  setCorrectAnswers(correctAnswers.filter((a: string) => a !== option))
                                }
                              }}
                              className="w-4 h-4"
                            />
                          ) : (
                            <RadioGroupItem value={option} id={`option-${option}`} />
                          )}
                          <Input 
                            placeholder={`Option ${option.toUpperCase()}`} 
                            className="flex-1"
                            value={answerOptions[index] || ""}
                            onChange={(e) => {
                              const newOptions = [...answerOptions]
                              newOptions[index] = e.target.value
                              setAnswerOptions(newOptions)
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  {allowMultipleAnswers && (
                    <p className="text-sm text-muted-foreground">
                      Selected correct answers: {correctAnswers.join(", ").toUpperCase() || "None"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="explanation">Explanation</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="explanation"
                    placeholder="Explain why the correct answer is right..."
                    className="min-h-[80px]"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input type="number" defaultValue="1" min="1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentQuestionType === "reordering" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reordering Question</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orderingInstructions">Instructions</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generate
                    </Button>
                  </div>
                  <Textarea
                    id="orderingInstructions"
                    placeholder="Enter instructions for ordering (e.g., 'Arrange the following events in chronological order:')"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Items to Order</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 px-2 text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate Items
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="space-y-2">
                      {orderingItems.map((item, index) => (
                        <div 
                          key={item.id}
                          className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-muted/50 transition-colors"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', index.toString())
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                            if (fromIndex !== index) {
                              handleReorder(fromIndex, index)
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <span className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium mr-2">
                              {index + 1}
                            </span>
                            <Input
                              placeholder={`Item ${index + 1}`}
                              value={item.text}
                              onChange={(e) => handleOrderingItemChange(item.id, e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveOrderingItem(item.id)}
                              className="ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={handleAddOrderingItem}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input type="number" defaultValue="1" min="1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentQuestionType === "hotspot" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hotspot Question</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hotspotImage">Upload Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hotspot Zones</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-muted/30 min-h-[300px] relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Upload an image to create hotspot zones</p>
                      </div>
                      {/* This would be replaced with actual image */}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Zone Management</Label>
                        <Button 
                          size="sm"
                          onClick={handleHotspotZoneAdd}
                          className="ml-auto"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Zone
                        </Button>
                      </div>
                      
                      {hotspotZones.map((zone, index) => (
                        <div 
                          key={zone.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedZone === zone.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedZone(zone.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="font-medium">Zone {index + 1}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleHotspotZoneDelete(zone.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <Label>X Position</Label>
                              <Input
                                type="number"
                                value={zone.x}
                                onChange={(e) => handleHotspotZoneUpdate(zone.id, { x: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <Label>Y Position</Label>
                              <Input
                                type="number"
                                value={zone.y}
                                onChange={(e) => handleHotspotZoneUpdate(zone.id, { y: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </div>
                            <div>
                              <Label>Width</Label>
                              <Input
                                type="number"
                                value={zone.width}
                                onChange={(e) => handleHotspotZoneUpdate(zone.id, { width: parseInt(e.target.value) || 50 })}
                                placeholder="50"
                                min="10"
                                max="200"
                              />
                            </div>
                            <div>
                              <Label>Height</Label>
                              <Input
                                type="number"
                                value={zone.height}
                                onChange={(e) => handleHotspotZoneUpdate(zone.id, { height: parseInt(e.target.value) || 50 })}
                                placeholder="50"
                                min="10"
                                max="200"
                              />
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            Position: ({zone.x}, {zone.y}) • Size: {zone.width}×{zone.height}px
                          </div>
                        </div>
                      ))}
                      
                      {hotspotZones.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No zones created yet</p>
                          <p className="text-xs">Click "Add Zone" to create your first hotspot zone</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input type="number" defaultValue="1" min="1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button variant="outline" className="flex-1" onClick={handleSaveQuestion}>
          <Save className="mr-2 h-4 w-4" />
          Save Question
        </Button>
      </div>
    </div>
  )
}
