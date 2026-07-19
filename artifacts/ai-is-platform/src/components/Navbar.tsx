import { Link, useLocation } from "wouter";
import { Brain, Menu, X, Sparkles, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/architecture", label: "Architecture" },
  { href: "/techniques", label: "Techniques" },
  { href: "/performance", label: "Performance" },
  { href: "/research", label: "Research" },
  { href: "/formulas", label: "Formulas" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:border-primary transition-colors">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                AI-IS
              </span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {NAV_LINKS.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {user && (
                <Link
                  href="/ml-playground"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                    location === "/ml-playground"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Playground
                </Link>
              )}
            </div>
          </div>
          
          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoading && !user && (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-white px-4 py-2 rounded-md transition-all">
                  Sign Up
                </Link>
              </>
            )}
            {!isLoading && user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm border border-primary/50 cursor-default" title={user.username}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {!isLoading && user && (
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm border border-primary/50 cursor-default" title={user.username}>
                 {user.username.charAt(0).toUpperCase()}
               </div>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {NAV_LINKS.map((link) => {
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              {user && (
                <Link
                  href="/ml-playground"
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 cursor-pointer ${
                    location === "/ml-playground"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Playground
                </Link>
              )}
              
              {!isLoading && !user && (
                <div className="pt-4 pb-2 border-t border-border/50 mt-4 space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 text-center">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
