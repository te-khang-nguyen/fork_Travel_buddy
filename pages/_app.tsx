import { store } from "@/libs/store";

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";
import DrawerLayout from "@/app/Layout";
import { useRouter } from "next/router";

const MainContent = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  // Define pages where the drawer button is visible
  const showDrawerButton = !["/", "/register"].includes(router.pathname);
  return (
      <Provider store={store}>
        <DrawerLayout showDrawerButton={showDrawerButton}>
          <Component {...pageProps} />
        </DrawerLayout>
      </Provider>
  );
};

export default function App(props: AppProps) {
  return <MainContent {...props} />;
}
