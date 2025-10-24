'use client';
import Image from "next/image";
import SearchBar from "./SearchBar";

interface SidebarProps {
  user: { name?: string; email?: string };
  search?: string;
  setSearch?: (value: string) => void;
  touched: boolean;
  setTouched?: (value: boolean) => void;
  showSearch?: boolean;
}

export default function Sidebar({
  user,
  search,
  setSearch,
  touched,
  setTouched,
  showSearch = true,
}: SidebarProps) {
  return (
    <aside className="flex flex-col w-full max-w-md h-full border-r-2 pt-5 border-black bg-gray-600 items-center justify-start px-1">
      <div className="flex flex-col items-center gap-5 px-6 py-2">
        <Image
          src="/assets/profile.png"
          alt="프로필 이미지"
          width={100}
          height={100}
          className="mt-5"
        />
        <div className="font-bold">Name : {user.name}</div>
        <div className="font-bold">Email: {user.email}</div>
      </div>
      {showSearch && (
        <div className="w-full bg-white rounded-lg px-2 py-2">
          <SearchBar
            value={search ?? ""}
            onChange={(e) => setSearch?.(e.target.value)}
            onSubmit={() => {}}
            touched={touched ?? false}
            errorMessage="해당 게시글이 존재하지 않습니다."
          />
        </div>
      )}
    </aside>
  );
}
