import { NextResponse } from 'next/server'
export async function GET() {
  return new Response('Test API is disabled in production.')
}
