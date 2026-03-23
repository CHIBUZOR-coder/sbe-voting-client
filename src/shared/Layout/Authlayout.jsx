import { Link, Outlet } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { RiCheckboxCircleLine } from "react-icons/ri";
import useThemeStore from "../../store/themeStore";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import { AnimatePresence } from "framer-motion";

const AuthLayout = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div
      className="
      min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-primary-50 via-white to-primary-100
      dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface
      transition-colors duration-300
    "
    >
      {/* Theme toggle — top right */}
      <button
        onClick={toggleTheme}
        className="
          fixed top-4 right-4 p-2 rounded-xl
          bg-white dark:bg-dark-surface
          border border-surface-200 dark:border-dark-border
          text-gray-500 dark:text-gray-400
          hover:text-gray-900 dark:hover:text-white
          shadow-soft transition-all duration-200
        "
        aria-label="Toggle theme"
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RiSunLine size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RiMoonLine size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center mb-8"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="
              w-10 h-10 rounded-xl bg-primary-500
              flex items-center justify-center
              group-hover:bg-primary-600 transition-colors duration-200
              shadow-green
            "
            >
              <RiCheckboxCircleLine className="text-white" size={22} />
            </div>
            <span className="font-black text-2xl tracking-tight">
              <span className="text-primary-500">SBE</span>
              <span className="text-gray-900 dark:text-white"> Vote</span>
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="card"
        >
          <Outlet />
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-gray-400 dark:text-dark-muted mt-6"
        >
          Secure · Anonymous · Real-time
        </motion.p>
      </div>
    </div>
  );
};

export default AuthLayout;
