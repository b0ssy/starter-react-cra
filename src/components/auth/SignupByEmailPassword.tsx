import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import Input from "../Input";
import Spinner from "../Spinner";
import Button from "../Button";
import Overlay from "../Overlay";
import { isValidEmail } from "../../lib/utils";

export interface SignupByEmailPasswordProps {
  onSignup: (
    email: string,
    password: string,
    options: {
      firstName?: string;
      lastName?: string;
    }
  ) => Promise<void>;
  onBack?: () => void;
}

export default function SignupByEmailPassword(
  props: SignupByEmailPasswordProps
) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [err, setErr] = useState<{
    [k in "email" | "password" | "confirmPassword" | "signup"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  let emailRef: HTMLInputElement | null = null;
  let passwordRef: HTMLInputElement | null = null;
  let confirmPasswordRef: HTMLInputElement | null = null;

  async function signup() {
    setErr({});
    if (!email) {
      emailRef?.focus();
      setErr({ email: "Please enter a valid email" });
      return;
    }
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
    if (confirmPassword !== password) {
      confirmPasswordRef?.focus();
      setErr({ confirmPassword: "Please match your password" });
      return;
    }

    setLoading(true);
    await props
      .onSignup(email, password, {
        firstName,
        lastName,
      })
      .catch((err: Error) => {
        setErr({
          signup: err.message ?? "Failed to signup",
        });
      });
    setLoading(false);
  }

  return (
    <>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="paper w-96 p-12">
          {/* Back button */}
          {props.onBack && (
            <>
              <ArrowLeftIcon
                className="text w-5 h-5 cursor-pointer"
                onClick={props.onBack}
              />
              <div className="h-6" />
            </>
          )}

          <div className="text text-2xl">Signup for an account</div>
          <div className="h-8" />

          {/* Email input */}
          <Input
            autoFocus
            label="Email"
            value={email}
            error={err.email ?? ""}
            onRef={(ref) => {
              emailRef = ref;
            }}
            onClearError={() => {
              setErr({});
            }}
            onChange={(value) => {
              setEmail(value);
            }}
          />

          {/* Password input */}
          <div className="h-4" />
          <Input
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
            error={err.confirmPassword ?? ""}
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

          {/* First name input */}
          <div className="h-4" />
          <Input
            label="First Name"
            value={firstName}
            onChange={(value) => {
              setFirstName(value);
            }}
            onClearError={() => {
              setErr({});
            }}
          />

          {/* Last name input */}
          <div className="h-4" />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(value) => {
              setLastName(value);
            }}
            onClearError={() => {
              setErr({});
            }}
          />

          {!!err.signup && (
            <div className="mt-4 py-1 text-error text-sm">{err.signup}</div>
          )}

          {/* Signup button */}
          <div className="h-12" />
          <div className="flex flex-row items-center">
            <Button className="w-full" onClick={signup}>
              Signup
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
