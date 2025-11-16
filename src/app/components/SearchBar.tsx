'use client'

import CommonInputBox from "./CommonInputBox";

// searchBar Type 지정
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

// SearchBar는 props를 받는 React의 함수형 컴포넌트임
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
  // 사용자가 Enter를 쳤을 때 Enter 감지를 위한 React.keyBoardEvent<HTMLInputElement>
  // -> input요소에서 Enter가 이루어졌을 때 실행
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