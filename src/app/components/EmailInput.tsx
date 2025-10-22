import React from "react";
import useIsMobile from "../hooks/useIsMobile";

interface EmailInputBoxProps {
  label?: string;
  local: string;
  setLocal: (val: string) => void;
  domain: string;
  setDomain: (val: string) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;
  error?: string;
  domainList: string[];
  buttonText?: string;
  buttonVariant?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
  handleDropdownToggle: () => void;
  handleDomainSelect: (d: string) => void;
  handleLocalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCustomDomain?: boolean;
  customDomain?: string;
  setCustomDomain?: (val: string) => void;
  setIsCustomDomain?: (val: boolean) => void;
  showButton?: boolean;
}

const EmailInputBox: React.FC<EmailInputBoxProps> = ({
  label,
  local,
  setLocal,
  domain,
  setDomain,
  dropdownOpen,
  setDropdownOpen,
  error,
  domainList,
  buttonText = "확인",
  onButtonClick,
  disabled = false,
  handleDropdownToggle,
  handleDomainSelect,
  handleLocalChange,
  isCustomDomain,
  customDomain,
  setCustomDomain,
  setIsCustomDomain,
  showButton = true,
}) => {
  const { isMobile, isTablet, isSmallMobile } = useIsMobile();
  const buttonSize = isSmallMobile ? "full" : isTablet ? "fit" : "medium";
  const isDisabled = disabled || !local || (isCustomDomain ? !customDomain : !domain || domain === "선택");

  const getErrorColor = () => {
    if (error === "사용 가능한 이메일입니다.") return "text-green-500 font-bold";
    if (error) return "text-red-500 font-bold";
    return "";
  };

  return (
  <div className="w-full">
    {label && <label className="block text-lg font-bold text-black mb-2">{label}</label>}
    <div className={`flex ${isMobile ? "flex-col gap-2 items-center justify-center" : "flex-row gap-2 items-center justify-center"} w-full`}>
      <input
        type="text"
        value={local}
        onChange={handleLocalChange}
        placeholder="이메일 입력"
        disabled={disabled}
        className={`h-[48px] w-full px-4 border border-gray-300 rounded-lg text-base bg-white 
          placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition text-black
          ${error && error !== "사용 가능한 이메일입니다." ? "border-red-500" : ""}`}
        autoComplete="off"
      />
      <span className="text-xl font-bold select-none bg-transparent text-black">@</span>
      <div className="relative flex items-center w-full min-w-[160px] text-black">
        {isCustomDomain ? (
          <div className="relative flex items-center w-full">
            <input 
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain?.(e.target.value)}
              placeholder="도메인 입력"
              className="h-[48px] w-full px-4 border border-gray-300 rounded-lg text-base bg-white 
                  placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition text-black"
            />
            <button
              type="button"
              onClick={() => {
                setCustomDomain?.("");
                setDomain("선택");
                setDropdownOpen(true);
                setIsCustomDomain?.(false);
              }}
              className="absolute right-2 text-gray-600 hover:text-black material-symbols-outlined cursor-pointer"
            >
              arrow_drop_down
            </button>
          </div>
        ) : (
          <>
              <button
                type="button"
                disabled={disabled}
                onClick={handleDropdownToggle}
                className={`h-[48px] w-full px-4 flex items-center justify-between border border-gray-300 rounded-lg bg-white text-base
                  ${dropdownOpen ? "ring-2 ring-orange-200" : ""}
                  ${domain && domain !== "선택" ? "text-black" : "text-gray-400"}
                  transition`}
              >
                <span className="truncate">{domain || "도메인 선택"}</span>
                <span className="material-symbols-outlined cursor-pointer text-black">
                  arrow_drop_down
                </span>
              </button>

              {dropdownOpen && (
                <ul className="absolute left-0 top-[110%] z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md">
                  {domainList.map((d) => (
                    <li
                      key={d}
                      className="px-4 py-2 cursor-pointer hover:bg-orange-100"
                      onClick={() => handleDomainSelect(d)}
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </>
        )}
        {dropdownOpen && (
          <ul className="absolute left-0 top-[110%] z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md">
            {domainList.map((d) => (
              <li
                key={d}
                className="px-4 py-2 cursor-pointer hover:bg-orange-100"
                onClick={() => handleDomainSelect(d)}
              >
                {d}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`h-full ${isSmallMobile ? "w-full" : "w-fit"} cursor-pointer flex flex-row`}>
        {showButton && (
          <button
            type="button"
            onClick={onButtonClick}
            className={`min-w-[80px] sm:w-full h-[48px] px-4 py-3 rounded-lg font-semibold 
              transition-colors duration-300 cursor-pointer
              ${isDisabled ? "bg-gray-300 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
            disabled={isDisabled}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
    {error && (
      <div className={`mt-1 text-xs ${getErrorColor()}`}>{error}</div>
    )}
  </div>
  );
};

export default EmailInputBox;
