import { useState, useEffect } from "react";

import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import { useAuth } from "../lib/auth";
import { useBackend } from "../lib/backend";

// Check server health status in background
export default function ServerStatus() {
  const [authHealthy, setAuthHealthy] = useState(true);
  const [backendHealthy, setBakendHealthy] = useState(true);
  const auth = useAuth();
  const backend = useBackend();

  useEffect(() => {
    function check() {
      auth
        .isHealthy()
        .then((healthy) => {
          setAuthHealthy(healthy);
        })
        .catch(() => null);
      backend
        .isHealthy()
        .then((healthy) => {
          setBakendHealthy(healthy);
        })
        .catch(() => null);
    }

    check();
    const timer = setInterval(() => {
      check();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [auth, backend]);

  return (
    <Modal
      open={!authHealthy || !backendHealthy}
      title="Connecting to server..."
      subtitle="Please wait"
    >
      <div className="flex justify-center">
        <Spinner />
      </div>
    </Modal>
  );
}
