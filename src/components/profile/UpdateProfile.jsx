import { useEffect } from "react";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const UpdateProfile = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { name: user?.name || "" },
  });

  // Keep form in sync if user changes
  useEffect(() => {
    reset({ name: user?.name || "" });
  }, [user?.name, reset]);

  const {
    mutate: updateProfile,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data) => {
      const res = await api.patch("/api/users/profile", { name: data.name });
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      reset({ name: data.data.name });
    },
  });

  const onSubmit = (data) => updateProfile(data);

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Update your display name.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ── Name field ────────────────────────────────────── */}
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <RiUserLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              type="text"
              className={`input pl-9 ${errors.name ? "input-error" : ""}`}
            />
          </div>
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        {/* ── Email (read-only) ────────────────────────────── */}
        <div>
          <label className="label">Email Address</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="input opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">
            Email cannot be changed.
          </p>
        </div>

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {isPending ? (
              <>
                <RiLoader4Line size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>

          {/* ── Feedback ──────────────────────────────────── */}
          <AnimatePresence>
            {isSuccess && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400"
              >
                <RiCheckboxCircleLine size={16} />
                Saved!
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

export default UpdateProfile;
