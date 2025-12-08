import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sparkles, Zap, Home, BarChart3, ClipboardCheck, Wrench, Menu, X, User, LogOut } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/checkin', label: 'Check-in', icon: ClipboardCheck },
  { href: '/tools', label: 'Tools', icon: Wrench },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export const Header = () => {
  const { timeString, currentTime } = useCurrentTime();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/20 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <Link to="/" className="flex items-center gap-2.5">
              <motion.div 
                className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-info flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap className="w-4.5 h-4.5 text-primary-foreground" />
                <motion.div
                  className="absolute -top-0.5 -right-0.5"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-warning drop-shadow-lg" />
                </motion.div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-base font-display font-bold gradient-text leading-tight">SmartSchedule</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">{greeting()}</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 bg-secondary/30 rounded-xl p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`gap-1.5 h-8 px-3 text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div 
              className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl glass border border-primary/10"
              whileHover={{ scale: 1.01 }}
            >
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
              <div className="w-px h-4 bg-border/50" />
              <motion.span 
                className="text-sm font-display font-bold text-foreground tabular-nums"
                key={timeString}
                initial={{ opacity: 0.5, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
              >
                {timeString}
              </motion.span>
            </motion.div>

            <ThemeToggle />

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass">
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-2 cursor-pointer">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-xs">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-xs">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-3 pb-2"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-2 h-10 ${
                          isActive ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
                {user && (
                  <>
                    <div className="h-px bg-border/50 my-2" />
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-2 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
