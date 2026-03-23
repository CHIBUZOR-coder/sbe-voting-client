import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiImageAddLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useDropzone } from "react-dropzone";
import api from "../../lib/api";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  // ── Dropzone ──────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setAvatar(accepted[0]);
        setPreview(URL.createObjectURL(accepted[0]));
      }
    },
  });

  // ── Submit ────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setServerError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (avatar) formData.append("avatar", avatar);

      await api.post("/api/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  // ── Success state ─────────────────────────────────────────────
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
          Check your email!
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
          We sent a verification link to your email address. Click it to
          activate your account.
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Create account
      </h2>
      <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary-500 hover:text-primary-600 font-medium"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Avatar dropzone ─────────────────────────────── */}
        <div className="flex flex-col items-center mb-2">
          <div
            {...getRootProps()}
            className={`
              relative w-20 h-20 rounded-full cursor-pointer
              border-2 border-dashed transition-all duration-200
              flex items-center justify-center overflow-hidden
              ${
                isDragActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-surface-200 dark:border-dark-border hover:border-primary-400"
              }
            `}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img
                src={preview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <RiImageAddLine size={22} />
                <span className="text-xs">Photo</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-dark-muted mt-2">
            Optional — drag & drop or click
          </p>
        </div>

        {/* ── Name ────────────────────────────────────────── */}
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <RiUserLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("name", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              type="text"
              placeholder="Chibuzor Emekalam"
              className={`input pl-9 ${errors.name ? "input-error" : ""}`}
            />
          </div>
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

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
              className={`input pl-9 ${errors.email ? "input-error" : ""}`}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        {/* ── Password ────────────────────────────────────── */}
        <div>
          <label className="label">Password</label>
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

        {/* ── Confirm password ────────────────────────────── */}
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
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <RiLoader4Line size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default RegisterPage;
