'use client'

import CommonInputBox from "./CommonInputBox";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: () => void;
  placeholder?: string;
  errorMessage?: string;
  touched?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "검색어를 입력하세요",
  errorMessage,
  touched,
  onBlur
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit?.();
  }

  return (
    <div className="relative flex flex-row items-center w-full">
      <CommonInputBox
        type="text"
        value={value}
        onChange={onChange}
        touched={touched}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        errorMessage={errorMessage}
        placeholder={placeholder}
        icon={<span className="material-symbols-outlined">search</span>}
        className="flex-1 min-w-0"
      />
      <button
      type="button"
      onClick={onSubmit}
      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white 
      font-bold px-4 py-2 rounded cursor-pointer flex-shrink-0"
      style={{minWidth: 60}}>
        검색
      </button>
    </div>
  )
};

export default SearchBar;