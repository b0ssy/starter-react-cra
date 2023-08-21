import LoginByUsernamePassword from "../../components/auth/LoginByUsernamePassword";
import { useAuth } from "../../lib/auth";
import { CONFIG } from "../../config";

export default function Login() {
  const navigate = CONFIG.useNavigate();
  const auth = useAuth();
  return (
    <LoginByUsernamePassword
      initialUsername={auth.lastEnteredUsername}
      onLogin={async (username, password) => {
        await auth.loginByUsername(username, password, {
          hasRoleNames: ["admin"],
        });
      }}
      onUsernameChanged={(username) => {
        auth.setLastEnteredUsername(username);
      }}
      onForgotPasswordClicked={() => {
        navigate.route("/resetpw");
      }}
      onSignupClicked={() => {
        navigate.route("/signup");
      }}
    />
  );
}
