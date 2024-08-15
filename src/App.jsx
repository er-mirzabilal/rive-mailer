import "./index.css";
import RiveMailingList from "./components/RiveMailingList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex items-center justify-center">
        <div className="RiveContainer">
          <RiveMailingList />
        </div>
      </div>
    </QueryClientProvider>
  );
}
