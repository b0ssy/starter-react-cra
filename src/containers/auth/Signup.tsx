import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import SignupByEmailPassword from "../../components/auth/SignupByEmailPassword";
import VerifyCode from "../../components/auth/VerifyCode";
import { useAuth } from "../../lib/auth";
import { CONFIG } from "../../config";
import Overlay from "../../components/Overlay";

export default function Signup() {
  const auth = useAuth();
  const navigate = CONFIG.useNavigate();
  const [component, setComponent] = useState<
    | { type: "signup" }
    | {
        type: "verifyCode";
        email: string;
        success?: boolean;
      }
  >({ type: "signup" });
  return (
    <>
      {component.type === "signup" && (
        <SignupByEmailPassword
          onSignup={async (email, password, options) => {
            await auth.signupByEmailPw(email, password, {
              firstName: options.firstName,
              lastName: options.lastName,
            });
            setComponent({ type: "verifyCode", email });
          }}
          onBack={() => navigate.back()}
        />
      )}
      {component.type === "verifyCode" && (
        <>
          <VerifyCode
            codeLength={6}
            email={component.email}
            onVerifyCode={async (email, code) => {
              await auth.verifySignupByEmail(email, code);
              setComponent({ type: "verifyCode", email, success: true });
              setTimeout(() => {
                auth.setLastEnteredUsername(email);
                navigate.route("/login");
              }, 2000);
            }}
            onResendCode={async (email) => {
              await auth.verifySignupResendByEmail(email);
            }}
          />

          {/* Success message */}
          <Overlay open={component.success}>
            <div className="paper p-8">
              <div className="flex flex-row items-center">
                <CheckCircleIcon className="inline w-8 h-8 mr-2 text-success-400" />
                <span className="text text-success-400 text-xl">
                  Signup Successful!
                </span>
              </div>
              <div className="mt-2 text text-disabled text-md">
                Redirecting you to login screen...
              </div>
            </div>
          </Overlay>
        </>
      )}
    </>
  );
}
