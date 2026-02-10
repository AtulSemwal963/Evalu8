import { NextRequest, NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'

const apiKey = process.env.MISTRAL_API_KEY || ''
const client = new Mistral({ apiKey })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Mistral API key not configured' },
        { status: 500 }
      )
    }

    const chatResponse = await client.chat.complete({
      model: 'mistral-small-2506',
      messages: [{ role: 'user', content: prompt }],
    })

    const result = {
      response: chatResponse.choices?.[0]?.message?.content || '',
      success: true
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Mistral API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}
