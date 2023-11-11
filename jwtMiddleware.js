const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const { AZURE_AD_TENANT_ID } = process.env;

// Function to verify a JWT token
async function verifyJwtToken(token) {
  let publicKey;
  try {
    publicKey = await fetchPublicKey();
  } catch (error) {
    console.error("Error fetching public key:", error);
  }

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    // If the token is valid, 'decoded' will contain the token payload
    // console.log('JWT verification succeeded');
    console.log("JWT verification succeeded:", decoded);
    return decoded;
  } catch (error) {
    // If the token is invalid or has expired, an error will be thrown
    console.error("JWT verification failed:", error.message);
    return null;
  }
}

async function fetchPublicKey() {
  const opt = (
    await axios.get(
      `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0/.well-known/openid-configuration`
    )
  ).data;

  // Use the jwks_uri to get the signing keys
  const jwksResponse = await axios.get(opt.jwks_uri);
  const jwks = jwksResponse.data;

  // Extract the X.509 certificate
  const x5c = jwks.keys[0].x5c[0];

  // Parse the X.509 certificate into a usable public key format (PEM)
  const publicKeyPem = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`;

  return publicKeyPem;
}

const jwtVerificationMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token missing" });
  }

  try {
    const decoded = await verifyJwtToken(token);
    req.user = decoded; // Attach the decoded payload to the request object
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

module.exports = {
  jwtVerificationMiddleware,
};
