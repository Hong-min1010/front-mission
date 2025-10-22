'use client';

import Image from "next/image";
import { useState } from "react";
import EmailInputBox from "../components/EmailInput";
import CommonInputBox from "../components/CommonInputBox";
import useIsMobile from "../hooks/useIsMobile";
import instance from "../axiosInstance";
import { AxiosError } from "axios";

export default function Signup() {
  const [local, setLocal] = useState("");
  const [domain, setDomain] = useState("선택");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [pwError, setPwError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [touched, setTouched] = useState(false);
  const { isTablet, isMobile, isSmallMobile } = useIsMobile();
  const [signupMessage, setSignupMessage] = useState("");

  const emailRegex = /^[a-zA-Z0-9]+@[^\s@]+\.[^\s@]+$/;
  const domains = ['gmail.com', 'naver.com', 'hanmail.com', 'kakao.com'];

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!%*#?&])[A-Za-z\d!%*#?&]{8,}$/;

  interface ErrorResponse {
    message: string;
  }

  const handleDropdownToggle = () => setDropdownOpen(prev => !prev);
  const handleDomainSelect = (selectedDomain: string) => {
    setDomain(selectedDomain);
    setDropdownOpen(false);
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value);
  };

  const handleButtonClick = () => {
    const email = `${local}@${domain}`;
    if (!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식으로 입력해주세요.");
    } else {
      setEmailError("사용 가능한 이메일입니다.");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pw = e.target.value;
    setPassword(pw);
    if(!passwordRegex.test(pw)) {
      setPwError("비밀번호는 8자 이상, 영문자/숫자/특수문자 각 1개 이상 포함해야 합니다.")
    } else setPwError("");
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setConfirmPw(e.target.value);
  setConfirmTouched(false);
};

  const handleConfirmButton = () => {
    setConfirmTouched(true);
    if (password !== confirmPw) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
    } else {
      setConfirmError("");
    }
  };

  const handleSignup = async () => {
    const email = `${local}@${domain}`;

    if(!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식으로 입력해주세요.")
      return;
    }

    if(!name) {
      setSignupMessage("이름을 입력해주세요.")
      return;
    }

    if(!passwordRegex.test(password)) {
      setPwError("비밀번호는 8자 이상, 영문자/숫자/특수문자 각 1개 이상 포함해야 합니다.")
      return;
    }

    if (password !== confirmPw) {
      setConfirmError("비밀번호가 일치하지 않습니다.");
      setConfirmTouched(true);
      return;
    }

    try {
      const res = await instance.post("/auth/signup", {
        username: email,
        name: name,
        password: password,
        confirmPassword: confirmPw
      });
      setSignupMessage("회원가입이 완료 되었습니다.");
    } catch (e: unknown) {
        if (e instanceof AxiosError) {
        const err = e as AxiosError<ErrorResponse>;
        console.log(err.response?.data.message);
      }
      }
  }


  return (
    <div className={`font-sans items-center justify-items-center flex flex-col ${!isMobile ? 'px-25 py-10' : 'py-5'} `}>
      <main className="flex flex-col row-start-2 items-center justify-items-center w-full">
        <div className="flex items-center justify-center font-bold text-2xl mb-5 text-black">
          회원가입
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
              buttonText="확인"
              onButtonClick={handleButtonClick}
              disabled={false}
              handleDropdownToggle={handleDropdownToggle}
              handleDomainSelect={handleDomainSelect}
              handleLocalChange={handleLocalChange}
            />
            <div className="w-full">
              <div className="text-black font-bold text-lg">Name</div>
              <CommonInputBox
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                errorMessage="사용자 이름은 공백이 될 수 없습니다, 다시 입력해주세요."
                touched={touched}
                placeholder="사용자 이름을 입력해주세요."
              />
            </div>
            <div className="flex flex-col w-full gap-3 sm:flex-col">
              <div className="text-black font-bold text-lg">Password</div>
              <CommonInputBox
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setTouched(true)}
                errorMessage="비밀번호는 8자 이상, 숫자, 영문자, 특수문자(!%*#?&) 1개 이상의 조합이여야합니다."
                touched={touched}
                placeholder="비밀번호를 입력해주세요."
              />
              {pwError && <div className="text-red-500 text-sm mt-1">{pwError}</div>}
            </div>
            <div className="w-full">
              <div className="text-black font-bold text-lg mb-2">ConfirmPassword</div>
              <div className="flex flex-row gap-3 w-full">
                <CommonInputBox
                  type="password"
                  value={confirmPw}
                  onChange={handleConfirmChange}
                  onBlur={() => setTouched(true)}
                  errorMessage="비밀번호가 일치하지 않습니다, 다시 입력해주세요."
                  touched={touched}
                  placeholder="비밀번호를 다시 입력해주세요."
                />
                <button
                  type="button"
                  onClick={handleConfirmButton}
                  className="min-w-[72px] h-[48px] px-4 py-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center cursor-pointer"
                >
                확인
                </button>
              </div>
              {confirmTouched && (
                <div className={`text-sm mt-1 ${confirmError ? "text-red-500" : "text-green-600"}`}>
                  {confirmError ? confirmError : "확인되었습니다."}
                </div>
              )}
            </div>
          </div>
          {/* Btn */}
          <div className="flex flex-row justify-between mt-10 gap-20">
            <button
              className="flex items-center justify-center w-full bg-green-300 border-2 border-green-500 rounded-lg px-2 py-2 text-black font-bold text-lg cursor-pointer"
              onClick={handleSignup}
            >
              confirm
            </button>
            <div className="flex items-center justify-center w-full bg-red-300 border-2 border-red-500 rounded-lg px-2 py-2 text-black font-bold text-lg cursor-pointer">
              cancel
            </div>
          </div>
          {signupMessage && (
            <div className={`mt-4 text-center text-base ${signupMessage === "회원가입이 완료되었습니다!" ? "text-green-600" : "text-red-500"}`}>
              {signupMessage}
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
