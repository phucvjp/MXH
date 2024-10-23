import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MessagesScreen } from "./webPages/MessagePage/messages-screen.tsx";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { store } from "./redux/store.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Register from "./webPages/AuthenPage/Register.tsx";
import Login from "./webPages/AuthenPage/Login.tsx";
import UserProfile from "./webPages/UserProfile/UserProfile.tsx";
import HomeScreen from "./webPages/HomePage/home-screen.tsx";
import { Header } from "./webPages/Header.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route>
                <Route
                  path="/"
                  element={
                    <>
                      <Header className="sticky"></Header>
                      <HomeScreen></HomeScreen>
                    </>
                  }
                />
                <Route
                  path="profile/:userId"
                  element={
                    <>
                      <Header className="sticky"></Header>
                      <UserProfile></UserProfile>
                    </>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <>
                      {/* <Header className="sticky"></Header> */}
                      <MessagesScreen></MessagesScreen>
                    </>
                  }
                />
              </Route>

              <Route path="login" element={<Login></Login>} />
              <Route path="register" element={<Register></Register>} />
              <Route path="*" element={<div>404</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" />
      </Provider>
    </QueryClientProvider>
  </>
);
