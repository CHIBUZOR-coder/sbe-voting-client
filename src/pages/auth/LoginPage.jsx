import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
} from "react-icons/ri";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    
    console.log("submitting...");
    
    setServerError("");
    try {
      const response = await api.post("/api/users/login", {
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken, data: user } = response.data;
      console.log("data", response.data);
      console.log("status", response.status);

      setAuth(user, accessToken, refreshToken);
      navigate("/dashboard");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Welcome back
      </h2>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Sign up
        </Link>
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="on"
      >
        {/* ── Email ───────────────────────────────────────── */}
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
              autoComplete="email"
              className={`input pl-9 ${errors.email ? "input-error" : ""}`}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* ── Password ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <RiLockLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("password", {
                required: "Password is required",
              })}
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
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
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <RiLoader4Line size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default LoginPage;
