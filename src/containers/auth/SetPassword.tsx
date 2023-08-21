import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import SetPasswordComponent from "../../components/auth/SetPassword";
import { useAuth } from "../../lib/auth";
import { CONFIG } from "../../config";
import Overlay from "../../components/Overlay";

export default function SetPassword() {
  const auth = useAuth();
  const location = CONFIG.useLocation();
  const navigate = CONFIG.useNavigate();
  const [openSuccess, setOpenSuccess] = useState(false);

  const parts = location.pathname.split("/");
  const token = parts.length >= 3 ? parts[2] : "";

  return (
    <>
      <SetPasswordComponent
        token={token}
        onSetPassword={async (token, pw) => {
          await auth.setpw(token, pw);
          setOpenSuccess(true);
          setTimeout(() => {
            navigate.route("/login");
          }, 2000);
        }}
      />

      {/* Success message */}
      <Overlay open={openSuccess}>
        <div className="paper p-8">
          <div className="flex flex-row items-center">
            <CheckCircleIcon className="inline w-8 h-8 mr-2 text-success-400" />
            <span className="text text-success-400 text-xl">
              Set Password Successful!
            </span>
          </div>
          <div className="mt-2 text text-disabled text-md">
            Redirecting you to login screen...
          </div>
        </div>
      </Overlay>
    </>
  );
}
