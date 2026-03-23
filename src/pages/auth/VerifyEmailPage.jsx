import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from "react-icons/ri";
import api from "../../lib/api";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // ── Derive initial state from token directly ───────────────────
  // If there is no token we already know the status — no need to
  // call setState inside the effect which would cause a cascade.
  const [status, setStatus] = useState(() => (token ? "loading" : "error"));
  const [message, setMessage] = useState(() =>
    token ? "" : "No verification token found in the link.",
  );

  // ── Only run the effect if a token exists ──────────────────────
const hasVerified = useRef(false);

useEffect(() => {
  if (!token || hasVerified.current) return;
  hasVerified.current = true; // ← prevents second call

  const verify = async () => {
    try {
      console.log("📤 Sending token to backend...");
      const res = await api.get("/api/users/verify-email", {
        params: { token },
      });
      console.log("✅ Backend response:", res.data);
      setStatus("success");
    } catch (error) {
      console.log("❌ Error response:", error.response?.data);
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Verification failed. The link may have expired.",
      );
    }
  };

  verify();
}, [token]);
  return (
    <div
      className="
      min-h-screen flex items-center justify-center p-4
      bg-gradient-to-br from-primary-50 via-white to-primary-100
      dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg
    "
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card w-full max-w-md text-center"
      >
        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
              <RiLoader4Line
                size={32}
                className="text-primary-500 animate-spin"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              Please wait a moment.
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
              <RiCheckboxCircleLine size={32} className="text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Email verified!
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
              Your account is now active. You can log in and start voting.
            </p>
            <Link to="/login" className="btn-primary text-sm">
              Go to Login
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <RiErrorWarningLine size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Verification failed
            </h2>
            <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
              {message}
            </p>
            <Link to="/login" className="btn-outline text-sm">
              Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
