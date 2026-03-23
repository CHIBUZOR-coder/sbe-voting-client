import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiBuilding2Line,
  RiImageAddLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiCloseLine,
} from "react-icons/ri";
import api from "../../lib/api";

// ── Accepted logo types ────────────────────────────────────────
const acceptedTypes = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const OrgDetails = ({ org }) => {
  const queryClient = useQueryClient();
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: org?.name || "",
      description: org?.description || "",
    },
  });

  useEffect(() => {
    reset({ name: org?.name || "", description: org?.description || "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id, reset]);

  // ── Dropzone ──────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setLogo(accepted[0]);
        setPreview(URL.createObjectURL(accepted[0]));
      }
    },
  });

  // ── Update mutation ────────────────────────────────────────────
  const {
    mutate: updateOrg,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("name", data.name);
      // Auto-generate slug from name
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      formData.append("slug", slug);
      if (data.description) formData.append("description", data.description);
      if (logo) formData.append("logo", logo);
      const res = await api.patch(`/api/orgs/${org.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orgs"] });
      setLogo(null);
      setPreview(null);
    },
  });

  const onSubmit = (data) => updateOrg(data);

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          Organization Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Update your organization's name, description and logo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Logo */}
        <div>
          <label className="label">Logo</label>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {preview || org?.logoUrl ? (
                <img
                  src={preview || org.logoUrl}
                  alt="Logo"
                  className={`w-16 h-16 rounded-xl object-cover ring-2 ${preview ? "ring-primary-500/50" : "ring-primary-500/20"}`}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <RiBuilding2Line size={24} className="text-primary-400" />
                </div>
              )}
            </div>

            <div
              {...getRootProps()}
              className={`
                flex-1 border-2 border-dashed rounded-xl p-4
                flex items-center justify-center gap-2 cursor-pointer
                transition-all duration-200 text-center
                ${
                  isDragActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-surface-200 dark:border-dark-border hover:border-primary-400"
                }
              `}
            >
              <input {...getInputProps()} />
              <RiImageAddLine
                size={18}
                className="text-gray-300 dark:text-gray-600 shrink-0"
              />
              <p className="text-sm text-gray-400 dark:text-dark-muted">
                {isDragActive ? "Drop here" : "Change logo"}
              </p>
            </div>

            {preview && (
              <button
                type="button"
                onClick={() => {
                  setLogo(null);
                  setPreview(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
              >
                <RiCloseLine size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Name</label>
          <input
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "At least 2 characters" },
            })}
            type="text"
            className={`input ${errors.name ? "input-error" : ""}`}
          />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="input resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending || (!isDirty && !logo)}
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

export default OrgDetails;
