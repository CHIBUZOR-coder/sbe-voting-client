import { Link } from "react-router-dom";
import {
  RiCheckboxCircleLine,
  RiGithubLine,
  RiTwitterLine,
  RiLinkedinLine,
  RiMailLine,
  RiShieldCheckLine,
  RiLockLine,
} from "react-icons/ri";

// ── Data ───────────────────────────────────────────────────────
const navLinks = {
  Platform: [
    { label: "Campaigns", to: "/campaigns" },
    { label: "Organizations", to: "/organizations" },
    { label: "Register", to: "/register" },
    { label: "Login", to: "/login" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "#" },
    { label: "Terms of Service", to: "#" },
    { label: "Cookie Policy", to: "#" },
  ],
};

const socialLinks = [
  { icon: RiGithubLine, href: "#", label: "GitHub" },
  { icon: RiTwitterLine, href: "#", label: "Twitter" },
  { icon: RiLinkedinLine, href: "#", label: "LinkedIn" },
  { icon: RiMailLine, href: "#", label: "Email" },
];

// ── Component ──────────────────────────────────────────────────
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
      bg-white dark:bg-dark-surface
      border-t border-surface-200 dark:border-dark-border
      transition-colors duration-300
    "
    >
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ── Brand column ─────────────────────────────── */}
          <div className="md:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div
                className="
                w-8 h-8 rounded-lg bg-primary-500
                flex items-center justify-center
                group-hover:bg-primary-600 transition-colors
              "
              >
                <RiCheckboxCircleLine className="text-white" size={18} />
              </div>
              <span className="font-black text-xl tracking-tight">
                <span className="text-primary-500">SBE</span>
                <span className="text-gray-900 dark:text-white"> Vote</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-gray-500 dark:text-dark-muted leading-relaxed max-w-xs">
              A secure, transparent and anonymous voting platform for schools,
              organizations and governments of all sizes.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-muted">
                <RiShieldCheckLine size={14} className="text-primary-500" />
                Secure voting
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-muted">
                <RiLockLine size={14} className="text-primary-500" />
                Anonymous ballots
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  aria-label={item.label}
                  className="
                    w-8 h-8 rounded-lg
                    flex items-center justify-center
                    text-gray-400 dark:text-dark-muted
                    hover:text-primary-500 dark:hover:text-primary-400
                    hover:bg-primary-50 dark:hover:bg-primary-900/20
                    transition-all duration-200
                  "
                >
                  <item.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns ─────────────────────────────── */}
          {Object.entries(navLinks).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="
                        text-sm text-gray-500 dark:text-dark-muted
                        hover:text-primary-500 dark:hover:text-primary-400
                        transition-colors duration-150
                      "
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────── */}
        <div
          className="
          mt-10 pt-6
          border-t border-surface-200 dark:border-dark-border
          flex flex-col sm:flex-row items-center justify-between gap-4
        "
        >
          <p className="text-xs text-gray-400 dark:text-dark-muted">
            © {currentYear} SBE Voting System. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-muted">
            Built with ❤️ for transparent democracy
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
