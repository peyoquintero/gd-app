import { useState, useEffect, useCallback } from "react";
function getNetworkConnection() {
  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null
  );
}
function getNetworkConnectionInfo() {
  const connection = getNetworkConnection();
if (!connection) {
    return {};
  }
return {
    rtt: connection.rtt,
    type: connection.type,
    saveData: connection.saveData,
    downLink: connection.downLink,
    downLinkMax: connection.downLinkMax,
    effectiveType: connection.effectiveType,
  };
}
//export const compareNumAlphas = (str1, str2) =>
// {
export const  useNetwork= () => {
  const [state, setState] = useState(() => {
    return {
      since: undefined,
      online: navigator.onLine,
      ...getNetworkConnectionInfo(),
    };
  });

  // Additional check for actual connectivity
  const checkConnectivity = useCallback(async () => {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }, []);

useEffect(() => {
    const handleOnline = async () => {
      const isActuallyOnline = await checkConnectivity();
      setState((prevState) => ({
        ...prevState,
        online: isActuallyOnline,
        since: new Date().toString(),
      }));
    };
const handleOffline = () => {
      setState((prevState) => ({
        ...prevState,
        online: false,
        since: new Date().toString(),
      }));
    };
const handleConnectionChange = async () => {
      const isActuallyOnline = await checkConnectivity();
      setState((prevState) => ({
        ...prevState,
        online: isActuallyOnline,
        ...getNetworkConnectionInfo(),
      }));
    };

    // Initial connectivity check
    checkConnectivity().then(isOnline => {
      setState(prevState => ({
        ...prevState,
        online: isOnline
      }));
    });

window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
const connection = getNetworkConnection();
connection?.addEventListener("change", handleConnectionChange);

    // Periodic connectivity check
    const intervalId = setInterval(async () => {
      const isActuallyOnline = await checkConnectivity();
      setState(prevState => {
        if (prevState.online !== isActuallyOnline) {
          return {
            ...prevState,
            online: isActuallyOnline,
            since: new Date().toString(),
          };
        }
        return prevState;
      });
    }, 10000); // Check every 10 seconds

return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      connection?.removeEventListener("change", handleConnectionChange);
      clearInterval(intervalId);
    };
  }, [checkConnectivity]);
return state;
}
