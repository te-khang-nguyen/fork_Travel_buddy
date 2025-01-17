import { store } from "@/libs/store";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";
import { useRouter } from "next/router";
import DrawerLayout from "@/app/Layout/SideBarWrapper";
import { ThemeProvider } from "@mui/material";
import theme from "@/app/theme";
import { GlobalContextProvider } from "@/app/GlobalContextProvider";
import withAuthRedirect from "@/app/Layout/WithAuthRedirect";

const NO_DRAWER_BUTTON_PAGES = [
  "/recovery",
  "/",
  "/login/business",
  "/register",
];

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

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

// Wrap the MainContent component with withAuthRedirect HOC
const MainContentWithAuth = withAuthRedirect(MainContent);

export default function App(props: AppProps) {
  return <MainContentWithAuth {...props} />;
}
