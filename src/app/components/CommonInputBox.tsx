import React from "react";

interface InputBoxProps {
  containerClassName?: string;
  inputClassName?: string;
  label?: string;
  id?: string;
  name?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  regex?: RegExp;
  errorMessage?: string;
  touched?: boolean;
  icon?: React.ReactNode; 
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function CommonInputBox({
  containerClassName = "",
  inputClassName = "",
  label,
  id,
  name,
  type = "text",
  value,
  placeholder,
  onChange,
  onBlur,
  regex,
  errorMessage = "올바른 형식이 아닙니다.",
  touched = false,
  icon,
  onKeyDown,
  onFocus,
}: InputBoxProps) {
  const invalid = regex ? touched && !regex.test(value) : false;

  return (
    <div className={`flex flex-col text-gray-300 bg-white w-full rounded-lg ${containerClassName}`}>
      {label && <label className="font-semibold text-lg text-black">{label}</label>}
      <div className="relative w-full">
        <input
        id={id}
        name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          className={`border rounded-lg w-full px-4 h-[48px] outline-none pr-12 
            ${invalid ? "border-red-500" : "border-gray-700"}
            ${value.length > 0 ? "text-black" : "text-gray-700"} placeholder:text-gray-700 ${inputClassName}`}
            
          autoComplete="off"
        />
        {icon && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 items-center justify-center flex flex-row">
            {icon}
          </div>
        )}
      </div>
      {invalid && (
        <span className="text-red-600 text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
