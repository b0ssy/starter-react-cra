import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import Input from "../Input";
import Spinner from "../Spinner";
import Button from "../Button";
import Overlay from "../Overlay";
import { isValidEmail } from "../../lib/utils";

export interface ResetPasswordProps {
  onResetPassword: (email: string) => Promise<void>;
  onBack?: () => void;
}

export default function ResetPassword(props: ResetPasswordProps) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<{
    [k in "email" | "resetpw"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  let emailRef: HTMLInputElement | null = null;

  async function resetPassword() {
    setErr({});
    if (!email || !isValidEmail(email)) {
      emailRef?.focus();
      setErr({ email: "Please enter a valid email" });
      return;
    }

    setLoading(true);
    await props.onResetPassword(email).catch((err: Error) => {
      setErr({ resetpw: err.message ?? "Failed to reset password" });
    });
    setLoading(false);
  }

  return (
    <>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="relative paper w-96 p-12">
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

          <div className="text text-2xl">Enter your email</div>
          <div className="text text-sm text-disabled mt-4">
            We will send a verification code to your email to reset your
            password
          </div>
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
            onChange={(value) => {
              setEmail(value);
            }}
            onEnterPressed={() => {
              resetPassword();
            }}
            onClearError={() => {
              setErr({});
            }}
          />
          {!!err.resetpw && (
            <div className="py-1 text-error text-sm">{err.resetpw}</div>
          )}

          {/* Signup button */}
          <div className="h-12" />
          <div className="flex flex-row items-center">
            <Button className="w-full" onClick={resetPassword}>
              Reset Password
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
