import { useState } from "react";

import Input from "../Input";
import Spinner from "../Spinner";
import Button from "../Button";
import Overlay from "../Overlay";

export interface LoginByUsernamePasswordProps {
  initialUsername?: string;
  onLogin: (username: string, password: string) => Promise<void>;
  onUsernameChanged?: (username: string) => void;
  onForgotPasswordClicked?: () => void;
  onSignupClicked?: () => void;
}

export default function LoginByUsernamePassword(
  props: LoginByUsernamePasswordProps
) {
  const [username, setUsername] = useState(props.initialUsername ?? "");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{
    [k in "username" | "password" | "login"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  let usernameRef: HTMLInputElement | null = null;
  let passwordRef: HTMLInputElement | null = null;

  async function login() {
    if (!username) {
      usernameRef?.focus();
      setErr({ username: `Please enter a valid username` });
      return;
    }
    if (!password) {
      passwordRef?.focus();
      setErr({ password: "Please enter a valid password" });
      return;
    }
    setErr({});

    setLoading(true);
    await props.onLogin(username, password).catch((err: Error) => {
      setErr({ login: err.message ?? "Incorrect username or password" });
    });
    setLoading(false);
  }

  return (
    <>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="paper w-96 p-12">
          <div className="text text-2xl">Login to your account</div>
          <div className="h-8" />

          {/* Username input */}
          <Input
            label="Username"
            value={username}
            error={err.username ?? undefined}
            onRef={(ref) => {
              usernameRef = ref;
            }}
            onChange={(value) => {
              setUsername(value);
              if (props.onUsernameChanged) {
                props.onUsernameChanged(value);
              }
            }}
            onClearError={() => {
              setErr({});
            }}
          />

          <div className="h-4" />

          {/* Password input */}
          <Input
            autoFocus={!!username}
            type="password"
            label="Password"
            value={password}
            error={err.password ?? undefined}
            onRef={(ref) => {
              passwordRef = ref;
            }}
            onChange={(value) => {
              setPassword(value);
            }}
            onClearError={() => {
              setErr({});
            }}
            onEnterPressed={() => {
              if (username && password) {
                login();
              }
            }}
          />

          {/* Login error */}
          {!!err.login && (
            <div className="py-2 text-error text-sm">{err.login}</div>
          )}

          {/* Forgot password? */}
          {props.onForgotPasswordClicked && (
            <div className="flex flex-row mt-1">
              <div className="flex-grow" />
              <Button
                variant="text"
                size="sm"
                className="text-dim"
                onClick={props.onForgotPasswordClicked}
              >
                Forgot password?
              </Button>
            </div>
          )}

          {/* Login button */}
          <div className={props.onForgotPasswordClicked ? "h-8" : "h-12"} />
          <div className="flex flex-row items-center">
            <Button className="w-full" onClick={login}>
              Login
            </Button>
          </div>

          {/* Signup button */}
          {props.onSignupClicked && (
            <>
              <div className="divider my-8" />
              <Button
                variant="outlined"
                size="sm"
                className="w-full text-dim"
                onClick={props.onSignupClicked}
              >
                New here? Click to signup
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Spinner */}
      <Overlay open={loading}>
        <Spinner />
      </Overlay>
    </>
  );
}
