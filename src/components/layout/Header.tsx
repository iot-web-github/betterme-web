import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BrandIcon } from '@/components/BrandIcon';
import { Sparkles, Home, BarChart3, ClipboardCheck, Wrench, Menu, X, User, LogOut, Brain } from 'lucide-react';
const navItems = [{
  href: '/',
  label: 'Home',
  icon: Home
}, {
  href: '/checkin',
  label: 'Check-in',
  icon: ClipboardCheck
}, {
  href: '/ai-insights',
  label: 'AI',
  icon: Brain
}, {
  href: '/tools',
  label: 'Tools',
  icon: Wrench
}, {
  href: '/dashboard',
  label: 'Dashboard',
  icon: BarChart3
}];
export const Header = () => {
  const {
    timeString,
    currentTime
  } = useCurrentTime();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
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
  return <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/70 backdrop-blur-2xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{ duration: 0.3 }} className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div className="relative w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow" whileHover={{
              scale: 1.08,
              rotate: 5
            }} whileTap={{
              scale: 0.95
            }}>
                <BrandIcon className="w-8 h-8" />
                <motion.div className="absolute -top-1 -right-1" animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 15, -10, 0]
              }} transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}>
                  <Sparkles className="w-3 h-3 text-warning drop-shadow-lg" />
                </motion.div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">BetterMe</h1>
                <p className="text-[11px] text-muted-foreground leading-tight font-medium">{greeting()}</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-2xl p-1.5 border border-secondary/40 backdrop-blur-sm">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return <Link key={item.href} to={item.href}>
                  <motion.div whileHover={{
                scale: 1.03
              }} whileTap={{
                scale: 0.97
              }} transition={{ duration: 0.2 }}>
                    <Button 
                      variant={isActive ? "default" : "ghost"} 
                      size="sm" 
                      className={`gap-2 h-9 px-4 text-sm font-semibold rounded-lg transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30' 
                          : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </motion.div>
                </Link>;
          })}
          </nav>

          {/* Right Side */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{ duration: 0.3 }} className="flex items-center gap-2.5">
            <motion.div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl glass border border-primary/20 bg-primary/5 backdrop-blur-sm" whileHover={{
            scale: 1.02
          }} transition={{ duration: 0.2 }}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">{formattedDate}</span>
                <div className="w-px h-4 bg-border/40" />
              </div>
              <motion.span className="text-sm font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tabular-nums" key={timeString} initial={{
              opacity: 0.5,
              y: -2
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.1
            }}>
                {timeString}
              </motion.span>
            </motion.div>

            <ThemeToggle />

            {/* User Menu */}
            {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="default" size="icon" className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-info hover:from-primary/90 hover:to-info/90 shadow-lg">
                      <User className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass border border-primary/20 rounded-xl shadow-xl">
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer h-9 rounded-lg">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="gap-2 cursor-pointer h-9 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer h-9 rounded-lg text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}

            {/* Mobile Menu Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="icon" className="md:hidden h-9 w-9 rounded-xl border-primary/30 hover:border-primary/60" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && <motion.nav initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="md:hidden pt-3 pb-2">
              <div className="flex flex-col gap-1">
                {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant={isActive ? "default" : "ghost"} className={`w-full justify-start gap-2 h-10 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}>
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>;
            })}
                {user && <>
                    <div className="h-px bg-border/50 my-2" />
                    <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 h-10 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>}
              </div>
            </motion.nav>}
        </AnimatePresence>
      </div>
    </header>;
};