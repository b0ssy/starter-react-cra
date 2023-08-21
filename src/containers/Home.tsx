import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RenderOnce from "../components/RenderOnce";
import Button from "../components/Button";
import { CONFIG } from "../config";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-row max-w-7xl pt-24 px-3 md:px-8 mx-auto gap-2">
      {/* Side menu */}
      <div className="hidden md:fixed md:flex flex-col w-52 gap-1 select-none">
        {CONFIG.menuItems.map((menuItem, idx) => (
          <React.Fragment key={idx}>
            {menuItem.type === "page" && (
              <>
                <Button
                  variant={
                    location.pathname === menuItem.route ? "filled" : "text-bg"
                  }
                  size="sm"
                  className="flex flex-row items-center gap-4 text-left"
                  onClick={() => navigate(menuItem.route)}
                >
                  {menuItem.icon}
                  {menuItem.label}
                </Button>
              </>
            )}
            {menuItem.type === "header" && (
              <span className="text text-xs text-disabled pl-4 py-1">
                {menuItem.label}
              </span>
            )}
            {menuItem.type === "divider" && <div className="divider my-2" />}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="flex-grow md:ml-52 md:pl-8 lg:pl-16 pt-1">
        <div className="text text-2xl pb-12">
          {CONFIG.menuItems
            .filter(
              (menuItem) =>
                menuItem.type === "page" && menuItem.route === location.pathname
            )
            .map((menuItem) =>
              menuItem.type === "page" ? (
                <span key={menuItem.label}>{menuItem.label}</span>
              ) : null
            )}
        </div>
        {CONFIG.menuItems.map((menuItem) =>
          menuItem.type === "page" ? (
            <RenderOnce
              key={menuItem.route}
              show={location.pathname === menuItem.route}
            >
              {menuItem.content}
            </RenderOnce>
          ) : null
        )}

        {/* Bottom placeholder */}
        <div className="w-full h-12" />
      </div>
    </div>
  );
}
