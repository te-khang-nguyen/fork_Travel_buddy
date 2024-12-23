import { store } from "@/libs/store";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";
import { useRouter } from "next/router";
import DrawerLayout from "@/app/Layout/SideBarWrapper";
import { ThemeProvider } from "@mui/material";
import theme from "@/app/theme";
import {
  GlobalContextProvider,
} from "@/app/GlobalContextProvider";

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();


  // Define pages where the drawer button is visible
  const showDrawerButton = ![
    "/recovery",
    "/",
    "/login/business",
    "/register",
  ].includes(router.pathname); //Move this to another file as enum/ variable
  return (
    <GlobalContextProvider>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DrawerLayout showDrawerButton={showDrawerButton} >
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
