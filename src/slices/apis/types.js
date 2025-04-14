/**
 * Extracts an error message from an RTK Query error response.
 *
 * @param error - The error object from an API call.
 * @returns The extracted error message or a default message.
 */
export function getErrorMessage(error) {
  if (error && typeof error === "object" && "data" in error) {
    const fetchError = error;

    if (
      typeof fetchError.data === "object" &&
      fetchError.data !== null &&
      "message" in fetchError.data
    ) {
      return fetchError.data.message;
    }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    console.error(error);
    return error.message;
  }

  return "An unexpected error occurred.";
}
