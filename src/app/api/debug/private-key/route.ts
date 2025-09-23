import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json({
        status: "error",
        message: "FIREBASE_PRIVATE_KEY environment variable not found"
      }, { status: 500 });
    }
    
    // Process the private key the same way as admin.ts
    let processedKey = privateKey.replace(/\\n/g, "\n");
    processedKey = processedKey.replace(/^["']|["']$/g, '');
    
    const analysis = {
      originalLength: privateKey.length,
      processedLength: processedKey.length,
      hasBeginMarker: processedKey.includes('-----BEGIN PRIVATE KEY-----'),
      hasEndMarker: processedKey.includes('-----END PRIVATE KEY-----'),
      startsWithQuote: privateKey.startsWith('"') || privateKey.startsWith("'"),
      endsWithQuote: privateKey.endsWith('"') || privateKey.endsWith("'"),
      hasEscapedNewlines: privateKey.includes('\\n'),
      firstLine: processedKey.split('\n')[0],
      lastLine: processedKey.split('\n').pop(),
      lineCount: processedKey.split('\n').length,
      isValidFormat: processedKey.includes('-----BEGIN PRIVATE KEY-----') && 
                     processedKey.includes('-----END PRIVATE KEY-----') &&
                     processedKey.split('\n').length > 3
    };
    
    return NextResponse.json({
      status: "success",
      message: "Private key format analysis",
      analysis,
      recommendation: analysis.isValidFormat ? 
        "Private key format looks correct" : 
        "Private key format needs fixing - ensure it includes BEGIN/END markers and proper line breaks",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Private key analysis failed",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}