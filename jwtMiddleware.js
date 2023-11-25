const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const { AZURE_AD_TENANT_ID } = process.env;

async function verifyJwtToken(token) {
  try {
    console.log(token);
    const jwksUri = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/discovery/v2.0/keys`;

    const signingKey = await getSigningKey(
      jwksUri,
      jwt.decode(token, { complete: true }).header.kid
    );
    const decoded = jwt.verify(token, signingKey, { algorithms: ['RS256'] });
    console.log('JWT verification succeeded');
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return null;
  }
}

async function getSigningKey(jwksUri, kid) {
  try {
    const client = jwksClient({
      jwksUri,
    });
    const key = await new Promise((resolve, reject) => {
      client.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key.getPublicKey());
        }
      });
    });
    return key;
  } catch (error) {
    console.error('Error fetching signing key:', error);
    throw error;
  }
}

const jwtVerificationMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

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
