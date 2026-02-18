import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Menu, X, Mic, LogOut } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Mic className="h-6 w-6 text-primary" />
          <span className="text-gradient">SpeakAI</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass border-t border-border px-4 pb-4"
        >
          {token ? (
            <div className="flex flex-col gap-3 pt-3">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-muted-foreground hover:text-foreground">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                Sign Up
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
