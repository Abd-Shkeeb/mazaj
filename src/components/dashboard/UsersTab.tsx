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
  ShieldAlert,
  Clock,
  Sparkles,
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner displaying dynamic count with SaaS flat styling */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-stone-100 text-stone-900 rounded-xl border border-stone-200/60 shadow-sm flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div className="text-right rtl:text-right ltr:text-left space-y-1">
            <h3 className="text-sm font-bold text-stone-900 tracking-wide">
              {isAr ? 'إدارة الموظفين والوصول المباشر' : 'Staff & Cashier Management'}
            </h3>
            <p className="text-xs text-stone-500 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              {isAr 
                ? `الحسابات المفعلة: ${users.length} من أصل ${limits.maxUsers === 999999 ? 'غير محدود' : `${limits.maxUsers} حسابات`}`
                : `Active staff accounts: ${users.length} of ${limits.maxUsers === 999999 ? 'Unlimited' : limits.maxUsers}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (users.length >= limits.maxUsers) {
              addToast(
                isAr 
                  ? `ترقية الباقة مطلوبة لإضافة موظف إضافي (الحد الأقصى المسموح به: ${limits.maxUsers})` 
                  : `Upgrade required to add more staff (Current limit: ${limits.maxUsers})`, 
                'info'
              )
              return
            }
            setShowAddModal(true)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95 duration-200 ${
            users.length >= limits.maxUsers
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300/40 shadow-none'
              : 'bg-stone-900 hover:bg-stone-850 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>{isAr ? 'إضافة موظف جديد' : 'Add New Staff'}</span>
        </button>
      </div>

      {/* 2. Custom Warning / Limit Banner if reached limit */}
      {users.length >= limits.maxUsers && (
        <div className="bg-amber-50/50 border border-amber-200/60 text-amber-900 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="text-xs font-semibold text-right rtl:text-right ltr:text-left space-y-1">
            <p className="font-bold text-sm text-stone-900">
              {isAr ? 'تم بلوغ الحد الأقصى لباقة المقهى الحالية' : 'Staff Limit Reached'}
            </p>
            <p className="text-stone-500 leading-relaxed max-w-2xl font-medium">
              {isAr 
                ? `تسمح باقتك الحالية (${limits.maxUsers} موظفين) بإضافة هذا العدد من الموظفين فقط. لتشغيل حساب كاشير إضافي أو مدير فرع آخر، يرجى الترقية إلى الباقة الأعلى.` 
                : `Your current plan allows up to ${limits.maxUsers} staff accounts. To enable access for additional staff, please upgrade your subscription.`}
            </p>
          </div>
        </div>
      )}

      {/* 3. Cards Grid view for a highly premium layout */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-stone-400 flex flex-col items-center justify-center gap-3">
          <span className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          <span>{isAr ? 'جاري تحميل الموظفين...' : 'Loading staff list...'}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-16 text-center text-stone-500 space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-500 border border-stone-200/60 mx-auto">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-stone-900">{isAr ? 'لا يوجد موظفون مضافون' : 'No Staff Registered'}</p>
            <p className="text-xs text-stone-400 font-semibold leading-relaxed">
              {isAr 
                ? 'لم تقم بإضافة أي حسابات للموظفين حتى الآن. سيتمكن الكاشير أو المسؤول الفرعي من الدخول للوحة التحكم عند تسجيل حسابه هنا.'
                : 'Configure dedicated accounts for your baristas, cashiers, or managers to access the dashboard.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div 
              key={u.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 border border-stone-250/60 flex items-center justify-center font-bold text-sm shadow-sm">
                    {u.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <h4 className="font-bold text-sm text-stone-900 leading-tight">
                      {u.name}
                    </h4>
                    <span className="text-[9px] font-bold text-stone-600 bg-stone-50 border border-stone-200/60 px-2 py-0.5 rounded inline-block mt-1">
                      {isAr ? 'كاشير / موظف' : 'Staff Member'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-500 text-right rtl:text-right ltr:text-left">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400 text-[10px]">
                    <Clock className="h-3.5 w-3.5 text-stone-300" />
                    <span>
                      {isAr ? 'تم الإنشاء: ' : 'Added: '}
                      {new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isAr ? 'حذف الحساب' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Elegant Add New Staff Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-stone-200/80 w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-200/80 relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-50 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <h3 className="text-sm font-bold text-stone-900 text-right rtl:text-right ltr:text-left">
                  {isAr ? 'إضافة موظف جديد للمقهى' : 'Register New Staff'}
                </h3>
              </div>
              <p className="text-[10px] text-stone-400 font-semibold mt-1.5 leading-relaxed text-right rtl:text-right ltr:text-left">
                {isAr 
                  ? 'سيتم توليد حساب مخصص للموظف يخوله من إدارة شاشات الكشك وتحضير الطلبات بسلاسة.' 
                  : 'Specify account credentials to allow cashier access to live screens and orders.'}
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                  {isAr ? 'الاسم الكامل للموظف' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد الدليمي' : 'e.g. Alex Johnson'}
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                  {isAr ? 'البريد الإلكتروني للدخول' : 'Login Email'} *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="staff@mazaj.com"
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                  {isAr ? 'كلمة المرور الحساب' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 bg-transparent text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 py-2.5 bg-stone-900 hover:bg-stone-850 hover:shadow-md disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 duration-200 border border-transparent"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>{isAr ? 'تأكيد وإنشاء الحساب' : 'Create Staff Account'}</span>
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
