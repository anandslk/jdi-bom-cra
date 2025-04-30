// import { AppBar, Toolbar, Typography } from "@mui/material";
// import { toRelativeUrl } from "@okta/okta-auth-js";
// import { useOktaAuth } from "@okta/okta-react";
// import { useEffect } from "react";

export const Navbar = () => {
  // const { authState, oktaAuth } = useOktaAuth();

  // const loginWithRedirect = () => {
  //   // const pathAndQs = window.location.pathname + window.location.search;
  //   oktaAuth.signInWithRedirect();
  //   // oktaAuth.signInWithRedirect({ originalUri: pathAndQs });
  // };
  // const logOut = () => oktaAuth.signOut();

  // const buttonText = authState?.isAuthenticated ? "Logout" : "Login";
  // const btnLogic = authState?.isAuthenticated ? logOut : loginWithRedirect;

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

      {/* <button onClick={btnLogic}>{buttonText}</button> */}
    </>
  );
};
