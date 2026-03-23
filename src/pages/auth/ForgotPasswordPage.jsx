import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiMailLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import api from "../../lib/api";

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/api/users/forgot-password", { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch {
      // Always show success even if email not found — prevents email enumeration
      setSubmittedEmail(data.email);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
          <RiCheckboxCircleLine size={32} className="text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Check your inbox
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">
          If{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {submittedEmail}
          </span>{" "}
          is registered, we sent a reset link.
        </p>
        <p className="text-xs text-gray-400 dark:text-dark-muted mb-6">
          The link expires in 1 hour. Check your spam folder if you don&apos;t
          see it.
        </p>
        <Link to="/login" className="btn-outline text-sm">
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to="/login"
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors"
      >
        <RiArrowLeftLine size={14} />
        Back to login
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Forgot password?
      </h2>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <RiMailLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              type="email"
              placeholder="you@example.com"
              className={`input pl-9 ${errors.email ? "input-error" : ""}`}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RiLoader4Line size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ForgotPasswordPage;
