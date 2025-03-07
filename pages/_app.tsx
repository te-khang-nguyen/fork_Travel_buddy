import { store } from "@/libs/store";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";
import { useRouter } from "next/router";
import MenuBarsLayout from "@/app/Layout/MenuBarsWrapper";
import { ThemeProvider, createTheme } from "@mui/material";
import theme from "@/app/theme";
import { GlobalContextProvider } from "@/app/GlobalContextProvider";
import withAuthRedirect from "@/app/Layout/WithAuthRedirect";
import { Roboto } from 'next/font/google';
import { MetadataProvider } from "@/app/Layout/MetadataContextWrapper";
// import { PageProvider } from "@/app/Layout/DynamicUiTracker";

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '700']
});

const NO_DRAWER_BUTTON_PAGES = [
  "/recovery",
  "/",
  "/docs",
  "/login/business",
  "/register",
  "/story/[story_id]",
  "/story"
];

const THEME = createTheme({
  ...theme,
  typography: {
    "fontFamily": roboto.style.fontFamily,
  }
})

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  // const showDrawerButton = !NO_DRAWER_BUTTON_PAGES.includes(router.pathname);
  const showMenuBars = !NO_DRAWER_BUTTON_PAGES.includes(router.pathname);

  return (
    <GlobalContextProvider>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          {/* <PageProvider> */}
          <MetadataProvider>
            <MenuBarsLayout showMenuBars={showMenuBars}>
              <Component {...pageProps} />
            </MenuBarsLayout>
          </MetadataProvider>
          {/* </PageProvider> */}
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
