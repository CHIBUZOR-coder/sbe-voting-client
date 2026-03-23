import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiHomeLine,
  RiMegaphoneLine,
  RiBuilding2Line,
} from "react-icons/ri";

// ── Quick links ────────────────────────────────────────────────
const quickLinks = [
  { to: "/", icon: RiHomeLine, label: "Go Home" },
  { to: "/campaigns", icon: RiMegaphoneLine, label: "Browse Campaigns" },
  { to: "/organizations", icon: RiBuilding2Line, label: "Organizations" },
];

// ── Not Found Page ─────────────────────────────────────────────
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
      min-h-[80vh] flex items-center justify-center
      container-page py-20
    "
    >
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="mb-6"
        >
          <span className="text-[120px] font-black leading-none text-primary-500 block">
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 dark:text-dark-muted mb-8 leading-relaxed">
            The page you are looking for does not exist, was moved, or you may
            not have permission to view it.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-outline text-sm flex items-center gap-2"
          >
            <RiArrowLeftLine size={15} />
            Go Back
          </button>
          <Link to="/" className="btn-primary text-sm flex items-center gap-2">
            <RiHomeLine size={15} />
            Go Home
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs text-gray-400 dark:text-dark-muted mb-4">
            Or visit one of these pages
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <link.icon size={14} />
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
