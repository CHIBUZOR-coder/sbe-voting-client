import { useState } from "react";
import { useDropzone } from "react-dropzone";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RiCloseLine,
  RiSearchLine,
  RiUserLine,
  RiImageAddLine,
  RiLoader4Line,
  RiDeleteBinLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiUserAddLine,
  RiMegaphoneLine,
} from "react-icons/ri";
import api from "../../lib/api";

// ── Accepted image types ───────────────────────────────────────
const acceptedTypes = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

// ── Photo dropzone ─────────────────────────────────────────────
const PhotoDropzone = ({ onPhotoSelected, photo, existingUrl }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length > 0) onPhotoSelected(accepted[0]);
    },
  });

  // Show new preview, existing avatar, or empty dropzone
  const previewSrc = photo ? URL.createObjectURL(photo) : existingUrl || null;

  return (
    <div
      {...getRootProps()}
      title={existingUrl && !photo ? "Click to change photo" : "Upload photo"}
      className={`
        w-14 h-14 rounded-xl border-2 border-dashed cursor-pointer
        flex items-center justify-center shrink-0 overflow-hidden
        transition-all duration-200 relative group
        ${
          isDragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : previewSrc
              ? "border-primary-500/30 hover:border-primary-500"
              : "border-surface-300 dark:border-dark-border hover:border-primary-400"
        }
      `}
    >
      <input {...getInputProps()} />
      {previewSrc ? (
        <>
          <img
            src={previewSrc}
            alt="preview"
            className="w-full h-full object-cover"
          />
          {/* Hover overlay — hints user can click to change */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <RiImageAddLine size={16} className="text-white" />
          </div>
        </>
      ) : (
        <RiImageAddLine
          size={18}
          className="text-gray-300 dark:text-gray-600"
        />
      )}
    </div>
  );
};

// ── Search result row ──────────────────────────────────────────
const SearchResultRow = ({ user, onAdd, adding }) => {
  const [photo, setPhoto] = useState(null);
  console.log("user:", user);

  // Enabled if user has an existing avatar OR a new photo is selected
  const hasPhoto = photo || (user.avatarUrl && user.avatarUrl.trim() !== "");

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border">
      {/* Photo dropzone — shows existing avatar as default */}
      <PhotoDropzone
        onPhotoSelected={setPhoto}
        photo={photo}
        existingUrl={user.avatarUrl}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {user.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-dark-muted truncate">
          {user.email}
        </p>
        {/* Hint only for users with no avatar and no uploaded photo */}
        {!user.avatarUrl && !photo && (
          <p className="text-xs text-yellow-500 mt-0.5">
            Upload a photo to add
          </p>
        )}
      </div>

      {/* Add button — disabled if no photo at all */}
      <button
        onClick={() => onAdd(user, photo)}
        disabled={!hasPhoto || adding}
        className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        {adding ? (
          <RiLoader4Line size={12} className="animate-spin" />
        ) : (
          <RiUserAddLine size={12} />
        )}
        Add
      </button>
    </div>
  );
};

// ── Candidate row ──────────────────────────────────────────────
const CandidateRow = ({ candidate, onRemove, removing }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-dark-bg border border-surface-200 dark:border-dark-border">
    <img
      src={candidate.photoUrl}
      alt={candidate.user?.name}
      className="w-10 h-10 rounded-xl object-cover shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
        {candidate.user?.name}
      </p>
    </div>
    <button
      onClick={() => onRemove(candidate.id)}
      disabled={removing === candidate.id}
      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      {removing === candidate.id ? (
        <RiLoader4Line size={14} className="animate-spin" />
      ) : (
        <RiDeleteBinLine size={14} />
      )}
    </button>
  </div>
);

