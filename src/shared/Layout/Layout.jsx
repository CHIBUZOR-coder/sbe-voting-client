import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";

/**
 * LAYOUT
 * ─────────────────────────────────────────────────────────────
 * Only job: render Navbar + child page + Footer.
 * Nothing else. No animations, no wrappers.
 *
 * Any page that is a child of Layout in main.jsx
 * automatically gets the Navbar and Footer.
 * ─────────────────────────────────────────────────────────────
 */
const Layout = () => {
  const location = useLocation();

  // Scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
