import { useState } from "react";

import ResetPasswordComponent from "../../components/auth/ResetPassword";
import VerifyCode from "../../components/auth/VerifyCode";
import { useAuth } from "../../lib/auth";
import { CONFIG } from "../../config";

export default function ResetPassword() {
  const auth = useAuth();
  const navigate = CONFIG.useNavigate();
  const [component, setComponent] = useState<
    | { type: "resetpw" }
    | {
        type: "verifyCode";
        email: string;
      }
  >({ type: "resetpw" });
  return (
    <>
      {component.type === "resetpw" && (
        <ResetPasswordComponent
          onResetPassword={async (email) => {
            await auth.resetpwByEmail(email);
            setComponent({ type: "verifyCode", email });
          }}
          onBack={() => navigate.back()}
        />
      )}
      {component.type === "verifyCode" && (
        <VerifyCode
          codeLength={6}
          email={component.email}
          onVerifyCode={async (email, code) => {
            const data = await auth.verifyResetpwByEmail(email, code);
            auth.setLastEnteredUsername(email);
            navigate.route("/setpw", data.setpwToken);
          }}
          onResendCode={async (email) => {
            await auth.resetpwByEmail(email);
          }}
        />
      )}
    </>
  );
}
