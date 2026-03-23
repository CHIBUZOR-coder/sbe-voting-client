import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMenuLine,
  RiCloseLine,
  RiSunLine,
  RiMoonLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiDashboardLine,
  RiBuilding2Line,
  RiArrowDownSLine,
  RiVipCrownLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";
import api from "../lib/api";

// ── Nav links ──────────────────────────────────────────────────
const navLinks = [
  { to: "/campaigns", label: "Campaigns" },
  { to: "/organizations", label: "Organizations" },
];

// ── Dropdown items ─────────────────────────────────────────────
// role: null          = visible to all authenticated users
// role: 'ORG_ADMIN'   = visible to ORG_ADMIN + SUPER_ADMIN
// role: 'SUPER_ADMIN' = visible to SUPER_ADMIN only
const dropdownItems = [
  { to: "/dashboard", icon: RiDashboardLine, label: "Dashboard", role: null },
  { to: "/profile", icon: RiUserLine, label: "Profile", role: null },
  {
    to: "/org/manage",
    icon: RiBuilding2Line,
    label: "Manage Org",
    role: "ORG_ADMIN",
  },
  {
    to: "/admin",
    icon: RiVipCrownLine,
    label: "Admin Panel",
    role: "SUPER_ADMIN",
  },
];

// ── Role badge config ──────────────────────────────────────────
const roleConfig = {
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: RiVipCrownLine,
    color: "text-yellow-500",
  },
  ORG_ADMIN: {
    label: "Org Admin",
    icon: RiBuilding2Line,
    color: "text-primary-500",
  },
  VOTER: { label: "Voter", icon: RiCheckboxCircleLine, color: "text-gray-400" },
};

// ── Helper — filter dropdown items by user role ────────────────
const filterByRole = (items, userRole) =>
  items.filter((item) => {
    if (item.role === "ORG_ADMIN")
      return userRole === "ORG_ADMIN" || userRole === "SUPER_ADMIN";
    if (item.role === "SUPER_ADMIN") return userRole === "SUPER_ADMIN";
    return true;
  });

// ── Navbar ─────────────────────────────────────────────────────
const Navbar = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch {
      // Clear auth even if API call fails
    } finally {
      clearAuth();
      setDropdownOpen(false);
      setMobileOpen(false);
      // localStorage.clear();
      navigate("/login");
    }
  };

  // Filtered items for current user
  const visibleDropdownItems = user
    ? filterByRole(dropdownItems, user.role)
    : [];

  // Role badge
  const RoleBadge = () => {
    if (!user) return null;
    const {
      label,
      icon: Icon,
      color,
    } = roleConfig[user.role] || roleConfig.VOTER;
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${color}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  return (
    <header
      className={`
      sticky top-0 z-50
      bg-white/90 dark:bg-dark-bg/90
      backdrop-blur-md
      border-b border-surface-200 dark:border-dark-border
      transition-all duration-300
      ${scrolled ? "shadow-soft" : ""}
    `}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="
              w-8 h-8 rounded-lg bg-primary-500
              flex items-center justify-center
              group-hover:bg-primary-600 transition-colors duration-200
              shadow-green
            "
            >
              <RiCheckboxCircleLine className="text-white" size={18} />
            </div>
            <span className="font-black text-xl tracking-tight">
              <span className="text-primary-500">SBE</span>
              <span className="text-gray-900 dark:text-white"> Vote</span>
            </span>
          </Link>

          {/* ── Desktop nav links ────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-700/20 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-dark-surface hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right controls ───────────────────────────────── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="
                p-2 rounded-lg text-gray-500 dark:text-gray-400
                hover:bg-surface-100 dark:hover:bg-dark-surface
                hover:text-gray-900 dark:hover:text-white
                transition-all duration-200
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
                    <RiSunLine size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RiMoonLine size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* ── Authenticated ────────────────────────────────── */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="
                    flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl group
                    hover:bg-surface-100 dark:hover:bg-dark-surface
                    transition-all duration-200
                  "
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
                    />
                  ) : (
                    <div
                      className="
                      w-8 h-8 rounded-full bg-primary-500 text-white
                      flex items-center justify-center text-sm font-bold
                    "
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RiArrowDownSLine
                      size={16}
                      className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200"
                    />
                  </motion.div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="
                        absolute right-0 mt-2 w-56
                        bg-white dark:bg-dark-surface
                        border border-surface-200 dark:border-dark-border
                        rounded-2xl shadow-soft overflow-hidden z-50
                      "
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-surface-200 dark:border-dark-border">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                          {user.email}
                        </p>
                        <div className="mt-1">
                          <RoleBadge />
                        </div>
                      </div>

                      {/* Menu items — dropdownItems array mapped inline */}
                      <div className="py-1">
                        {visibleDropdownItems.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            className="
                              flex items-center gap-3 px-4 py-2.5
                              text-sm text-gray-700 dark:text-gray-200
                              hover:bg-surface-100 dark:hover:bg-dark-bg
                              transition-colors duration-150
                            "
                          >
                            <item.icon
                              size={16}
                              className="text-gray-400 dark:text-gray-500"
                            />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-surface-200 dark:border-dark-border py-1">
                        <button
                          onClick={handleLogout}
                          className="
                            w-full flex items-center gap-3 px-4 py-2.5
                            text-sm text-red-500
                            hover:bg-red-50 dark:hover:bg-red-900/20
                            transition-colors duration-150
                          "
                        >
                          <RiLogoutBoxLine size={16} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest buttons ─────────────────────────────── */
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* ── Mobile menu button ───────────────────────────── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="
                md:hidden p-2 rounded-lg
                text-gray-500 dark:text-gray-400
                hover:bg-surface-100 dark:hover:bg-dark-surface
                transition-all duration-200
              "
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RiCloseLine size={22} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RiMenuLine size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="
              md:hidden overflow-hidden
              border-t border-surface-200 dark:border-dark-border
              bg-white dark:bg-dark-bg
            "
          >
            <div className="container-page py-4 space-y-1">
              {/* Nav links */}
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-700/20 text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-dark-surface"
                    }
                  `}
                >
                  {label}
                </NavLink>
              ))}

              {/* Guest auth buttons */}
              {!isAuthenticated && (
                <div className="pt-3 space-y-2 border-t border-surface-200 dark:border-dark-border">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center btn-outline text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center btn-primary text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Authenticated mobile links — dropdownItems array mapped inline */}
              {isAuthenticated && user && (
                <div className="pt-3 border-t border-surface-200 dark:border-dark-border space-y-1">
                  {visibleDropdownItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        text-sm text-gray-600 dark:text-gray-300
                        hover:bg-surface-100 dark:hover:bg-dark-surface
                        transition-colors duration-150
                      "
                    >
                      <item.icon
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm text-red-500
                      hover:bg-red-50 dark:hover:bg-red-900/20
                      transition-colors duration-150
                    "
                  >
                    <RiLogoutBoxLine size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
