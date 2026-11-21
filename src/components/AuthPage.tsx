import React, { useState } from 'react';
import {
  User,
  Lock,
  Phone,
  Building2,
  UserCheck,
  Eye,
  EyeOff,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DIRECT_SUPERVISORS } from '../types';

type Language = 'en' | 'zh';
type AuthMode = 'signin' | 'signup';

const DEPARTMENTS = [
  { value: 'TCE', labelEn: 'Tai Chong Enterprise (TCE)', labelZh: '泰崇企业总部 (TCE)' },
  { value: 'Manufacturing', labelEn: 'Manufacturing & Stamping', labelZh: '生产与冲压部' },
  { value: 'QA', labelEn: 'Quality Assurance (QA/QC)', labelZh: '品质管理部' },
  { value: 'Tooling', labelEn: 'Tooling & Maintenance', labelZh: '模具与工务维护部' },
  { value: 'Warehouse', labelEn: 'Warehouse & Logistics', labelZh: '仓储与供应链物流部' },
];

interface AuthPageProps {
  onLoginSuccess?: (userData: { identifier: string; name: string }) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<AuthMode>('signin');

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    identifier: 'TC-8821',
    password: '••••••••',
    rememberMe: true,
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    fullName: 'Connie Cho',
    mobileNo: '+60 12-345 6789',
    password: '',
    confirmPassword: '',
    department: 'Manufacturing',
    supervisor: 'CCCho',
  });

  // Bilingual Dictionary
  const t = {
    en: {
      portalTitle: 'Tai Chong Enterprise Leave Portal',
      portalSubtitle: 'Enterprise Multi-PIC Workforce & Absence Management',
      signInTab: 'Sign In',
      signUpTab: 'Register Account',
      signInTitle: 'Welcome Back',
      signInDesc: 'Please authenticate with your employee credentials.',
      signUpTitle: 'Create Staff Account',
      signUpDesc: 'Register your workforce profile to access leave workflows.',
      identifierLabel: 'Employee ID or Email',
      identifierPlaceholder: 'e.g., TC-1042 or user@taichong.com',
      fullNameLabel: 'Full Name',
      fullNamePlaceholder: 'Enter legal full name',
      mobileLabel: 'Mobile Number',
      mobilePlaceholder: 'e.g., +60 12-345 6789',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter password',
      deptLabel: 'Department',
      supervisorLabel: 'Direct Supervisor (Tier 1 Approver)',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      btnSignIn: 'Sign In to Portal',
      btnSignUp: 'Complete Registration',
      processing: 'Authenticating...',
      creating: 'Creating Account...',
      noAccountPrompt: "Don't have an account?",
      hasAccountPrompt: 'Already have an account?',
      switchSignUp: 'Register now',
      switchSignIn: 'Sign in here',
      errFillFields: 'Please fill in all required fields.',
      errPasswordMismatch: 'Passwords do not match.',
      errPasswordLength: 'Password must be at least 6 characters.',
      successSignIn: 'Login successful! Redirecting to dashboard...',
      successSignUp: 'Account successfully registered! You can now sign in.',
    },
    zh: {
      portalTitle: '泰崇员工假勤管理系统',
      portalSubtitle: '企业级多级签核 (Multi-PIC) 人力与假期管理平台',
      signInTab: '登录系统',
      signUpTab: '注册新账号',
      signInTitle: '欢迎回来',
      signInDesc: '请输入员工工号或邮箱进行身份验证。',
      signUpTitle: '新员工账号注册',
      signUpDesc: '登记您的员工档案以开通请假签核通道。',
      identifierLabel: '员工工号或邮箱',
      identifierPlaceholder: '例如：TC-1042 或 user@taichong.com',
      fullNameLabel: '员工全名',
      fullNamePlaceholder: '请输入身份证/护照全名',
      mobileLabel: '手机号码',
      mobilePlaceholder: '例如：+60 12-345 6789',
      passwordLabel: '登录密码',
      passwordPlaceholder: '请输入密码',
      confirmPasswordLabel: '确认密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      deptLabel: '所属部门',
      supervisorLabel: '直属主管 (第一级签核负责人)',
      rememberMe: '记住我',
      forgotPassword: '忘记密码？',
      btnSignIn: '登 录',
      btnSignUp: '立即注册',
      processing: '正在验证身份...',
      creating: '正在创建账号...',
      noAccountPrompt: '尚未拥有系统账号？',
      hasAccountPrompt: '已经拥有员工账号？',
      switchSignUp: '立即注册',
      switchSignIn: '点此登录',
      errFillFields: '请完整填写所有必填字段。',
      errPasswordMismatch: '两次输入的密码不一致。',
      errPasswordLength: '密码长度至少需包含 6 位字符。',
      successSignIn: '登录成功！正在跳转至工作台...',
      successSignUp: '账号注册成功！现在可以直接登录。',
    },
  }[lang];

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setFeedback(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!signInData.identifier.trim() || !signInData.password.trim()) {
      setFeedback({ type: 'error', message: t.errFillFields });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setFeedback({ type: 'success', message: t.successSignIn });
      if (onLoginSuccess) {
        onLoginSuccess({ identifier: signInData.identifier, name: signUpData.fullName });
      }
    }, 1200);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (
      !signUpData.fullName.trim() ||
      !signUpData.mobileNo.trim() ||
      !signUpData.password.trim() ||
      !signUpData.confirmPassword.trim()
    ) {
      setFeedback({ type: 'error', message: t.errFillFields });
      return;
    }

    if (signUpData.password.length < 6) {
      setFeedback({ type: 'error', message: t.errPasswordLength });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setFeedback({ type: 'error', message: t.errPasswordMismatch });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setFeedback({ type: 'success', message: t.successSignUp });
      setTimeout(() => {
        setMode('signin');
        setSignInData((prev) => ({
          ...prev,
          identifier: signUpData.fullName,
          password: '',
        }));
      }, 1500);
    }, 1400);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">{t.portalTitle}</h1>
            <p className="text-[11px] text-slate-400">{t.portalSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>{lang === 'zh' ? 'English (EN)' : '简体中文 (ZH)'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-900 to-slate-950 pointer-events-none"></div>

        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleModeSwitch('signin')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'signin' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.signInTab}
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.signUpTab}
            </button>
          </div>

          {/* Header Description */}
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              {mode === 'signin' ? t.signInTitle : t.signUpTitle}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'signin' ? t.signInDesc : t.signUpDesc}
            </p>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Forms */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.identifierLabel}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={signInData.identifier}
                    onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                    placeholder={t.identifierPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={signInData.rememberMe}
                    onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                  />
                  <span>{t.rememberMe}</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(lang === 'zh' ? '请联系人资部重置密码：hr@taichong.com' : 'Please contact HR to reset password.');
                  }}
                  className="text-teal-400 hover:underline"
                >
                  {t.forgotPassword}
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center space-x-2 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.processing}</span>
                  </>
                ) : (
                  <>
                    <span>{t.btnSignIn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.fullNameLabel}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.mobileLabel}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={signUpData.mobileNo}
                    onChange={(e) => setSignUpData({ ...signUpData, mobileNo: e.target.value })}
                    placeholder={t.mobilePlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.deptLabel}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <select
                      value={signUpData.department}
                      onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer appearance-none"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value} className="bg-slate-900">
                          {lang === 'zh' ? dept.labelZh : dept.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.supervisorLabel}</label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <select
                      value={signUpData.supervisor}
                      onChange={(e) => setSignUpData({ ...signUpData, supervisor: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-teal-400 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer appearance-none"
                    >
                      {DIRECT_SUPERVISORS.map((sup) => (
                        <option key={sup.value} value={sup.value} className="bg-slate-900 text-slate-200">
                          {sup.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder={t.passwordPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t.confirmPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center space-x-2 text-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.creating}</span>
                  </>
                ) : (
                  <>
                    <span>{t.btnSignUp}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch Mode Prompt */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-center space-x-1">
            <span>{mode === 'signin' ? t.noAccountPrompt : t.hasAccountPrompt}</span>
            <button
              type="button"
              onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
              className="text-teal-400 font-semibold hover:underline"
            >
              {mode === 'signin' ? t.switchSignUp : t.switchSignIn}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-900/50">
        © 2026 Tai Chong Enterprise Leave Portal • Enterprise Multi-PIC Routing Engine
      </footer>
    </div>
  );
}
