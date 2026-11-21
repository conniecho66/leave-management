import React, { useState } from 'react';
import { Lock, Mail, User, Building, Eye, EyeOff, ShieldCheck, Sparkles, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DIRECT_SUPERVISORS } from '../types';

interface AuthPageProps {
  onLoginSuccess?: (userData: { email: string; name: string; role: string }) => void;
}

type Lang = 'en' | 'zh';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState<Lang>('zh'); // Default bilingual Chinese/English
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('Connie Cho');
  const [employeeId, setEmployeeId] = useState('TC-8821');
  const [department, setDepartment] = useState('Manufacturing & Stamping');
  const [supervisor, setSupervisor] = useState(DIRECT_SUPERVISORS[2].value); // CCCho

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        setSuccessMessage(lang === 'zh' ? '登录成功！正在跳转至假勤工作台...' : 'Login successful! Redirecting to workspace...');
        if (onLoginSuccess) {
          onLoginSuccess({ email: emailOrId || 'connie.cho@company.com', name: fullName, role: 'employee' });
        }
      } else {
        if (password !== confirmPassword) {
          alert(lang === 'zh' ? '两次输入的密码不一致！' : 'Passwords do not match!');
          return;
        }
        setSuccessMessage(lang === 'zh' ? '账号注册成功！请使用新账号登录。' : 'Account registered successfully! Please log in.');
        setIsLogin(true);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Language Toggle Header */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          className="flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm"
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'zh' ? 'English (EN)' : '简体中文 (ZH)'}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'zh' ? '泰崇员工假勤管理系统' : 'Tai Chong Enterprise Leave Portal'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {lang === 'zh' ? 'Enterprise Leave Management & Multi-PIC Workflow' : 'Enterprise Leave Management & Multi-PIC Workflow'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setSuccessMessage(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {lang === 'zh' ? '登录 (Sign In)' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setSuccessMessage(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isLogin ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {lang === 'zh' ? '注册 (Register)' : 'Register'}
          </button>
        </div>

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {lang === 'zh' ? '员工全名 / Full Name' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'zh' ? '例如: Connie Cho' : 'e.g. Connie Cho'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {lang === 'zh' ? '员工工号 / Employee ID' : 'Employee ID'}
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="TC-8821"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {isLogin
                ? (lang === 'zh' ? '员工工号或邮箱 / Employee ID or Email' : 'Employee ID or Email')
                : (lang === 'zh' ? '工作邮箱 / Work Email' : 'Work Email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder={isLogin ? 'TC-8821 or connie.cho@company.com' : 'connie.cho@company.com'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {lang === 'zh' ? '所属部门 / Department' : 'Department'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                  >
                    <option value="Manufacturing & Stamping">
                      {lang === 'zh' ? '生产与冲压部 (Manufacturing & Stamping)' : 'Manufacturing & Stamping'}
                    </option>
                    <option value="Quality Assurance">
                      {lang === 'zh' ? '品质管理部 (QA/QC)' : 'Quality Assurance (QA/QC)'}
                    </option>
                    <option value="Tooling & Maintenance">
                      {lang === 'zh' ? '模具与工务维护部 (Tooling & Maintenance)' : 'Tooling & Maintenance'}
                    </option>
                    <option value="Warehouse & Logistics">
                      {lang === 'zh' ? '仓储与供应链物流部 (Warehouse & Logistics)' : 'Warehouse & Logistics'}
                    </option>
                    <option value="Corporate & Admin">
                      {lang === 'zh' ? '综合行政部 (Corporate & Admin)' : 'Corporate & Admin'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {lang === 'zh' ? '直属主管 (Tier 1 审批人) / Direct Supervisor' : 'Direct Supervisor (Tier 1)'}
                </label>
                <select
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {DIRECT_SUPERVISORS.map((sup) => (
                    <option key={sup.value} value={sup.value} className="bg-zinc-900 text-zinc-200">
                      {sup.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {lang === 'zh' ? '密码 / Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {lang === 'zh' ? '确认密码 / Confirm Password' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-zinc-400">
                <input type="checkbox" className="rounded bg-zinc-950 border-zinc-800 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '记住我 (Remember Me)' : 'Remember Me'}</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert(lang === 'zh' ? '请联系人资部重置密码：hr@company.com' : 'Please contact HR to reset password: hr@company.com'); }} className="text-emerald-400 hover:underline">
                {lang === 'zh' ? '忘记密码？' : 'Forgot Password?'}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 text-xs"
          >
            {loading ? (
              <span className="animate-pulse">{lang === 'zh' ? '处理中...' : 'Processing...'}</span>
            ) : (
              <>
                <span>{isLogin ? (lang === 'zh' ? '立即登录' : 'Sign In') : (lang === 'zh' ? '确认注册' : 'Create Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
          {lang === 'zh' ? '泰崇企业假勤管理系统 v2.6 • 多级审批引擎' : 'Tai Chong Enterprise Leave System v2.6 • Multi-PIC Engine'}
        </div>
      </div>
    </div>
  );
};
