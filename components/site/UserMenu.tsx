"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, LogOut, LayoutDashboard, ShoppingBag, ChevronDown } from "lucide-react";

interface UserMenuProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
}

export default function UserMenu({ isLoggedIn, isAdmin, userName, userEmail }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="text-dark/80 hover:text-primary transition-colors duration-200 text-xs font-semibold uppercase tracking-[0.1em] hover:underline hover:underline-offset-4"
      >
        Entrar
      </Link>
    );
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-gold/30 bg-white/60 p-1 pr-3 hover:bg-white hover:border-gold/60 transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-bold ring-2 ring-gold/20">
          {initials}
        </div>
        <span className="text-xs font-medium text-dark max-w-[80px] truncate hidden lg:inline-block">
          {userName.split(" ")[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-dark/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gold/20 bg-white p-2 shadow-lg z-50 animate-fade-up">
          <div className="px-4 py-2.5 border-b border-gold/10">
            <p className="text-xs font-bold text-primary truncate">{userName || "Usuário"}</p>
            <p className="text-[10px] text-dark/50 truncate mt-0.5">{userEmail}</p>
          </div>
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-dark/85 hover:bg-gold/10 hover:text-primary transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4 text-gold" />
                Painel Admin
              </Link>
            )}
            <Link
              href="/pedidos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-dark/85 hover:bg-gold/10 hover:text-primary transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4 text-gold" />
              Meus Pedidos
            </Link>
          </div>
          <div className="border-t border-gold/10 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
