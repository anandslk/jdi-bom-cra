import { useCallback, useEffect, useState } from "react";
import { loadInterCom } from "../utils/helpers";

type SearchOpts = Record<string, any>;

interface UseInterComSearchReturn {
  performSearch: (
    searchText: string,
    searchOpts: SearchOpts,
    onObjectsSelected: (data: any) => void
  ) => void;
}

const useInterComSearch = (): UseInterComSearchReturn => {
  const [socket, setSocket] = useState<any>(null);
  const [InterCom, setInterCom] = useState<any>(null);

  // 1. Load the InterCom module once
  useEffect(() => {
    let isMounted = true;
    loadInterCom()
      .then((interComInstance) => {
        if (isMounted) setInterCom(interComInstance);
      })
      .catch((err) =>
        console.error("[useInterComSearch] Error initializing InterCom:", err)
      );
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Clean up on unmount or socket change
  useEffect(() => {
    return () => {
      if (socket) {
        // remove any custom listeners (safer cleanup)
        socket.removeAllListeners?.("Selected_Objects_search");
        socket.disconnect();
        console.info("[useInterComSearch] Socket disconnected");
      }
    };
  }, [socket]);

  // 3. The main performSearch function
  const performSearch = useCallback(
    (
      searchText: string,
      searchOpts: SearchOpts = {},
      onObjectsSelected: (data: any) => void
    ) => {
      if (!InterCom) {
        console.warn("[useInterComSearch] InterCom not loaded yet.");
        return;
      }

      // Clean up previous socket if any
      if (socket) {
        socket.removeAllListeners?.("Selected_Objects_search");
        socket.disconnect();
      }

      const socketName = `socket_${Date.now()}`;
      const newSocket = new InterCom.Socket(socketName, {
        dispatchRetryInternal: 0,
      });

      newSocket.subscribeServer("SearchComServer");
      setSocket(newSocket);

      // Log the full socket.options so you can inspect default + overrides
      console.info("[useInterComSearch] Socket options:", newSocket.options);

      // Base payload that your server expects
      const widgetId = window.widget?.id;
      const baseContext = {
        widget_id: widgetId,
        app_socket_id: socketName,
        default_search_criteria: searchText,
        ...searchOpts,
      };

      // Merge in any extra fields you want to send
      const finalContext = {
        ...baseContext,
      };

      console.info(
        "[useInterComSearch] Dispatching RegisterContext/InContextSearch with:",
        finalContext
      );

      newSocket.dispatchEvent("RegisterContext", finalContext);
      newSocket.dispatchEvent("InContextSearch", finalContext);

      // Listen for results
      const handleResults = (data: any) => {
        console.info("[useInterComSearch] Results:", data);
        onObjectsSelected(data);
      };
      newSocket.addListener("Selected_Objects_search", handleResults);
    },
    [InterCom, socket]
  );

  return { performSearch };
};

export default useInterComSearch;
