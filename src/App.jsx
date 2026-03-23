import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useThemeStore from "./store/themeStore";
import AppLoader from "./Apploader";


const App = () => {
  const { isDark } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);

  // Apply dark class on mount and when theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Show loader for 2 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AppLoader isLoading={isLoading} />
      <Outlet />
    </>
  );
};

export default App;
