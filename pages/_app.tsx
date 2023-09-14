import "../styles/globals.css";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import Head from "next/head";
import { ThemeProvider } from "next-themes";

function MyApp({ Component, pageProps }) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeProvider attribute="class">
        <SessionContextProvider
          supabaseClient={supabase}
          initialSession={pageProps.initialSession}
        >
          {/* <SWRConfig
            value={{
              refreshInterval: 750,
            }}
          > */}
          {isMounted && <Component {...pageProps} />}
          {/* </SWRConfig> */}
        </SessionContextProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
// @ts-ignore
if (typeof window !== "undefined" && window.electronApi) {
  window.addEventListener("click", function (e) {
    // @ts-ignore
    if (e.target.tagName === "A" && e.target.href.startsWith("http")) {
      // @ts-ignore
      window.electronApi.send("ipc-open", e.target.href);
    }
  });
}
