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
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "게시글 제목을 검색해주세요.",
  errorMessage,
  touched,
  onBlur,
  onFocus,
  onKeyDown
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit?.();
    onKeyDown?.(e);
  }

  return (
    <div className="relative flex flex-row items-center w-full">
      <CommonInputBox
        type="text"
        value={value}
        onChange={onChange}
        touched={touched}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        errorMessage={errorMessage}
        placeholder={placeholder}
        icon={<span className="material-symbols-outlined">search</span>}
        containerClassName="flex-1 min-w-0"
      />
    </div>
  )
};

export default SearchBar;