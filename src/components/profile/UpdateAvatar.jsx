import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  RiImageAddLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiCloseLine,
} from "react-icons/ri";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

// ── Accepted file types ────────────────────────────────────────
const acceptedTypes = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const UpdateAvatar = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Dropzone ──────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted, rejected) => {
      setSuccessMsg("");
      setErrorMsg("");
      if (rejected.length > 0) {
        setErrorMsg("File must be JPEG, PNG or WEBP and under 5MB.");
        return;
      }
      if (accepted.length > 0) {
        setFile(accepted[0]);
        setPreview(URL.createObjectURL(accepted[0]));
      }
    },
  });

  // ── Upload mutation ────────────────────────────────────────────
  const { mutate: uploadAvatar, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.patch("/api/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccessMsg("Avatar updated successfully!");
      setFile(null);
      setPreview(null);
    },
    onError: (error) => {
      setErrorMsg(
        error.response?.data?.message || "Upload failed. Please try again.",
      );
    },
  });

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          Profile Photo
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          JPEG, PNG or WEBP · Max 5MB
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* ── Current / Preview avatar ──────────────────────── */}
        <div className="shrink-0">
          {preview || user?.avatarUrl ? (
            <img
              src={preview || user.avatarUrl}
              alt="Avatar preview"
              className={`
                w-24 h-24 rounded-2xl object-cover
                ring-4 ring-primary-500/20
                ${preview ? "ring-primary-500/50" : ""}
              `}
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary-500 text-white flex items-center justify-center text-3xl font-black ring-4 ring-primary-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* ── Dropzone ──────────────────────────────────────── */}
        <div className="flex-1 w-full">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6
              flex flex-col items-center justify-center gap-2
              cursor-pointer transition-all duration-200 text-center
              ${
                isDragActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-surface-200 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-700"
              }
            `}
          >
            <input {...getInputProps()} />
            <RiImageAddLine
              size={28}
              className={
                isDragActive
                  ? "text-primary-500"
                  : "text-gray-300 dark:text-gray-600"
              }
            />
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              {isDragActive
                ? "Drop your image here"
                : "Drag & drop or click to select"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action buttons (shown when file is selected) ──── */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => uploadAvatar()}
              disabled={isPending}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <RiLoader4Line size={14} className="animate-spin" />{" "}
                  Uploading...
                </>
              ) : (
                "Save Photo"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="btn-ghost text-sm flex items-center gap-1.5"
            >
              <RiCloseLine size={16} />
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback messages ────────────────────────────────── */}
      <AnimatePresence>
        {successMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400"
          >
            <RiCheckboxCircleLine size={16} />
            {successMsg}
          </motion.p>
        )}
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-500"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpdateAvatar;
