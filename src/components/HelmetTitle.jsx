import { Helmet } from "react-helmet-async";
import { CONFIG } from "../config-global";

export const HelmetTitle = ({ title, metaData }) => (
  <Helmet>
    <title> {`${title} - ${CONFIG.appName}`}</title>

    {metaData && (
      <>
        <meta name="description" content={metaData.description} />
        <meta name="keywords" content={metaData.keywords} />
      </>
    )}
  </Helmet>
);

