'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Users,
  PlusCircle,
  Trash2,
  X,
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User,
} from 'lucide-react'
import { listUsersAction, createUserAction, deleteUserAction } from '@/app/actions/userManagement'

interface StaffUser {
  id: string
  name: string
  email: string
  createdAt: Date | string
}

interface UsersTabProps {
  isAr: boolean
  cafeId: string
  limits: {
    maxDrinks: number
    maxUsers: number
    hasMoodAnalytics: boolean
    hasSalesReports: boolean
    hasBetaAnalytics: boolean
    hasFunnelAnalytics: boolean
    hasMultiBranch: boolean
  }
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

export default function UsersTab({
  isAr,
  cafeId,
  limits,
  addToast,
}: UsersTabProps) {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await listUsersAction()
      setUsers(data as StaffUser[])
    } catch (err: any) {
      console.error(err)
      addToast(isAr ? 'فشل تحميل قائمة الموظفين' : 'Failed to load staff list', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (users.length >= limits.maxUsers) {
      addToast(
        isAr 
          ? `لقد وصلت للحد الأقصى للموظفين المسموح به في باقتك الحالية (${limits.maxUsers})` 
          : `You have reached the maximum staff limit for your plan (${limits.maxUsers})`, 
        'error'
      )
      return
    }

    startTransition(async () => {
      try {
        await createUserAction({
          name,
          email,
          password,
        })
        addToast(isAr ? 'تم إضافة الموظف بنجاح' : 'Staff user added successfully', 'success')
        setShowAddModal(false)
        setName('')
        setEmail('')
        setPassword('')
        fetchUsers()
      } catch (err: any) {
        addToast(err?.message || (isAr ? 'فشل إضافة الموظف' : 'Failed to add staff user'), 'error')
      }
    })
  }

  const handleDeleteUser = async (id: string, userName: string) => {
    const confirmMsg = isAr 
      ? `هل أنت متأكد من حذف الحساب للموظف "${userName}"؟`
      : `Are you sure you want to delete staff account "${userName}"?`
    if (!window.confirm(confirmMsg)) return

    try {
      await deleteUserAction(id)
      addToast(isAr ? 'تم حذف الحساب بنجاح' : 'Staff account deleted successfully', 'success')
      fetchUsers()
    } catch (err: any) {
      addToast(err?.message || (isAr ? 'فشل حذف الحساب' : 'Failed to delete staff account'), 'error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header display */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#3E2723]/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#3E2723]/5 text-[#3E2723] rounded-xl border border-[#3E2723]/10">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <h3 className="text-sm font-black text-[#2D2D2D]">
              {isAr ? 'إدارة الموظفين والوصول' : 'Staff & Access Management'}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold">
              {isAr 
                ? `المستخدمون النشطون: ${users.length} / ${limits.maxUsers === 999999 ? 'غير محدود' : limits.maxUsers}`
                : `Active Users: ${users.length} / ${limits.maxUsers === 999999 ? 'Unlimited' : limits.maxUsers}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (users.length >= limits.maxUsers) {
              addToast(
                isAr 
                  ? `ترقية الباقة مطلوبة لإضافة موظف آخر (الحد الأقصى الحالي: ${limits.maxUsers})` 
                  : `Upgrade required to add more staff (Current limit: ${limits.maxUsers})`, 
                'info'
              )
              return
            }
            setShowAddModal(true)
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-white transition-all cursor-pointer shadow-md active:scale-95 ${
            users.length >= limits.maxUsers
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-[#3E2723] hover:bg-[#2C1916]'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>{isAr ? 'إضافة موظف جديد' : 'Add New Staff'}</span>
        </button>
      </div>

      {/* Warning/Limit Banner if reached */}
      {users.length >= limits.maxUsers && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs font-semibold text-right rtl:text-right ltr:text-left">
            <p className="font-bold">
              {isAr ? 'تم الوصول للحد الأقصى للمستخدمين المتاح لبقتك' : 'Staff limit reached for your plan'}
            </p>
            <p className="text-gray-600 text-[10px] mt-0.5">
              {isAr 
                ? 'إذا كنت تريد إضافة موظفين إضافيين أو كاشير آخرين للعمل معك على لوحة التحكم، يرجى ترقية الاشتراك إلى باقة أعلى.' 
                : 'To add additional staff or cashiers to access the dashboard, please upgrade your subscription plan.'}
            </p>
          </div>
        </div>
      )}

      {/* Users List Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-[#3E2723]/60">
          {isAr ? 'جاري تحميل الموظفين...' : 'Loading staff list...'}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-500 space-y-2">
          <p className="text-xs font-bold">{isAr ? 'لا يوجد أي موظف مسجل حالياً' : 'No staff users registered yet'}</p>
          <p className="text-[10px] text-gray-400">
            {isAr 
              ? 'استخدم زر "إضافة موظف جديد" لتوليد حساب دخول إضافي للكاشير أو مشرف الفرع.'
              : 'Click "Add New Staff" to create secondary login credentials for cashiers or branch managers.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#3E2723]/10 overflow-hidden shadow-sm">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">{isAr ? 'الاسم' : 'Name'}</th>
                <th className="p-4">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</th>
                <th className="p-4">{isAr ? 'تاريخ الإضافة' : 'Date Added'}</th>
                <th className="p-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#3E2723]/5 text-[#3E2723] flex items-center justify-center font-black">
                      {u.name.substring(0, 1).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-500">{u.email}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                      title={isAr ? 'حذف الحساب' : 'Delete Account'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Staff Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#3E2723]/15 w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="bg-gradient-to-br from-[#3E2723] to-[#251311] p-6 text-white relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <h3 className="text-base font-black text-right rtl:text-right ltr:text-left">
                {isAr ? 'إضافة موظف جديد' : 'Add New Staff User'}
              </h3>
              <p className="text-[10px] text-white/60 font-semibold mt-1 text-right rtl:text-right ltr:text-left">
                {isAr 
                  ? 'سيتم منح هذا الموظف حساب دخول وصلاحية للتحكم بالطلبات وقائمة المشروبات.' 
                  : 'This staff member will get credentials to manage orders and menu drinks.'}
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider block">
                  {isAr ? 'الاسم الكامل' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: محمد علي' : 'e.g. John Doe'}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[#3E2723]/15 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider block">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@cafe.com"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[#3E2723]/15 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#2D2D2D] uppercase tracking-wider block">
                  {isAr ? 'كلمة المرور' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[#3E2723]/15 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3 bg-[#3E2723] hover:bg-[#2C1916] disabled:bg-gray-300 text-white font-black rounded-xl text-xs cursor-pointer shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>{isAr ? 'إنشاء حساب الموظف' : 'Create Staff Account'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
