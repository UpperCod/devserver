import { getCerts } from "https-localhost/certs.js";

export const createSSL = (domain) => getCerts(domain);
