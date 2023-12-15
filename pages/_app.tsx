import Home from ".";
import "../styles/global.css";
import "../styles/Dropdown.css";
import { useRouter } from "next/router";
import Custom500 from "./500";
import Custom404 from "./404";
import Login from "./login";
import { NextUIProvider } from "@nextui-org/react";
import Register from "./register";
import Analytics from "./analytics";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  if (router.pathname.startsWith("/login")) {
    return (
      <NextUIProvider>
        <Login />
      </NextUIProvider>
    );
  }

  if (router.pathname.startsWith("/register")) {
    return (
      <NextUIProvider>
        <Register />
      </NextUIProvider>
    );
  }

  if (router.pathname.startsWith("/analytics")) {
    return (
      <NextUIProvider>
        <Analytics {...pageProps} />
      </NextUIProvider>
    );
  }

  if (router.pathname.startsWith("/500")) {
    return Custom500();
  }

  if (router.pathname.startsWith("/404")) {
    return Custom404();
  }

  return <Home {...pageProps} />;
}
