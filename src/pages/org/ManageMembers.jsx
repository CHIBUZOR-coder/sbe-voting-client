import { useState } from "react";
import { useForm } from "react-hook-form";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiTeamLine,
  RiUserAddLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiMailLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import api from "../../lib/api";
// import useAuthStore from "../../store/authStore";

// ── Member row ─────────────────────────────────────────────────
const MemberRow = ({ member, onRemove, removingId, isOwner }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -16 }}
    className="flex items-center gap-3 py-3 border-b border-surface-200 dark:border-dark-border last:border-0"
  >
    {/* Avatar */}
    {member.user?.avatarUrl ? (
      <img
        src={member.user.avatarUrl}
        alt={member.user.name}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    ) : (
      <div className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
        {member.user?.name?.charAt(0).toUpperCase()}
      </div>
    )}

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
        {member.user?.name}
        {isOwner && (
          <span className="ml-2 text-xs font-normal text-primary-500">
            (Owner)
          </span>
        )}
      </p>
      <p className="text-xs text-gray-400 dark:text-dark-muted truncate flex items-center gap-1">
        <RiMailLine size={10} />
        {member.user?.email}
      </p>
    </div>

    {/* Remove button — not shown for owner */}
    {!isOwner && (
      <button
        onClick={() => onRemove(member.user.id)}
        disabled={removingId === member.user.id}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
      >
        {removingId === member.user.id ? (
          <RiLoader4Line size={15} className="animate-spin" />
        ) : (
          <RiDeleteBinLine size={15} />
        )}
      </button>
    )}
  </motion.div>
);

// ── Manage Members ─────────────────────────────────────────────
const ManageMembers = ({ org }) => {
//   const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors},
  } = useForm();

  // Fetch members
  const { data, isLoading } = useQuery({
    queryKey: ["org-members", org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const res = await api.get(`/api/orgs/${org.id}/members`);
      return res.data.data;
    },
  });

  const members = data ?? [];

  // Add member mutation
  const {
    mutate: addMember,
    isPending: adding,
    isSuccess: added,
  } = useMutation({
    mutationFn: async ({ email }) => {
      await api.post(`/api/orgs/${org.id}/members`, { email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-members", org?.id] });
      reset();
      setServerError("");
    },
    onError: (error) => {
      setServerError(error.response?.data?.message || "Failed to add member.");
    },
  });

  // Remove member mutation
  const { mutate: removeMember } = useMutation({
    mutationFn: (userId) => api.delete(`/api/orgs/${org.id}/members/${userId}`),
    onMutate: (userId) => setRemovingId(userId),
    onSettled: () => {
      setRemovingId(null);
      queryClient.invalidateQueries({ queryKey: ["org-members", org?.id] });
    },
  });

  const onSubmit = ({ email }) => {
    setServerError("");
    addMember({ email });
  };

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">Members</h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Add or remove members from your organization.
        </p>
      </div>

      {/* Add member form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <label className="label">Add Member by Email</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <RiMailLine
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
              type="email"
              placeholder="member@example.com"
              className={`input pl-9 ${errors.email ? "input-error" : ""}`}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="btn-primary text-sm flex items-center gap-1.5 shrink-0"
          >
            {adding ? (
              <RiLoader4Line size={14} className="animate-spin" />
            ) : (
              <RiUserAddLine size={14} />
            )}
            Add
          </button>
        </div>

        {errors.email && <p className="error-text">{errors.email.message}</p>}

        <AnimatePresence>
          {serverError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-red-500"
            >
              {serverError}
            </motion.p>
          )}
          {added && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400"
            >
              <RiCheckboxCircleLine size={16} />
              Member added!
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {/* Member list */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <RiTeamLine size={15} className="text-primary-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {members.length} Member{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <div
                key={k}
                className="animate-pulse flex items-center gap-3 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-surface-200 dark:bg-dark-border shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-surface-200 dark:bg-dark-border rounded w-1/3" />
                  <div className="h-3 bg-surface-200 dark:bg-dark-border rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <AnimatePresence>
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                onRemove={removeMember}
                removingId={removingId}
                isOwner={member.user?.id === org?.createdById}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <RiTeamLine
              size={28}
              className="text-gray-300 dark:text-gray-600 mx-auto mb-3"
            />
            <p className="text-sm text-gray-400 dark:text-dark-muted">
              No members yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMembers;
