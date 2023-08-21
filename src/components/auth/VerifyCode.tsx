import { useState, useEffect, useRef, useCallback } from "react";

import Input from "../Input";
import Spinner from "../Spinner";
import Overlay from "../Overlay";
import Button from "../Button";

export interface VerifyCodeProps {
  codeLength: number;
  email: string;
  onVerifyCode: (email: string, code: string) => Promise<void>;
  onResendCode: (email: string) => Promise<void>;
}

export default function VerifyCode(props: VerifyCodeProps) {
  const codeLength = Math.max(props.codeLength, 1);

  const [codes, setCodes] = useState<{ [k: string]: string }>({});
  const [err, setErr] = useState<{
    [k in "resendCode" | "verifyCode"]?: string | null;
  }>({});
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const refs = useRef<{ [k: string]: HTMLDivElement }>({});
  const onTextFieldRef = useCallback(
    (idx: number) => (ref: HTMLDivElement | null) => {
      if (ref) {
        refs.current[`${idx}`] = ref;
      }
    },
    []
  );

  const resendCountdownTimer = useRef<NodeJS.Timer | null>(null);

  // Start countdown timer at start
  useEffect(() => {
    startResendCountdownTimer();
  }, []);

  async function verifyCode(code: string) {
    setErr({});
    if (code.length !== codeLength) {
      setErr({
        verifyCode: "Please enter a valid code",
      });
      return;
    }

    setLoading(true);
    await props.onVerifyCode(props.email, code).catch((err: Error) => {
      setErr({
        verifyCode: err.message ?? "Failed to verify code",
      });
    });
    setLoading(false);
  }

  async function resendCode() {
    setErr({});
    setLoading(true);
    let success = true;
    await props.onResendCode(props.email).catch((err: Error) => {
      success = false;
      setErr({
        resendCode: err.message ?? "Failed to resend code",
      });
    });
    setLoading(false);
    if (!success) {
      return;
    }

    startResendCountdownTimer();
  }

  function startResendCountdownTimer() {
    if (resendCountdownTimer.current) {
      clearInterval(resendCountdownTimer.current);
    }
    setResendCountdown(60);
    let countdown = 60;
    resendCountdownTimer.current = setInterval(() => {
      if (countdown > 0) {
        countdown--;
        setResendCountdown(countdown);
      } else if (resendCountdownTimer.current) {
        clearInterval(resendCountdownTimer.current);
        resendCountdownTimer.current = null;
      }
    }, 1000);
  }

  return (
    <>
      {/* Content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="paper p-12">
          <div className="text text-2xl">Please check your email</div>
          <div className="text text-disabled mt-2">
            A verification code is sent to
            <span className="font-bold">{` ${props.email}`}</span>
          </div>
          <div className="h-10" />

          <div className="flex flex-row gap-4 items-center justify-center">
            {Array.from(Array(codeLength).keys()).map((idx) => (
              <Input
                key={idx}
                className="text-center w-12 h-12"
                type="numeric"
                pattern="[0-9]*"
                value={codes[idx] ?? ""}
                autoFocus={idx === 0}
                inputProps={{
                  onMouseUp: () => {
                    const newCodes = { ...codes };
                    for (let i = idx; i <= codeLength - 1; i++) {
                      newCodes[`${i}`] = "";
                    }
                    setCodes(newCodes);
                  },
                  onPaste:
                    idx === 0
                      ? (event) => {
                          event.preventDefault();

                          const codes = event.clipboardData
                            .getData("text")
                            .replace(/[^0-9]/g, "");
                          const newCodes: { [k: string]: string } = {};
                          for (let i = 0; i < codes.length; i++) {
                            newCodes[i] = codes[i];
                          }
                          setCodes(newCodes);
                          if (codes.length === 6) {
                            const code = Array.from(Array(codeLength).keys())
                              .map((idx) => newCodes[idx])
                              .join("");
                            verifyCode(code);
                          }
                        }
                      : undefined,
                }}
                onRef={onTextFieldRef(idx)}
                onChange={(value) => {
                  setErr({});
                  value = value.replace(/[^0-9]/g, "");
                  if (value) {
                    const newCodes: { [k: string]: string } = {
                      ...codes,
                      [idx]: value.length > 1 ? value[value.length - 1] : value,
                    };
                    setCodes(newCodes);
                    if (idx < codeLength - 1 && refs.current[`${idx + 1}`]) {
                      refs.current[`${idx + 1}`].focus();
                    } else if (
                      idx === codeLength - 1 &&
                      Array.from(Array(codeLength).keys()).filter(
                        (idx) => newCodes[idx]
                      ).length === codeLength
                    ) {
                      const code = Array.from(Array(codeLength).keys())
                        .map((idx) => newCodes[idx])
                        .join("");
                      verifyCode(code);
                    }
                  }
                }}
              />
            ))}
          </div>

          {!!err.verifyCode && (
            <div className="mt-4 py-1 text-error text-sm text-center">
              {err.verifyCode}
            </div>
          )}
          {!!err.resendCode && (
            <div className="mt-4 py-1 text-error text-sm text-center">
              {err.resendCode}
            </div>
          )}

          <div className="h-4" />
          <div className="divider my-8" />
          <div className="mt-2 text text-sm text-disabled text-center">
            Did not receive code?
            <Button
              variant="text"
              size="sm"
              className={
                resendCountdown > 0 ? "text-disabled cursor-not-allowed" : ""
              }
              onClick={resendCountdown <= 0 ? resendCode : undefined}
            >
              Click to resend
              {resendCountdown > 0 ? ` in ${resendCountdown}s` : ""}
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
