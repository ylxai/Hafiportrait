/**
 * Auth Debug Endpoint
 * GET /api/auth/debug
 * Menampilkan info cookie dan meta request untuk diagnosa login/session.
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { corsResponse, corsErrorResponse, handleOptions } from '@/lib/cors'
import { validateSession } from '@/lib/auth'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined
  return handleOptions(origin)
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || request.headers.get('referer') || undefined

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('admin_session')?.value || ''
    const host = request.headers.get('host') || ''
    const xfProto = request.headers.get('x-forwarded-proto') || ''
    const userAgent = request.headers.get('user-agent') || ''

    let validation: any = null
    let valid = false
    if (sessionId) {
      try {
        const user = await validateSession(sessionId)
        valid = !!user
        validation = user
          ? { id: user.id, username: user.username, role: user.role }
          : null
      } catch (e: any) {
        validation = { error: e?.message || 'validation-error' }
      }
    }

    const data = {
      success: true,
      meta: {
        host,
        requestUrl: request.url,
        origin,
        xForwardedProto: xfProto,
        userAgent,
        timestamp: new Date().toISOString(),
      },
      cookie: {
        hasAdminSession: !!sessionId,
        sessionPreview: sessionId ? sessionId.slice(0, 12) + '…' : '',
      },
      session: {
        valid,
        user: validation,
      },
    }

    return corsResponse(data, 200, origin)
  } catch (error) {
    return corsErrorResponse('debug-endpoint-error', 500, origin)
  }
}
