// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { RiCheckboxCircleLine } from "react-icons/ri";

const AppLoader = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          }}
          className="
            fixed inset-0 z-[9999]
            bg-white dark:bg-dark-bg
            flex flex-col items-center justify-center gap-6
          "
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                w-14 h-14 rounded-2xl bg-primary-500
                flex items-center justify-center
                shadow-green
              "
            >
              <RiCheckboxCircleLine size={30} className="text-white" />
            </motion.div>
            <span className="font-black text-3xl tracking-tight">
              <span className="text-primary-500">SBE</span>
              <span className="text-gray-900 dark:text-white"> Vote</span>
            </span>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-48 h-1 bg-surface-200 dark:bg-dark-border rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 bg-primary-500 rounded-full"
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-400 dark:text-dark-muted"
          >
            Secure · Anonymous · Real-time
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLoader;
