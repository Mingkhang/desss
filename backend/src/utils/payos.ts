import PayOS from "@payos/node";
import config from "../config/env";

const payOS = new PayOS(config.payosClientId, config.payosApiKey, config.payosChecksumKey);

export default payOS;