// ── Manage Candidates Modal ────────────────────────────────────
const ManageCandidatesModal = ({ campaign, onClose }) => {
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();

  // ── Fetch existing candidates ────────────────────────────────
  const { data: candidatesData, isLoading: loadingCandidates } = useQuery({
    queryKey: ["campaign-candidates", campaign.id],
    queryFn: async () => {
      const res = await api.get(`/api/campaigns/${campaign.id}`);
      return res.data.data.candidates ?? [];
    },
  });

  const candidates = candidatesData ?? [];

  // ── Search users ─────────────────────────────────────────────
  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ["user-search", search],
    enabled: search.trim().length >= 2,
    queryFn: async () => {
      const res = await api.get(
        `/api/users/search?q=${encodeURIComponent(search.trim())}`,
      );
      console.log("🔍 Search results:", res.data.data);
      console.log("data", res.data);

      return res.data.data ?? [];
    },
    placeholderData: [],
  });

  // Filter out already added candidates
  const existingIds = new Set(candidates.map((c) => c.user?.id));
  const filteredResults = (searchResults ?? []).filter(
    (u) => !existingIds.has(u.id),
  );

  // ── Add candidate mutation ───────────────────────────────────
  const { mutate: addCandidate } = useMutation({
    mutationFn: async ({ user, photo }) => {
      const formData = new FormData();
      formData.append("userId", user.id);
      if (photo) {
        formData.append("photo", photo); // new photo uploaded
      } else {
        formData.append("useExistingAvatar", "true"); // use existing avatarUrl
      }
      await api.post(`/api/campaigns/${campaign.id}/candidates`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onMutate: ({ user }) => {
      setAddingId(user.id);
      setError("");
      setSuccess("");
    },
    onSuccess: (_, { user }) => {
      setSuccess(`${user.name} added as a candidate.`);
      setSearch("");
      queryClient.invalidateQueries({
        queryKey: ["campaign-candidates", campaign.id],
      });
      queryClient.invalidateQueries({ queryKey: ["org-manage-campaigns"] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to add candidate.");
    },
    onSettled: () => setAddingId(null),
  });

  // ── Remove candidate mutation ────────────────────────────────
  const { mutate: removeCandidate } = useMutation({
    mutationFn: (candidateId) =>
      api.delete(`/api/campaigns/${campaign.id}/candidates/${candidateId}`),
    onMutate: (id) => {
      setRemovingId(id);
      setError("");
      setSuccess("");
    },
    onSuccess: () => {
      setSuccess("Candidate removed.");
      queryClient.invalidateQueries({
        queryKey: ["campaign-candidates", campaign.id],
      });
      queryClient.invalidateQueries({ queryKey: ["org-manage-campaigns"] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to remove candidate.");
    },
    onSettled: () => setRemovingId(null),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-dark-border shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Manage Candidates
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5 truncate max-w-xs">
              {campaign.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-surface-100 dark:hover:bg-dark-bg transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Feedback */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <RiErrorWarningLine
                  size={15}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
              >
                <RiCheckboxCircleLine
                  size={15}
                  className="text-primary-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current candidates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Current Candidates
              </p>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  candidates.length >= 2
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                    : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                }`}
              >
                {candidates.length} / 2 min
              </span>
            </div>

            {loadingCandidates ? (
              <div className="flex items-center justify-center py-8">
                <RiLoader4Line
                  size={24}
                  className="text-primary-500 animate-spin"
                />
              </div>
            ) : candidates.length > 0 ? (
              <div className="space-y-2">
                {candidates.map((c) => (
                  <CandidateRow
                    key={c.id}
                    candidate={c}
                    onRemove={removeCandidate}
                    removing={removingId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-surface-200 dark:border-dark-border rounded-xl">
                <RiMegaphoneLine
                  size={24}
                  className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
                />
                <p className="text-sm text-gray-400 dark:text-dark-muted">
                  No candidates yet. Add at least 2 below.
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Search + Add */}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Add Candidate
            </p>

            {/* Search input */}
            <div className="relative mb-3">
              <RiSearchLine
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              {searching && (
                <RiLoader4Line
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Search by name or email..."
                className="input pl-9 pr-9"
              />
            </div>

            {/* Search results */}
            <AnimatePresence>
              {search.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {filteredResults.length > 0 ? (
                    <div className="space-y-2">
                      {filteredResults.map((user) => (
                        <SearchResultRow
                          key={user.id}
                          user={user}
                          onAdd={(u, photo) => addCandidate({ user: u, photo })}
                          adding={addingId === user.id}
                        />
                      ))}
                    </div>
                  ) : !searching ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400 dark:text-dark-muted">
                        No users found matching &quot;{search}&quot;
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>

            {search.trim().length > 0 && search.trim().length < 2 && (
              <p className="text-xs text-gray-400 dark:text-dark-muted text-center">
                Type at least 2 characters to search
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-surface-200 dark:border-dark-border shrink-0">
          <p className="text-xs text-gray-400 dark:text-dark-muted text-center">
            {candidates.length >= 2
              ? "✅ Ready to activate — you have at least 2 candidates."
              : `Add ${2 - candidates.length} more candidate${2 - candidates.length > 1 ? "s" : ""} to activate this campaign.`}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageCandidatesModal;
