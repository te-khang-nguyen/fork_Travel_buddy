import { store } from "@/libs/store";
import { Box } from "@mui/material";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import '../app/globals.css';


const MainContent = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default function App(props: AppProps) {
  return (
    <Box sx={{ height:'100vh',}}>
      <MainContent {...props} />
    </Box>
  );
}
