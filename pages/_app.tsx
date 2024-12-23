import { store } from "@/libs/store";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";
import { useRouter } from "next/router";
import DrawerLayout from "@/app/Layout/SideBarWrapper";
import { ThemeProvider } from "@mui/material";
import theme from "@/app/theme";
import { GlobalContextProvider } from "@/app/GlobalContextProvider";
import { supabase } from "@/libs/supabase/supabase_client";
import { useEffect } from "react";

const NO_DRAWER_BUTTON_PAGES = [
  "/recovery",
  "/",
  "/login/business",
  "/register",
];

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session && router.pathname !== "/") {
        router.replace("/");
      } else if (session && router.pathname === "/") {
        router.replace("/dashboard/user");
      }
    };

    checkSession();
  }, []);

  const showDrawerButton = !NO_DRAWER_BUTTON_PAGES.includes(router.pathname);

  return (
    <GlobalContextProvider>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DrawerLayout showDrawerButton={showDrawerButton}>
            <Component {...pageProps} />
          </DrawerLayout>
        </ThemeProvider>
      </Provider>
    </GlobalContextProvider>
  );
};

export default function App(props: AppProps) {
  return <MainContent {...props} />;
}
