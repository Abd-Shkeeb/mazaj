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
      {/* 1. Header Banner displaying dynamic count with Gradient glow */}
      <div className="bg-gradient-to-br from-[#3E2723]/5 via-[#3E2723]/2 to-[#FAF8F5] p-6 rounded-3xl border border-[#3E2723]/10 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-[#3E2723] to-[#20110F] text-[#FAF8F5] rounded-2xl border border-[#3E2723]/20 shadow-md">
            <Users className="h-6 w-6" />
          </div>
          <div className="text-right rtl:text-right ltr:text-left space-y-1">
            <h3 className="text-base font-black text-[#3E2723] tracking-wide">
              {isAr ? 'إدارة الموظفين والوصول المباشر' : 'Staff & Cashier Management'}
            </h3>
            <p className="text-xs text-gray-500 font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
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
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-white transition-all cursor-pointer shadow-lg active:scale-95 duration-200 ${
            users.length >= limits.maxUsers
              ? 'bg-gray-400 cursor-not-allowed opacity-50 shadow-none'
              : 'bg-gradient-to-r from-[#3E2723] to-[#251311] hover:shadow-[0_8px_20px_rgba(62,39,35,0.25)] hover:-translate-y-0.5'
          }`}
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>{isAr ? 'إضافة موظف جديد' : 'Add New Staff'}</span>
        </button>
      </div>

      {/* 2. Custom Warning / Limit Banner if reached limit */}
      {users.length >= limits.maxUsers && (
        <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-600/20 text-[#5D4037] p-5 rounded-3xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="text-xs font-extrabold text-right rtl:text-right ltr:text-left space-y-1">
            <p className="font-black text-sm text-[#3E2723]">
              {isAr ? 'تم بلوغ الحد الأقصى لباقة المقهى الحالية' : 'Staff Limit Reached'}
            </p>
            <p className="text-gray-500 leading-relaxed max-w-2xl font-bold">
              {isAr 
                ? `تسمح باقتك الحالية (${limits.maxUsers} موظفين) بإضافة هذا العدد من الموظفين فقط. لتشغيل حساب كاشير إضافي أو مدير فرع آخر، يرجى الترقية إلى الباقة الأعلى.` 
                : `Your current plan allows up to ${limits.maxUsers} staff accounts. To enable access for additional staff, please upgrade your subscription.`}
            </p>
          </div>
        </div>
      )}

      {/* 3. Cards Grid view for a highly premium layout */}
      {loading ? (
        <div className="text-center py-20 text-xs font-black text-[#3E2723]/60 flex flex-col items-center justify-center gap-3">
          <span className="w-6 h-6 border-2 border-[#3E2723] border-t-transparent rounded-full animate-spin" />
          <span>{isAr ? 'جاري تحميل الموظفين...' : 'Loading staff list...'}</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-16 text-center text-gray-500 space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-[#3E2723]/5 rounded-full flex items-center justify-center text-[#3E2723] border border-[#3E2723]/10 mx-auto">
            <Users className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-black text-[#2D2D2D]">{isAr ? 'لا يوجد موظفون مضافون' : 'No Staff Registered'}</p>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              {isAr 
                ? 'لم تقم بإضافة أي حسابات للموظفين حتى الآن. سيتمكن الكاشير أو المسؤول الفرعي من الدخول للوحة التحكم عند تسجيل حسابه هنا.'
                : 'Configure dedicated accounts for your baristas, cashiers, or managers to access the dashboard.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div 
              key={u.id}
              className="bg-white p-6 rounded-3xl border border-[#3E2723]/10 shadow-sm hover:shadow-[0_8px_25px_rgba(62,39,35,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
            >
              {/* Decorative Subtle glow on hover */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white flex items-center justify-center font-black text-sm shadow-md">
                    {u.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <h4 className="font-black text-sm text-[#2D2D2D] leading-tight">
                      {u.name}
                    </h4>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100/60 px-2 py-0.5 rounded-full inline-block mt-1">
                      {isAr ? 'كاشير / موظف' : 'Staff Member'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4 text-xs font-bold text-gray-500 text-right rtl:text-right ltr:text-left">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px]">
                    <Clock className="h-3.5 w-3.5 text-gray-300" />
                    <span>
                      {isAr ? 'تم الإنشاء: ' : 'Added: '}
                      {new Date(u.createdAt).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-50 flex justify-end">
                <button
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] border border-[#3E2723]/15 w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="bg-gradient-to-br from-[#3E2723] to-[#20110F] p-6 text-[#FAF8F5] relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-black text-right rtl:text-right ltr:text-left">
                  {isAr ? 'إضافة موظف جديد للمقهى' : 'Register New Staff'}
                </h3>
              </div>
              <p className="text-[10px] text-white/60 font-semibold mt-1.5 leading-relaxed text-right rtl:text-right ltr:text-left">
                {isAr 
                  ? 'سيتم توليد حساب مخصص للموظف يخوله من إدارة شاشات الكشك وتحضير الطلبات بسلاسة.' 
                  : 'Specify account credentials to allow cashier access to live screens and orders.'}
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-right rtl:text-right ltr:text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider block">
                  {isAr ? 'الاسم الكامل للموظف' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد الدليمي' : 'e.g. Alex Johnson'}
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] focus:border-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider block">
                  {isAr ? 'البريد الإلكتروني للدخول' : 'Login Email'} *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="staff@mazaj.com"
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] focus:border-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#3E2723] uppercase tracking-wider block">
                  {isAr ? 'كلمة المرور الحساب' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3E2723] focus:border-[#3E2723] bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 py-3 bg-[#3E2723] hover:bg-[#20110F] hover:shadow-lg disabled:bg-gray-300 text-white font-black rounded-2xl text-xs cursor-pointer shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 duration-200"
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
