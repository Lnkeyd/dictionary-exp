import React, { useContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { Provider } from "react-redux";
import { createTheme, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';

const theme = createTheme({
  components: {
    Table: {
      styles: (theme) => ({
        td: {
          padding: "8px",
          border: `1px solid ${theme.colors.gray[3]}`,
          wordBreak: "break-word",
        },
        th: {
          backgroundColor: theme.colors.gray[1],
          fontWeight: 600,
          textAlign: "left",
        },
      }),
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </MantineProvider>
  </React.StrictMode>
);
