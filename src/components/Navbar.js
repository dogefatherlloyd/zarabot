import { useUser } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "./LoginModal";
import { useLoginDialog } from "../utils";

export default function Navbar() {
  const { setLoginOpen } = useLoginDialog();
  const user = useUser();
  return (
    <>
      <nav className="white-shadow px-2 z-40">
        <div className="flex w-full max-w-4xl py-3 items-center justify-between mx-auto">
          <div className="text-2xl font-medium text-gray-800 flex items-center">
            <Link href="/">
              <div>
                <Image
                  src="/jobot_text_logo.png"
                  height={25}
                  width={50}
                  className="hidden md:block object-contain"
                  alt="logo"
                  unoptimized
                />
                <Image
                  src="/jobot_icon.png"
                  height={32}
                  width={32}
                  className="md:hidden object-contain"
                  alt="logo"
                  unoptimized
                />
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-8 divide-x divide-white divide-opacity-40">
            <Link href="/" className="px-2 text-gray-200 hover:text-blue-600">
              Home
            </Link>
            <Link href="/build" className="px-2 text-gray-200 hover:text-blue-600">
              Build
            </Link>
            <Link href="/training" className="px-2 text-gray-200 hover:text-blue-600">
              Cannoli
            </Link>
            <Link href="/chat" className="px-2 text-gray-200 hover:text-blue-600">
              Training
            </Link>
            <Link href="/trade" className="px-2 text-gray-200 hover:text-blue-600">
              Trade
            </Link>
            <Link href="https://github.com/dogefatherlloyd/zarabot" className="px-2 text-gray-200 hover:text-blue-600" target="_blank" rel="noreferrer">
              Docs
            </Link>
            {user ? (
              <Link href="/account" className="px-2 text-gray-200 hover:text-blue-600">
                Account
              </Link>
            ) : (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  setLoginOpen(true);
                }}
                className="px-2 text-gray-500 hover:text-blue-600 cursor-pointer"
              >
                Log In
              </div>
            )}
          </div>
        </div>
      </nav>
      {!user && <LoginModal />}
    </>
  );
}