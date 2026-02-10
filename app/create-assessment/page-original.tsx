"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Settings, 
  Save, 
  Eye, 
  Trash2, 
  FileText,
  Grid,
  ArrowUpDown,
  ImageIcon,
  Clock,
  Target,
  Lightbulb,
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react"

export default function CreateAssessmentPage() {
  const [assessmentType, setAssessmentType] = useState("mcq")
  const [assessmentMode, setAssessmentMode] = useState("summative")
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(30)
  const [difficulty, setDifficulty] = useState("medium")
  const [passingScore, setPassingScore] = useState(70)
  const [allowRetakes, setAllowRetakes] = useState(true)
  const [maxRetakes, setMaxRetakes] = useState(3)
  const [showFeedback, setShowFeedback] = useState(true)
  const [randomizeQuestions, setRandomizeQuestions] = useState(true)
  const [learningObjective, setLearningObjective] = useState("")
  const [bloomLevel, setBloomLevel] = useState("analyze")
  const [activeTab, setActiveTab] = useState("general")

  // General details state
  const [assessmentTitle, setAssessmentTitle] = useState("")
  const [assessmentDescription, setAssessmentDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [duration, setDuration] = useState(30)
  const [instructions, setInstructions] = useState("")

  const questionTypes = [
    { id: "mcq", name: "Multiple Choice", icon: <Grid className="h-4 w-4" /> },
    { id: "ordering", name: "Ordering", icon: <ArrowUpDown className="h-4 w-4" /> },
    { id: "hotspot", name: "Hotspot", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "mix", name: "Mix", icon: <FileText className="h-4 w-4" /> },
  ]

  const bloomLevels = [
    { value: "remember", label: "Remember" },
    { value: "understand", label: "Understand" },
    { value: "apply", label: "Apply" },
    { value: "analyze", label: "Analyze" },
    { value: "evaluate", label: "Evaluate" },
    { value: "create", label: "Create" },
  ]

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ]

  const subjects = [
    "Mathematics", "Science", "English", "History", "Geography", 
    "Computer Science", "Physics", "Chemistry", "Biology", "Other"
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Side - Question Paper Structure */}
        <div className="w-1/2 border-r bg-muted/30 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="p-8">
                {/* Question Paper Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">
                    {assessmentTitle || "Assessment Title"}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
                    <Badge variant="outline" className="rounded-xl">
                      {assessmentMode === "formative" ? "Formative" : "Summative"}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {questionCount} questions
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="rounded-xl">
                      {questionTypes.find(type => type.id === assessmentType)?.name || "Assessment Type"}
                    </Badge>
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground">
                    {instructions || "Instructions for test takers will appear here..."}
                  </p>
                </div>

                {/* Questions Preview Area */}
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <div className="border-2 border-dashed rounded-lg p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium">Add Question</p>
                        <p className="text-xs text-muted-foreground">Click to add your first question</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Question Button */}
            <Button 
              className="w-full rounded-2xl h-12"
              onClick={() => setActiveTab("questions")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </motion.div>
        </div>

        {/* Right Side - Tabbed Interface */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Assessment Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">These details will be visible to test takers</span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessmentTitle">Assessment Title *</Label>
                        <Input
                          id="assessmentTitle"
                          placeholder="Enter assessment title..."
                          value={assessmentTitle}
                          onChange={(e) => setAssessmentTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assessmentDescription">Description</Label>
                        <Textarea
                          id="assessmentDescription"
                          placeholder="Provide a brief description of this assessment..."
                          value={assessmentDescription}
                          onChange={(e) => setAssessmentDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select subject..." />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subj) => (
                              <SelectItem key={subj} value={subj}>
                                {subj}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes) *</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="180"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions</Label>
                        <Textarea
                          id="instructions"
                          placeholder="Enter instructions for test takers..."
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Assessment Type - Moved Here */}
                      <div className="space-y-2">
                        <Label>Assessment Type</Label>
                        <RadioGroup value={assessmentType} onValueChange={setAssessmentType}>
                          <div className="grid grid-cols-2 gap-4">
                            {questionTypes.map((type) => (
                              <div key={type.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={type.id} id={type.id} />
                                <Label htmlFor={type.id} className="flex items-center gap-2 cursor-pointer">
                                  {type.icon}
                                  <span>{type.name}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Assessment Setup Tools - Without Assessment Type */}
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <h3 className="font-semibold mb-3">Assessment Setup</h3>
                        
                        <div className="space-y-2">
                          <Label>Assessment Mode</Label>
                          <RadioGroup value={assessmentMode} onValueChange={setAssessmentMode}>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="formative" id="formative" />
                                <Label htmlFor="formative" className="cursor-pointer">Formative</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="summative" id="summative" />
                                <Label htmlFor="summative" className="cursor-pointer">Summative</Label>
                              </div>
                            </div>
                          </RadioGroup>
                          {assessmentMode === "formative" && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <HelpCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-800">Formative mode enables real-time feedback and multiple attempts</span>
                            </div>
                          )}
                          {assessmentMode === "summative" && (
                            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                              <Target className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-800">Summative mode requires learning objectives and Bloom's taxonomy</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="questionCount">Number of Questions</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="questionCount"
                                type="number"
                                min="1"
                                max="100"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timeLimit">Time Limit (min)</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="timeLimit"
                                type="number"
                                min="1"
                                max="180"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Difficulty Level</Label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {difficulties.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes) *</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="duration"
                                type="number"
                                min="1"
                                max="180"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>

                        {assessmentMode === "summative" && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="learningObjective">Learning Objective</Label>
                              <Textarea
                                id="learningObjective"
                                placeholder="Enter learning objective for this assessment..."
                                value={learningObjective}
                                onChange={(e) => setLearningObjective(e.target.value)}
                                className="min-h-[80px]"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Bloom's Taxonomy Level</Label>
                              <Select value={bloomLevel} onValueChange={setBloomLevel}>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {bloomLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Combined Additional Settings */}
                      <div className="space-y-2">
                        <Label>Additional Settings</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="showTimer">Show Timer</Label>
                              <p className="text-sm text-muted-foreground">Display countdown timer during assessment</p>
                            </div>
                            <Switch id="showTimer" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="allowNavigation">Allow Navigation</Label>
                              <p className="text-sm text-muted-foreground">Let users navigate between questions</p>
                            </div>
                            <Switch id="allowNavigation" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="showResults">Show Results</Label>
                              <p className="text-sm text-muted-foreground">Display results after completion</p>
                            </div>
                            <Switch id="showResults" defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="passingScore">Passing Score</Label>
                              <p className="text-sm text-muted-foreground">Minimum score to pass assessment</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Slider
                                id="passingScore"
                                min="0"
                                max="100"
                                step="5"
                                value={[passingScore]}
                                onValueChange={(value) => setPassingScore(value[0])}
                                className="w-32"
                              />
                              <span className="text-sm text-muted-foreground w-12">{passingScore}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="allowRetakes">Allow Retakes</Label>
                              <p className="text-sm text-muted-foreground">Let users retake the assessment</p>
                            </div>
                            <Switch
                              id="allowRetakes"
                              checked={allowRetakes}
                              onCheckedChange={setAllowRetakes}
                            />
                          </div>
                          {allowRetakes && (
                            <div className="flex items-center justify-between p-3 border rounded-lg ml-6">
                              <div>
                                <Label htmlFor="maxRetakes">Max Retakes</Label>
                                <p className="text-sm text-muted-foreground">Maximum number of attempts</p>
                              </div>
                              <Input
                                id="maxRetakes"
                                type="number"
                                min="1"
                                max="10"
                                value={maxRetakes}
                                onChange={(e) => setMaxRetakes(parseInt(e.target.value) || 1)}
                                className="w-16"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Label htmlFor="showFeedback">Show Feedback</Label>
                              <p className="text-sm text-muted-foreground">Display feedback to users</p>
                            </div>
                            <Switch
                              id="showFeedback"
                              checked={showFeedback}
                              onCheckedChange={setShowFeedback}
                            />
                          </div>
                          {assessmentMode === "formative" && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <Label htmlFor="randomizeQuestions">Randomize Questions</Label>
                                <p className="text-sm text-muted-foreground">Randomize question order</p>
                              </div>
                              <Switch
                                id="randomizeQuestions"
                                checked={randomizeQuestions}
                                onCheckedChange={setRandomizeQuestions}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="space-y-6 mt-6">
                    <CardDescription>
                      {assessmentType === "mcq" && "Create multiple choice questions with stems and distractors"}
                      {assessmentType === "ordering" && "Create ordering questions with sequence logic"}
                      {assessmentType === "hotspot" && "Create interactive hotspot questions with image zones"}
                    </CardDescription>

                    {/* Question Type Specific Builder */}
                    {assessmentType === "mcq" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="questionStem">Question Stem</Label>
                          <Textarea
                            id="questionStem"
                            placeholder="Enter your question here..."
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          <div className="space-y-2">
                            {["A", "B", "C", "D"].map((option, index) => (
                              <div key={option} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                                  {option}
                                </div>
                                <Input
                                  placeholder={`Option ${option}`}
                                  className="flex-1"
                                />
                                <div className="flex items-center gap-1">
                                  <Button variant="outline" size="icon" className="h-6 w-6">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="h-6 w-6">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select defaultValue="A">
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Option A</SelectItem>
                              <SelectItem value="B">Option B</SelectItem>
                              <SelectItem value="C">Option C</SelectItem>
                              <SelectItem value="D">Option D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {assessmentMode === "formative" && (
                          <div className="space-y-2">
                            <Label htmlFor="feedback">Option-specific Feedback</Label>
                            <Textarea
                              id="feedback"
                              placeholder="Enter feedback for each option..."
                              className="min-h-[80px]"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {assessmentType === "ordering" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderingInstructions">Instructions</Label>
                          <Textarea
                            id="orderingInstructions"
                            placeholder="Arrange the following items in the correct order..."
                            className="min-h-[80px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Items to Order</Label>
                          <div className="space-y-2">
                            {[1, 2, 3, 4].map((item) => (
                              <div key={item} className="flex items-center gap-2 p-3 border rounded-lg">
                                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                                  {item}
                                </div>
                                <Input
                                  placeholder={`Item ${item}`}
                                  className="flex-1"
                                />
                                <div className="flex gap-1">
                                  <Button variant="outline" size="icon" className="h-6 w-6">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="h-6 w-6">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {assessmentType === "hotspot" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hotspotInstructions">Instructions</Label>
                          <Textarea
                            id="hotspotInstructions"
                            placeholder="Click on the correct areas of the image..."
                            className="min-h-[80px]"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Upload Image</Label>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Hotspot Zones</Label>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Upload an image to start creating hotspot zones</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Assistance */}
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          AI Assistance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Generate Question with AI
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Get Writing Suggestions
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Question
            </Button>
            <Button className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
