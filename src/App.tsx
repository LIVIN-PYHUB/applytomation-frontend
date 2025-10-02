import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import Routes from "./routes/Routes";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#3C83F6", // 🔴 change primary color here
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Routes />
        </QueryClientProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
