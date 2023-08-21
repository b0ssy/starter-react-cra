import { useState } from "react";

import Spinner from "../Spinner";
import Button from "../Button";
import Overlay from "../Overlay";
import Input from "../Input";

export interface SetPasswordProps {
  token: string;
  onSetPassword: (token: string, password: string) => Promise<void>;
}

export default function SetPassword(props: SetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<{
    [k in "password" | "confirmPassword" | "setpw"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  let passwordRef: HTMLInputElement | null = null;
  let confirmPasswordRef: HTMLInputElement | null = null;

  async function setPasswordQuery() {
    setErr({});
    if (!password) {
      passwordRef?.focus();
      setErr({ password: "Please enter a valid password" });
      return;
    }
    if (confirmPassword !== password) {
      confirmPasswordRef?.focus();
      setErr({ confirmPassword: "Please match your password" });
      return;
    }

    setLoading(true);
    await props.onSetPassword(props.token, password).catch((err: Error) => {
      setErr({ setpw: err.message ?? "Failed to set password" });
    });
    setLoading(false);
  }

  return (
    <>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="paper w-96 p-12">
          <div className="text text-2xl">Set your password</div>
          <div className="h-4" />

          {/* Password input */}
          <div className="h-4" />
          <Input
            autoFocus
            type="password"
            autoComplete="new-password"
            label="Password"
            value={password}
            error={err.password ?? ""}
            onRef={(ref) => {
              passwordRef = ref;
            }}
            onChange={(value) => {
              setPassword(value);
            }}
            onClearError={() => {
              setErr({});
            }}
          />

          {/* Confirm password input */}
          <div className="h-4" />
          <Input
            type="password"
            autoComplete="new-password"
            label="Confirm Password"
            value={confirmPassword}
            onRef={(ref) => {
              confirmPasswordRef = ref;
            }}
            onChange={(value) => {
              setConfirmPassword(value);
            }}
            onClearError={() => {
              setErr({});
            }}
          />
          {!!err.confirmPassword && (
            <div className="py-1 text-error text-sm">{err.confirmPassword}</div>
          )}

          {!!err.setpw && (
            <div className="mt-4 py-1 text-error text-sm">{err.setpw}</div>
          )}

          {/* Signup button */}
          <div className="h-12" />
          <div className="flex flex-row items-center">
            <Button className="w-full" onClick={setPasswordQuery}>
              Set Password
            </Button>
          </div>
        </div>
      </div>

      {/* Spinner */}
      <Overlay open={loading}>
        <Spinner />
      </Overlay>
    </>
  );
}
