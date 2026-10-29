import { useEffect, useRef, useState } from "react";
import { searchScanCode } from "../api/scan.api";

const useCodeSearch = (scanId) => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const requestRef = useRef(null);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  const search = async (event) => {
    event.preventDefault();

    const text = query.trim();

    if (text.length < 3 || text.length > 500) {
      setError({ message: "Enter a query between 3 and 500 characters." });
      return;
    }

    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const data = await searchScanCode(scanId, text, controller.signal);

      if (controller.signal.aborted) return;

      if (!Array.isArray(data.matches)) {
        throw new Error("Unexpected search response. Please try again.");
      }

      setResult({ query: text, matches: data.matches });
    } catch (error) {
      if (controller.signal.aborted) return;

      setError({
        message:
          error instanceof TypeError
            ? "Cannot connect to the server. Please try again."
            : error.message,
        status: error.status,
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  return { query, setQuery, result, error, isSearching, search };
};

export default useCodeSearch;