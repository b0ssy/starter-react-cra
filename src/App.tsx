import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import AppGlobal from "./components/AppGlobal";
import Header from "./containers/Header";
import Home from "./containers/Home";
import Login from "./containers/auth/Login";
import Signup from "./containers/auth/Signup";
import ResetPassword from "./containers/auth/ResetPassword";
import SetPassword from "./containers/auth/SetPassword";
import { Auth, AuthContext, LoggedIn, LoggedOut } from "./lib/auth";
import { Backend } from "./lib/backend";
import { store, persistor } from "./redux/store";
import { CONFIG } from "./config";

export default function App() {
  const loggedInRoutes = (
    <Routes>
      {[CONFIG.routes.home].map((route) => (
        <Route key={route} path={route} element={<Home />} />
      ))}
      <Route path="*" element={<Navigate to={CONFIG.routes.home} />} />
    </Routes>
  );
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Auth baseUrl={CONFIG.env.REACT_APP_PROXY_AUTH}>
          <AuthContext.Consumer>
            {({ session }) => (
              <Backend
                baseUrl={CONFIG.env.REACT_APP_PROXY_BACKEND}
                accessToken={session?.accessToken}
              >
                <AppGlobal>
                  <BrowserRouter>
                    {CONFIG.auth?.enabled && (
                      <>
                        <LoggedIn>{loggedInRoutes}</LoggedIn>
                        <LoggedOut>
                          <Routes>
                            <Route
                              path={CONFIG.routes.login}
                              element={<Login />}
                            />
                            <Route
                              path={CONFIG.routes.signup}
                              element={<Signup />}
                            />
                            <Route
                              path={CONFIG.routes.resetpw}
                              element={<ResetPassword />}
                            />
                            <Route
                              path={`${CONFIG.routes.setpw}/*`}
                              element={<SetPassword />}
                            />
                            <Route
                              path="*"
                              element={<Navigate to={CONFIG.routes.login} />}
                            />
                          </Routes>
                        </LoggedOut>
                      </>
                    )}
                    {!CONFIG.auth?.enabled && loggedInRoutes}
                    <Header />
                  </BrowserRouter>
                </AppGlobal>
              </Backend>
            )}
          </AuthContext.Consumer>
        </Auth>
      </PersistGate>
    </Provider>
  );
}
