"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Sparkles, Trash2, GripVertical, Plus, Loader2 } from "lucide-react"

interface MCQQuestionProps {
  questionStem: string
  setQuestionStem: (value: string) => void
  answerOptions: string[]
  setAnswerOptions: (options: string[]) => void
  correctAnswers: string[]
  setCorrectAnswers: (answers: string[]) => void
  explanation: string
  setExplanation: (value: string) => void
  allowMultipleAnswers: boolean
  setAllowMultipleAnswers: (value: boolean) => void
  distractorFeedback?: Record<string, string>
  setDistractorFeedback?: (feedback: Record<string, string>) => void
  mode?: string
  bloomLevel?: string
  setBloomLevel?: (level: string) => void
  subject?: string
  difficulty?: string
  setDifficulty?: (level: string) => void
}

export function MCQQuestion({
  questionStem,
  setQuestionStem,
  answerOptions,
  setAnswerOptions,
  correctAnswers,
  setCorrectAnswers,
  explanation,
  setExplanation,
  allowMultipleAnswers,
  setAllowMultipleAnswers,
  distractorFeedback = {},
  setDistractorFeedback = () => { },
  mode = "formative",
  bloomLevel = "understand",
  setBloomLevel = () => { },
  subject = "General",
  difficulty: initialDifficulty = "medium",
  setDifficulty = () => { }
}: MCQQuestionProps) {

  const [isGeneratingStem, setIsGeneratingStem] = useState(false)
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false)
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false)
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty)

  // Debugging Hook: Monitors if state is locked
  useEffect(() => {
    console.log("Component Mount/Update - isGeneratingStem:", isGeneratingStem);
  }, [isGeneratingStem]);

  const handleGenerateStem = async (e: React.MouseEvent) => {
    // STOP everything to ensure click is captured
    e.preventDefault();
    e.stopPropagation();

    console.log(">>> CLICK CAPTURED <<<");

    if (!questionStem?.trim()) {
      alert('Please type something first.');
      return;
    }

    setIsGeneratingStem(true);

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as a professional assessment specialist. Your task is to refine a question stem for a multiple-choice question (MCQ).

INPUT STEM: "${questionStem}"
SUBJECT: "${subject}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. Improve the clarity, technical accuracy, and phrasing of the INPUT STEM.
2. Return ONLY the improved question text. 
3. DO NOT include introductory remarks, "Here is your question," headings, option letters (A, B, C, D), correct answers, or explanations.
4. Output format must be strictly a raw string containing only the question stem.

GOAL: Professional, concise, and assessment-ready text.`
        })
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.response) {
        // Simple extraction logic
        const content = data.response;
        const jsonMatch = content.match(/\{"stem":\s*"(.*?)"\}/);
        setQuestionStem(jsonMatch ? jsonMatch[1] : content);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsGeneratingStem(false);
    }
  };

  const handleGenerateAllOptions = async () => {
    if (!questionStem?.trim()) {
      alert('Please type something in question stem first to generate options.');
      return;
    }

    setIsGeneratingOptions(true);

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as an Assessment Design Specialist. Your task is to generate four Multiple Choice Question (MCQ) options and identify the correct one.

QUESTION STEM: "${questionStem}"
SUBJECT: "${subject}"
DIFFICULTY: "${currentDifficulty}"

CURRENT OPTIONS:
Option A: "${answerOptions[0]}"
Option B: "${answerOptions[1]}"
Option C: "${answerOptions[2]}"
Option D: "${answerOptions[3]}"

CRITICAL INSTRUCTIONS:
1. Identify which options are empty or missing.
2. Generate plausible, high-quality distractors for the EMPTY options only. 
3. Maintain consistency with the existing options in terms of length, complexity, and tone.
4. Ensure only ONE option is clearly correct based on the stem.
5. If the correct answer is already provided in the current options, ensure that new options are effective distractors.
6. Explicitly identify the index (0-3) of the correct option.

OUTPUT FORMAT:
You must return ONLY a JSON object with the following structure. Do not include any other text:
{
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctOption": 1,
  "distractorFeedback": {
    "a": "Feedback for option A",
    "b": "Feedback for option B",
    "c": "Feedback for option C",
    "d": "Feedback for option D"
  }
}

Note: For the correctOption, you can leave the feedback empty or omit it in the distractorFeedback object.`
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        try {
          // Use greedy match to capture the entire JSON block including nested objects
          const jsonMatch = data.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let jsonString = jsonMatch[0];

            // Clean up common AI "JSON" mistakes: 
            // 1. Remove single-line comments (if any were copied from the prompt)
            jsonString = jsonString.replace(/\/\/.*$/gm, '');
            // 2. Remove trailing commas before closing braces/brackets
            jsonString = jsonString.replace(/,(\s*[\]\}])/g, '$1');

            const parsed = JSON.parse(jsonString);

            if (parsed.options && Array.isArray(parsed.options)) {
              setAnswerOptions(parsed.options);
            }

            if (typeof parsed.correctOption === 'number' && parsed.correctOption >= 0 && parsed.correctOption <= 3) {
              const letter = ['a', 'b', 'c', 'd'][parsed.correctOption];
              setCorrectAnswers([letter]);
            }

            if (parsed.distractorFeedback) {
              setDistractorFeedback(parsed.distractorFeedback);
            }
          }
        } catch (e) {
          console.error('JSON parsing error:', e);
        }
      } else {
        throw new Error(data.error || 'API Error');
      }
    } catch (error) {
      console.error('Generate All Options Error:', error);
      alert('Failed to generate options.');
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  const handleGenerateExplanation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!questionStem?.trim()) {
      alert('Please provide a question stem first.');
      return;
    }

    if (correctAnswers.length === 0) {
      alert('Please select a correct answer first.');
      return;
    }

    setIsGeneratingExplanation(true);

    try {
      const correctOptionsText = correctAnswers.map(ans => {
        const index = ans.charCodeAt(0) - 97;
        return answerOptions[index] || ans;
      }).join(', ');

      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Act as a Subject Matter Expert in ${subject}. Your task is to explain the correct answer for a Multiple Choice Question (MCQ).

QUESTION STEM: "${questionStem}"
CORRECT ANSWER: "${correctOptionsText}"
DIFFICULTY: "${currentDifficulty}"

CRITICAL INSTRUCTIONS:
1. Explain clearly why the correct answer is the right choice.
2. Keep the language simple, direct, and educational.
3. Do not use phrases like "The correct answer is".
4. Output format must be strictly the raw explanation text.

GOAL: Helpful, clear, and concise explanation.`
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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...answerOptions]
    newOptions[index] = value
    setAnswerOptions(newOptions)
  }

  const handleCorrectAnswerChange = (value: string) => {
    if (allowMultipleAnswers) {
      if (correctAnswers.includes(value)) {
        setCorrectAnswers(correctAnswers.filter(a => a !== value))
      } else {
        setCorrectAnswers([...correctAnswers, value])
      }
    } else {
      setCorrectAnswers([value])
    }
  }

  return (
    <div className="space-y-5">
      {/* Multiple Answers Toggle */}
      <div className="flex items-center justify-between p-2 border border-slate-100 rounded-lg bg-slate-50/50">
        <Label htmlFor="multipleAnswers" className="text-xs font-bold text-slate-700">Multiple Correct Answers</Label>
        <Switch
          id="multipleAnswers"
          checked={allowMultipleAnswers}
          onCheckedChange={(checked: boolean) => setAllowMultipleAnswers(checked)}
          className="scale-75 origin-right"
        />
      </div>

      {/* Question Stem */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="questionStem" className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Stem</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={handleGenerateStem}
            disabled={isGeneratingStem}
          >
            {isGeneratingStem ? (
              <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-2.5 w-2.5 mr-1" />
            )}
            AI MAGIC
          </Button>
        </div>
        <div className="relative">
          <Textarea
            id="questionStem"
            placeholder="What is the capital of..."
            className="min-h-[80px] text-sm resize-none border-slate-200 focus:ring-indigo-500"
            value={questionStem || ""}
            onChange={(e) => setQuestionStem(e.target.value)}
            disabled={isGeneratingStem}
          />
          {isGeneratingStem && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded z-10">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Options</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            onClick={handleGenerateAllOptions}
            disabled={isGeneratingOptions}
          >
            {isGeneratingOptions ? (
              <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-2.5 w-2.5 mr-1" />
            )}
            FILL ALL
          </Button>
        </div>
        <div className="relative space-y-2">
          <RadioGroup
            value={allowMultipleAnswers ? "" : correctAnswers[0] || ""}
            onValueChange={handleCorrectAnswerChange}
            className="space-y-2"
          >
            {["a", "b", "c", "d"].map((option, index) => {
              const isCorrect = correctAnswers.includes(option);
              const isFormativeDistractor = mode === "formative" && !isCorrect;

              return (
                <div key={option} className="space-y-2 group">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-10">
                      {allowMultipleAnswers ? (
                        <input
                          type="checkbox"
                          checked={isCorrect}
                          onChange={() => handleCorrectAnswerChange(option)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      ) : (
                        <RadioGroupItem value={option} id={`option-${option}`} className="w-4 h-4 border-slate-300 text-indigo-600" />
                      )}
                    </div>
                    <Input
                      placeholder={`Option ${option.toUpperCase()}`}
                      className={`flex-1 h-9 text-sm transition-all ${isCorrect ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20' : 'border-slate-200 group-hover:border-slate-300'}`}
                      value={answerOptions[index] || ""}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      disabled={isGeneratingOptions}
                    />
                  </div>

                  {isFormativeDistractor && (
                    <div className="ml-8 pr-0 pl-1 border-l-2 border-orange-100 transition-all focus-within:border-orange-400">
                      <Input
                        placeholder="Why is this distractor incorrect? (Mandatory for Formative)"
                        className={`h-7 text-[10px] font-medium placeholder:text-orange-300 border-none bg-orange-50/30 focus-visible:ring-0 ${!distractorFeedback[option] ? 'bg-orange-100/40 text-rose-500 animate-pulse' : 'text-slate-600'}`}
                        value={distractorFeedback[option] || ""}
                        onChange={(e) => {
                          const newFeedback = { ...distractorFeedback };
                          newFeedback[option] = e.target.value;
                          setDistractorFeedback(newFeedback);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
          {isGeneratingOptions && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded z-10">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-1.5">
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
          placeholder="Why is it correct?"
          className="min-h-[60px] text-xs border-slate-200 focus:ring-indigo-500"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          disabled={isGeneratingExplanation}
        />
      </div>

      {/* Compact Settings */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cognitive Depth</Label>
          <Select value={bloomLevel} onValueChange={setBloomLevel}>
            <SelectTrigger className="h-8 text-[11px] font-medium border-slate-100 bg-slate-50/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remember">Remember</SelectItem>
              <SelectItem value="understand">Understand</SelectItem>
              <SelectItem value="apply">Apply</SelectItem>
              <SelectItem value="analyze">Analyze</SelectItem>
              <SelectItem value="evaluate">Evaluate</SelectItem>
              <SelectItem value="create">Create</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Difficulty</Label>
          <Select value={initialDifficulty} onValueChange={setDifficulty}>
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
