import { useOktaAuth } from "@okta/okta-react";

export const Navbar = () => {
  console.warn("window.location...........", window.location);

  const { authState, oktaAuth } = useOktaAuth();

  const loginWithRedirect = async () => {
    const { pathname, search } = window.location;
    const originalUri = pathname + search;

    console.warn("originalUri......................", originalUri);

    oktaAuth.signInWithRedirect({ originalUri });
  };

  const logOut = () => {
    const { origin, pathname, search } = window.location;
    const postLogoutPath = origin + pathname + search;

    oktaAuth.signOut({
      postLogoutRedirectUri: postLogoutPath,
    });
  };

  const buttonText = authState?.isAuthenticated ? "Logout" : "Login";
  const onClick = authState?.isAuthenticated ? logOut : loginWithRedirect;

  // const login = async () => {
  //   try {
  //     await oktaAuth.signInWithRedirect();
  //   } catch (error: any) {
  //     if (error.name === "AuthApiError") {
  //       // Handle AuthApiError
  //       console.error("Authentication failed:", error.message);
  //       // Display an error message to the user
  //     } else {
  //       // Handle other errors
  //       console.error("An unexpected error occurred:", error);
  //       // Display a generic error message to the user
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (!authState) return;

  //   if (!authState?.isAuthenticated) {
  //     const originalUri = toRelativeUrl(
  //       window.location.href,
  //       window.location.origin
  //     );

  //     oktaAuth.setOriginalUri(originalUri);
  //     // oktaAuth.signInWithRedirect();

  //     // login();
  //   }
  // }, [oktaAuth, !!authState, authState?.isAuthenticated]);

  return (
    <>
      {/* <AppBar position="static" sx={{ backgroundColor: "#3f51b5" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              margin: "auto",
            }}
          >
            Assign BOM Structure to Specific Orgs
          </Typography>
        </Toolbar>
      </AppBar> */}

      <button onClick={onClick}>{buttonText}</button>
    </>
  );
};
