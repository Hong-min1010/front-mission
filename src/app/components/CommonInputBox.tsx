import React from "react";

interface InputBoxProps {
  className?: string;
  label?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  regex?: RegExp;
  errorMessage?: string;
  touched?: boolean;
}

export default function CommonInputBox({
  className = "",
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  onBlur,
  regex,
  errorMessage = "올바른 형식이 아닙니다.",
  touched = false,
}: InputBoxProps) {
  const invalid = regex ? touched && !regex.test(value) : false;

  return (
    <div className={`flex flex-col text-gray-300 bg-white w-full rounded-lg ${className}`}>
      <label className="font-semibold text-lg text-black">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className={`border rounded-lg px-4 h-[48px] text-base outline-none 
          ${invalid ? "border-red-500" : "border-gray-300"}
          ${value.length > 0 ? "text-black" : "text-gray-300"} placeholder:text-gray-300`}
        autoComplete="off"
      />
      {invalid && (
        <span className="text-red-600 text-sm mt-1">{errorMessage}</span>
      )}
    </div>
  );
}
