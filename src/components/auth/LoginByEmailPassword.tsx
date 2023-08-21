import { useState } from "react";

import Input from "../Input";
import Spinner from "../Spinner";
import Button from "../Button";
import Overlay from "../Overlay";
import { isValidEmail } from "../../lib/utils";

export interface LoginByEmailPasswordProps {
  initialEmail?: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onEmailChanged?: (email: string) => void;
  onForgotPasswordClicked?: () => void;
  onSignupClicked?: () => void;
}

export default function LoginByEmailPassword(props: LoginByEmailPasswordProps) {
  const [email, setEmail] = useState(props.initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{
    [k in "email" | "password" | "login"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  let emailRef: HTMLInputElement | null = null;
  let passwordRef: HTMLInputElement | null = null;

  async function login() {
    if (!isValidEmail(email)) {
      emailRef?.focus();
      setErr({ email: "Please enter a valid email" });
      return;
    }
    if (!password) {
      passwordRef?.focus();
      setErr({ password: "Please enter a valid password" });
      return;
    }
    setErr({});

    setLoading(true);
    await props.onLogin(email, password).catch((err: Error) => {
      setErr({ login: err.message ?? "Incorrect email or password" });
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

          {/* Email input */}
          <Input
            label="Email"
            value={email}
            error={err.email ?? undefined}
            onRef={(ref) => {
              emailRef = ref;
            }}
            onChange={(value) => {
              setEmail(value);
              if (props.onEmailChanged) {
                props.onEmailChanged(value);
              }
            }}
            onClearError={() => {
              setErr({});
            }}
          />

          <div className="h-4" />

          {/* Password input */}
          <Input
            autoFocus={!!email}
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
              if (email && password) {
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
