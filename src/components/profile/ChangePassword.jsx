import { useState } from "react";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/api";

// ── Password field config ──────────────────────────────────────
const passwordFields = [
  {
    name: "currentPassword",
    label: "Current Password",
    placeholder: "Your current password",
    rules: { required: "Current password is required" },
  },
  {
    name: "newPassword",
    label: "New Password",
    placeholder: "Min. 8 characters",
    rules: {
      required: "New password is required",
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters",
      },
    },
  },
  {
    name: "confirmPassword",
    label: "Confirm New Password",
    placeholder: "Repeat new password",
    rules: {
      required: "Please confirm your password",
    },
    isConfirm: true,
  },
];

const ChangePassword = () => {
  const [showFields, setShowFields] = useState(
    Object.fromEntries(passwordFields.map((f) => [f.name, false])),
  );

  const toggleShow = (name) =>
    setShowFields((prev) => ({ ...prev, [name]: !prev[name] }));

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  const {
    mutate: changePassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data) => {
      await api.patch("/api/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      reset();
      setShowFields(
        Object.fromEntries(passwordFields.map((f) => [f.name, false])),
      );
    },
  });

  const onSubmit = (data) => changePassword(data);

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          Change Password
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Choose a strong password of at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {passwordFields.map((field) => (
          <div key={field.name}>
            <label className="label">{field.label}</label>
            <div className="relative">
              <RiLockLine
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                {...register(field.name, {
                  ...field.rules,
                  ...(field.isConfirm && {
                    validate: (val) =>
                      val === getValues("newPassword") ||
                      "Passwords do not match",
                  }),
                })}
                type={showFields[field.name] ? "text" : "password"}
                placeholder={field.placeholder}
                className={`input pl-9 pr-10 ${errors[field.name] ? "input-error" : ""}`}
              />
              <button
                type="button"
                onClick={() => toggleShow(field.name)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showFields[field.name] ? (
                  <RiEyeOffLine size={16} />
                ) : (
                  <RiEyeLine size={16} />
                )}
              </button>
            </div>
            {errors[field.name] && (
              <p className="error-text">{errors[field.name].message}</p>
            )}
          </div>
        ))}

        {/* ── Submit + feedback ────────────────────────────── */}
        <div className="flex items-center gap-4 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {isPending ? (
              <>
                <RiLoader4Line size={14} className="animate-spin" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>

          <AnimatePresence>
            {isSuccess && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400"
              >
                <RiCheckboxCircleLine size={16} />
                Password updated!
              </motion.p>
            )}
            {isError && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-500"
              >
                {error?.response?.data?.message || "Update failed."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
