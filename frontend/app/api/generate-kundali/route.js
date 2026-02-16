import { NextResponse } from 'next/server';
import { kundaliGenerationService } from '../../../lib/kundaliGenerationService.js';

export async function POST(request) {
  try {
    const { birthData, analysisType = 'complete' } = await request.json();

    // Validate required birth data
    if (!birthData || !birthData.name || !birthData.birthYear || !birthData.birthMonth || 
        !birthData.birthDay || !birthData.birthHour || !birthData.birthMinute || 
        !birthData.latitude || !birthData.longitude || !birthData.timezone || !birthData.city) {
      return NextResponse.json({
        success: false,
        error: 'Missing required birth data fields'
      }, { status: 400 });
    }

    // Generate complete Kundali with AI analysis
    const result = await kundaliGenerationService.generateCompleteKundali(birthData);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    // Return comprehensive Kundali data
    return NextResponse.json({
      success: true,
      message: 'Kundali generated successfully with AI analysis',
      data: result.data,
      analysisType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in generate-kundali API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate Kundali',
      details: error.message
    }, { status: 500 });
  }
}
