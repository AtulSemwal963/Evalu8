import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'
import PDFParser from 'pdf2json'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { v4 as uuidv4 } from 'uuid'

const apiKey = process.env.MISTRAL_API_KEY || ''
const client = new Mistral({ apiKey })

export async function POST(request: NextRequest) {
    let tempFilePath = ''

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const customInstructions = formData.get('instructions') as string || ''

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Prepare temp file path
        const fileName = `${uuidv4()}.pdf`
        tempFilePath = path.join(os.tmpdir(), fileName)

        // Convert ArrayBuffer to Buffer and save
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(tempFilePath, fileBuffer)

        // Parse PDF using the user's recommended pdf2json pattern with warning suppression
        const extractText = (): Promise<string> => {
            return new Promise((resolve, reject) => {
                // Temporarily silence noisy library warnings (but keep errors)
                const originalWarn = console.warn
                console.warn = () => { }

                const pdfParser = new (PDFParser as any)(null, 1)

                pdfParser.on('pdfParser_dataError', (errData: any) => {
                    console.warn = originalWarn // Restore logs
                    console.error('PDF Parser Error:', errData.parserError)
                    reject(errData.parserError)
                })

                pdfParser.on('pdfParser_dataReady', () => {
                    console.warn = originalWarn // Restore logs
                    const text = (pdfParser as any).getRawTextContent()
                    resolve(text)
                })

                try {
                    pdfParser.loadPDF(tempFilePath)
                } catch (e) {
                    console.warn = originalWarn // Restore logs
                    reject(e)
                }
            })
        }

        const text = await extractText()

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
        }

        const prompt = `
      You are an expert assessment creator. Based on the following source material, generate a comprehensive set of questions.
      
      SOURCE MATERIAL:
      ${text.substring(0, 8000)}
      
      USER REQUIREMENTS:
      ${customInstructions}
      
      INSTRUCTIONS:
      1. Generate a mix of Multiple Choice (mcq), Reordering (reordering), and Hotspot (hotspot) questions.
      2. Return ONLY a JSON array of question objects.
      
      For 'mcq':
      {
        "id": "random_id",
        "type": "mcq",
        "stem": "The question",
        "options": ["A", "B", "C", "D"],
        "correctAnswers": ["A"],
        "explanation": "Why correct",
        "allowMultipleAnswers": false
      }
      
      For 'reordering':
      {
        "id": "random_id",
        "type": "reordering",
        "instructions": "Ordering task",
        "items": [{"id": 1, "text": "item 1"}, {"id": 2, "text": "item 2"}],
        "correctOrder": ["item 1", "item 2"],
        "explanation": "Explanation"
      }
      
      For 'hotspot':
      {
        "id": "random_id",
        "type": "hotspot",
        "instructions": "Selection task",
        "imageUrl": "https://images.unsplash.com/photo-1454165833767-027ffcb70318?auto=format&fit=crop&q=80&w=1000",
        "zones": [{"id": "z1", "x": 30, "y": 40, "width": 20, "height": 20, "isCorrect": true}],
        "explanation": "Explanation"
      }
    `

        const chatResponse = await client.chat.complete({
            model: 'mistral-small-2506',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
        })

        const responseText = chatResponse.choices?.[0]?.message?.content || '{}'
        let generatedData = JSON.parse(responseText)
        if (generatedData.questions) generatedData = generatedData.questions

        return NextResponse.json({
            success: true,
            questions: Array.isArray(generatedData) ? generatedData : [generatedData]
        })

    } catch (error) {
        console.error('Processing Error:', error)
        return NextResponse.json(
            { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    } finally {
        // Cleanup: Remove temp file
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath)
            } catch (err) {
                console.error('Temp file cleanup error:', err)
            }
        }
    }
}
