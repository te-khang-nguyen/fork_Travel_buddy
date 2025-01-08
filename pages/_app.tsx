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
import { getCookie } from "cookies-next";

const NO_DRAWER_BUTTON_PAGES = [
  "/recovery",
  "/",
  "/login/business",
  "/register",
];

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();


      const publicPaths = ["/", "/login/business", "/register"]; // Define public paths

      const role = getCookie("role");

      if (!user && !publicPaths.includes(router.pathname)) {
        await router.replace("/");
      } else if (user && role && publicPaths.includes(router.pathname)) {
        await router.replace("/dashboard/user");
      }
    };

    checkUser();
  }, [router.pathname]);

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
