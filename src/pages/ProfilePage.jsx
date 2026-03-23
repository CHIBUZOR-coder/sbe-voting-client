// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ProfileHeader from "../components/profile/ProfileHeader";
import UpdateAvatar from "../components/profile/UpdateAvatar";
import UpdateProfile from "../components/profile/UpdateProfile";
import ChangePassword from "../components/profile/ChangePassword";
import AccountInfo from "../components/profile/AccountInfo";

// ── Animation ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
  }),
};

const ProfilePage = () => {
  return (
    <div className="container-page py-10">
      {/* ── Page title ─────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ──────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            <ProfileHeader />
          </motion.div>
          <motion.div
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
          >
            <AccountInfo />
          </motion.div>
        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <UpdateAvatar />
          </motion.div>
          <motion.div
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate="visible"
          >
            <UpdateProfile />
          </motion.div>
          <motion.div
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate="visible"
          >
            <ChangePassword />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
