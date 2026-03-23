import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import api from "../../lib/api";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");

    if (!token) {
      setServerError("No reset token found. Please request a new reset link.");
      return;
    }

    try {
      await api.post("/api/users/reset-password", {
        token,
        newPassword: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Reset failed. The link may have expired.",
      );
    }
  };

  if (success) {
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
          Password reset!
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
          Your password has been updated. Redirecting to login...
        </p>
        <Link to="/login" className="btn-primary text-sm">
          Go to Login
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
        Reset password
      </h2>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
        Choose a strong new password for your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── New password ─────────────────────────────────── */}
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <RiLockLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              className={`input pl-9 pr-10 ${errors.password ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <RiEyeOffLine size={16} />
              ) : (
                <RiEyeLine size={16} />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        {/* ── Confirm password ─────────────────────────────── */}
        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <RiLockLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) =>
                  val === getValues("password") || "Passwords do not match",
              })}
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              className={`input pl-9 pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? (
                <RiEyeOffLine size={16} />
              ) : (
                <RiEyeLine size={16} />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* ── Server error ─────────────────────────────────── */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-600 dark:text-red-400">
              {serverError}
            </p>
          </motion.div>
        )}

        {/* ── Submit ───────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RiLoader4Line size={16} className="animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default ResetPasswordPage;
