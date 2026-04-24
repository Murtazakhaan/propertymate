import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home as HomeIcon, BookOpen, Info, LogIn, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  beginnerMode: boolean;
  onToggleBeginnerMode: () => void;
}

const navLinks = [
  { to: "/glossary", label: "Glossary", icon: BookOpen },
  { to: "/about", label: "About", icon: Info },
];

const Layout = ({ children, beginnerMode, onToggleBeginnerMode }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HomeIcon className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              PropertyMate
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 mr-4">
              <Switch
                id="beginner-mode"
                checked={beginnerMode}
                onCheckedChange={onToggleBeginnerMode}
              />
              <Label htmlFor="beginner-mode" className="text-sm text-muted-foreground cursor-pointer">
                Beginner Mode
              </Label>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Link to="/account">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-1.5" />
                    Account
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Switch
                id="beginner-mode-header"
                checked={beginnerMode}
                onCheckedChange={onToggleBeginnerMode}
                className="scale-90"
              />
              <Label htmlFor="beginner-mode-header" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                Beginner
              </Label>
            </div>
            <ThemeToggle className="h-8 w-8" />
            {user && <NotificationBell />}
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    <User className="h-4 w-4 mr-1.5" />
                    My Account
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">PropertyMate</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xl">
              PropertyMate provides general guidance only and does not constitute financial advice.
              Always consult a licensed professional before making investment decisions.
              Data is indicative and may not reflect current market conditions.
            </p>
            <div className="flex gap-4">
              <Link to="/about" className="text-xs text-muted-foreground hover:text-primary">About</Link>
              <Link to="/glossary" className="text-xs text-muted-foreground hover:text-primary">Glossary</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
