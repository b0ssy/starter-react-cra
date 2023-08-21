import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { z } from "zod";

import Button from "../components/Button";
import { useForm } from "../components/Form";
import Modal from "../components/Modal";
import Popover from "../components/Popover";
import ThemeIcon from "../components/ThemeIcon";
import { useAppGlobal } from "../components/AppGlobal";
import { useAuth } from "../lib/auth";
import { useDispatch, useSelector } from "../redux/store";
import { CONFIG } from "../config";

export default function Header() {
  const themeMode = useSelector((state) => state.app.themeMode);
  const dispatch = useDispatch();
  const location = CONFIG.useLocation();
  const navigate = CONFIG.useNavigate();

  const auth = useAuth();
  const { showAlert } = useAppGlobal();

  const [openMiniMenu, setOpenMiniMenu] = useState(false);
  const [openAccountMenu, setOpenAccountMenu] = useState(false);

  const changepwForm = useForm(
    z.object({
      oldpw: z.string().nullish(),
      newpw: z.string().nullish(),
      cfmNewpw: z.string().nullish(),
    })
  );

  const [openLogoutPrompt, setOpenLogoutPrompt] = useState(false);

  async function changePassword() {
    if (!changepwForm.fields?.oldpw) {
      changepwForm.setErrors({ oldpw: "Please enter your current password" });
      return;
    }
    if (!changepwForm.fields.newpw) {
      changepwForm.setErrors({ newpw: "Please enter your new password" });
      return;
    }
    if (changepwForm.fields.cfmNewpw !== changepwForm.fields.newpw) {
      changepwForm.setErrors({
        cfmNewpw: "Please ensure your new password matches",
      });
      return;
    }
    if (changepwForm.fields.oldpw === changepwForm.fields.newpw) {
      changepwForm.setErrors({
        newpw: "Your new password is same as your current password",
      });
      return;
    }
    changepwForm.setErrors({});

    const success = await changepwForm.execute(
      auth.changepw(changepwForm.fields.oldpw, changepwForm.fields.newpw)
    );
    if (!success) {
      changepwForm.setErrors({ execute: "Incorrect current password" });
      return;
    }

    changepwForm.clear();
    showAlert({ color: "success", title: "Change Password Successfully" });
  }

  function logout() {
    auth.logout();
    setOpenLogoutPrompt(false);
  }

  return (
    <>
      {/* Header */}
      <div className="header fixed top-0 left-0 w-full h-16">
        <div className="flex flex-row max-w-7xl h-full px-3 md:px-8 mx-auto gap-4 items-center justify-center">
          {/* Mini menu */}
          <Popover
            open={openMiniMenu}
            element={<Bars3Icon className="md:hidden text w-6 h-6" />}
            popup={
              <div className="paper text divider-border flex flex-col w-[calc(100vw-2.5rem)] mt-4 py-2 select-none">
                {CONFIG.menuItems.map((menuItem, idx) => (
                  <React.Fragment key={idx}>
                    {menuItem.type === "page" && (
                      <>
                        <Button
                          variant={
                            location.pathname === menuItem.route
                              ? "filled"
                              : "text"
                          }
                          size="sm"
                          className="flex flex-row items-center gap-4 py-2 text-left rounded-none"
                          onClick={() => {
                            navigate.route(menuItem.route);
                            setOpenMiniMenu(false);
                          }}
                        >
                          {menuItem.icon}
                          {menuItem.label}
                        </Button>
                      </>
                    )}
                    {menuItem.type === "header" && (
                      <span className="text text-xs text-disabled pl-4 py-2">
                        {menuItem.label}
                      </span>
                    )}
                    {menuItem.type === "divider" && (
                      <div className="divider my-2" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            }
            onChange={(open) => setOpenMiniMenu(open)}
          />

          <div className="flex-grow" />

          {/* Account button */}
          {CONFIG.auth?.enabled && (
            <>
              {auth.session && (
                <Popover
                  open={openAccountMenu}
                  element={
                    <Button
                      variant="outlined"
                      size="sm"
                      className="flex flex-row items-center gap-2 select-none"
                    >
                      My Account
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  }
                  popup={
                    <div className="paper text divider-border flex flex-col w-max mt-2 py-2 select-none">
                      <Button
                        variant="text-bg"
                        size="sm"
                        className="py-2 text-left rounded-none"
                        onClick={() => {
                          changepwForm.setOpen(true);
                          setOpenAccountMenu(false);
                        }}
                      >
                        Change Password
                      </Button>
                      <Button
                        variant="text-bg"
                        size="sm"
                        className="py-2 text-left rounded-none"
                        onClick={() => {
                          setOpenLogoutPrompt(true);
                          setOpenAccountMenu(false);
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  }
                  onChange={(open) => {
                    setOpenAccountMenu(open);
                  }}
                />
              )}
              {!auth.session && (
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => {
                      navigate.route("/signup");
                    }}
                  >
                    Signup
                  </Button>
                  <Button
                    variant="filled"
                    size="sm"
                    onClick={() => {
                      navigate.route("/login");
                    }}
                  >
                    Login
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Theme mode */}
          <ThemeIcon
            themeMode={themeMode}
            onChange={(themeMode) => {
              dispatch({ type: "app/SET_THEME_MODE", themeMode });
            }}
          />
        </div>
        <div className="divider" />
      </div>

      {/* Change password modal */}
      <Modal
        open={changepwForm.open}
        title="Change Password"
        onClose={() => {
          changepwForm.clear();
        }}
      >
        <div className="w-96">
          {changepwForm.createTextInput({
            name: "oldpw",
            title: "Current Password",
            autoFocus: true,
            type: "password",
          })}
          {changepwForm.createTextInput({
            name: "newpw",
            title: "New Password",
            type: "password",
          })}
          {changepwForm.createTextInput({
            name: "cfmNewpw",
            title: "Confirm New Password",
            type: "password",
          })}
          {changepwForm.createActions({
            buttons: [
              {
                title: "Change Password",
                onClick: changePassword,
              },
            ],
          })}
        </div>
      </Modal>

      {/* Confirm logout prompt */}
      <Modal
        open={openLogoutPrompt}
        title="Confirm Logout?"
        onClose={() => {
          setOpenLogoutPrompt(false);
        }}
      >
        <div className="flex flex-row justify-end w-72">
          <Button
            autoFocus // Focused, so press Enter key will logout
            size="sm"
            color="error"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </div>
      </Modal>
    </>
  );
}
