import { store } from "@/libs/store";

import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import "../app/globals.css";

const MainContent = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default function App(props: AppProps) {
  return <MainContent {...props} />;
}
