import { redirect } from 'next/navigation'
import { getSessionAction } from '@/app/actions/auth'
import { getSuperAdminStats } from '@/app/actions/super-admin'
import SuperAdminDashboard from '../../../components/SuperAdminDashboard'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SuperAdminPage({ params }: Props) {
  const { locale } = await params
  const session = await getSessionAction()

  // Route protection - must be logged in and role must be SUPER_ADMIN
  if (!session || session.role !== 'SUPER_ADMIN') {
    redirect(`/${locale}`)
  }

  // Load initial statistics server-side
  const stats = await getSuperAdminStats()

  return <SuperAdminDashboard initialStats={stats} locale={locale} />
}
