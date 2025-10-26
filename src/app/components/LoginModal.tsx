'use client';

import { useState } from "react";
import EmailInputBox from "./EmailInput";
import CommonInputBox from "./CommonInputBox";
import instance from "../axiosInstance";
import { AxiosError } from "axios";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({isOpen, onClose, onLoginSuccess}) => {
  const { login } = useAuth();
  const [local, setLocal] = useState("");
  const [domain, setDomain] = useState("선택");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwError, setPwError] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const { showToast } = useToast();

  if(!isOpen) return null;
  
  const emailRegex = /^[a-zA-Z0-9]+@[^\s@]+\.[^\s@]+$/;
  const domains = ['gmail.com', 'naver.com', 'hanmail.com', 'kakao.com', 'bigs.or.kr', '직접입력'];
  
  const handleDropdownToggle = () => setDropdownOpen(prev => !prev);
  const handleDomainSelect = (selectedDomain: string) => {
    setDomain(selectedDomain);
    setDropdownOpen(false);
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setPassword(pw);
  };

  const handleLogin = async () => {
    const effectiveDomain = isCustomDomain ? customDomain : domain;
    const email = `${local}@${domain}`;

    if(!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식으로 입력해주세요.")
      return;
    }

    try {
      const res = await instance.post('/auth/signin', {
        username: email,
        password: password
      })

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      login(accessToken, refreshToken, rememberLogin);
      showToast({ type: 'success', message: '로그인 성공 !' });
      onClose();
      console.log("Login 성공")
    } catch(e) {
      if (e instanceof AxiosError) {
        console.error(e.response?.data.message);
      }
      showToast({ type: 'fail', message: '로그인 실패 ! 아이디와 비밀번호를 확인해주세요.'})
      return;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <span className="material-symbols-outlined absolute top-3 right-3 text-xl 
        text-black hover:text-orange-600 transition cursor-pointer"
        onClick={onClose}>close</span>
        <div className={`font-sans items-center justify-items-center flex flex-col  `}>
          <main className="flex flex-col row-start-2 items-center justify-items-center w-full">
            <div className="flex items-center justify-center font-bold text-2xl mb-5 text-black">
              로그인
            </div>
            <div className="bg-gray-200 rounded-lg px-4 py-5 w-full max-w-[520px] mx-auto">
              <div className="flex flex-col gap-5 items-start justify-start w-full">
                <EmailInputBox
                  label="Email"
                  local={local}
                  setLocal={setLocal}
                  domain={domain}
                  setDomain={setDomain}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  error={emailError || undefined}
                  domainList={domains}
                  handleDropdownToggle={handleDropdownToggle}
                  handleDomainSelect={handleDomainSelect}
                  handleLocalChange={handleLocalChange}
                  showButton={false}
                  isCustomDomain={isCustomDomain}
                  customDomain={customDomain}
                  setCustomDomain={setCustomDomain}
                  setIsCustomDomain={setIsCustomDomain}
                />
                <div className="flex flex-col w-full gap-3 sm:flex-col">
                  <div className="text-black font-bold text-lg">Password</div>
                  <CommonInputBox
                    type="password"
                    onChange={handlePasswordChange}
                    value={password}
                    onBlur={() => setTouched(true)}
                    touched={touched}
                    placeholder="비밀번호를 입력해주세요."
                  />
                  {pwError && <div className="text-red-500 text-sm mt-1">{pwError}</div>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  로그인 정보 저장
                </label>
              </div>
              </div>
              <div className="flex gap-3 mt-10">
                <Link href='/' className="w-full">
                  <button
                    className="w-full bg-green-300 border-2 border-green-500 hover:bg-green-400 rounded-lg px-2 py-2 text-black font-bold text-lg cursor-pointer"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                </Link>
                <Link href="/signup" className="w-full" onClick={onClose}>
                  <button
                    className="w-full bg-blue-300 border-2 border-blue-400 rounded-lg px-2 py-2 text-black font-bold text-lg hover:bg-blue-400 cursor-pointer"
                    aria-label="회원가입 페이지로 이동"
                  >
                    회원가입
                  </button>
                </Link>
                {pwError && (
                  <div className="text-red-500 text-sm mt-2 w-full text-center">
                    {pwError}
                  </div>
                )}
              </div>
            </div>
          </main>
          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          </footer>
        </div>
      </div>
    </div>
    
  );
}

export default LoginModal;