import { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
// import { useNavigate } from "react-router-dom";
import Loader from "src/components/Loader/Loader";

const OctaCallback = () => {
  const { oktaAuth } = useOktaAuth();
  // let navigate = useNavigate();

  const onSuccess = (user: any) => {
    // Redirect the user to their intended destination or the home page
    // oktaAuth.redirect("/");

    console.info("user", user);
    // navigate('/');
  };

  const onError = (error: any) => {
    // Handle any errors that may occur during the login process
    console.error("Error during login callback:", error);
  };

  useEffect(() => {
    oktaAuth.handleLoginRedirect().then(onSuccess).catch(onError);
  }, [oktaAuth]);

  return <Loader />;
};

export default OctaCallback;
