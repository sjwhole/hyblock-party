// components/Header.js

"use client";

import Link from "next/link";
import Image from "next/image";

import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="bg-gray-100 p-4">
      <div className="flex items-center">
        <Link href="/" className={`text-black text-lg `}>
          <Image
            src="/hyblock.png"
            className="rounded-2xl"
            alt="logo"
            width={100}
            height={100}
          />
          {/* Home */}
        </Link>
        <nav className="max-w-4xl mx-auto">
          <ul className="flex justify-center items-center space-x-8">
            <li></li>
            <li>
              <Link
                href="/faucet"
                className={`text-black text-lg ${
                  isActive("/faucet") ? "border-b-2 border-blue-500" : ""
                } hover:text-blue-400`}
              >
                Faucet
              </Link>
            </li>
            <li>
              <Link
                href="/claim"
                className={`text-black text-lg ${
                  isActive("/claim") ? "border-b-2 border-blue-500" : ""
                } hover:text-blue-400`}
              >
                Claim
              </Link>
            </li>
            <li>
              <Link
                href="/game"
                className={`text-black text-lg ${
                  isActive("/game") ? "border-b-2 border-blue-500" : ""
                } hover:text-blue-400`}
              >
                Game
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
