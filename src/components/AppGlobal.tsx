import { createContext, useContext, useState } from "react";

import Modal from "./Modal";
import Alert, { AlertProps } from "./Alert";

const AppGlobalContext = createContext<{
  showAlert: (props: AlertProps) => void;
}>({
  showAlert: () => {},
});

export interface AppGlobalProps {
  children: React.ReactNode;
}

export default function AppGlobal(props: AppGlobalProps) {
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [alertProps, setAlertProps] = useState<AlertProps | null>(null);
  return (
    <AppGlobalContext.Provider
      value={{
        showAlert: (props) => {
          setOpenAlertModal(true);
          setAlertProps(props);
        },
      }}
    >
      {props.children}
      <Modal
        removePadding
        open={openAlertModal}
        onClose={() => setOpenAlertModal(false)}
      >
        <Alert {...alertProps} />
      </Modal>
    </AppGlobalContext.Provider>
  );
}

export function useAppGlobal() {
  const ctx = useContext(AppGlobalContext);
  return {
    showAlert: ctx.showAlert,
  };
}
