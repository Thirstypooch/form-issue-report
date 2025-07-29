// @ts-ignore: Deno environment
import { encodeBase64 as base64Encode, decodeBase64 as base64Decode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const projectId = Deno.env.get('GCP_PROJECT_ID');
const keyFilePath = Deno.env.get('GOOGLE_APPLICATION_CREDENTIALS');

if (!projectId || !keyFilePath) {
  throw new Error("GCP_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS must be set.");
}

// This function securely generates a new token whenever it's called.
async function getAccessToken(): Promise<string> {
  const keyFileContent = await Deno.readTextFile(keyFilePath);
  const keyData = JSON.parse(keyFileContent);
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64Encode(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // Token is valid for 1 hour
  const payload = {
    iss: keyData.client_email,
    scope: "https://www.googleapis.com/auth/pubsub",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };
  const encodedPayload = base64Encode(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // This part decodes the private key correctly for Deno's Web Crypto API
  const privateKeyData = atob(keyData.private_key.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s/g, ''));
  const privateKeyBuffer = new Uint8Array(privateKeyData.length).map((_, i) => privateKeyData.charCodeAt(i));

  const privateKey = await crypto.subtle.importKey("pkcs8", privateKeyBuffer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(signingInput));
  const encodedSignature = base64Encode(signature).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${signingInput}.${encodedSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

export async function publishReport(report: any) {
  const topicName = 'report-submission-topic';
  // Re-enabled the function call, removed the hardcoded token
  const accessToken = await getAccessToken();
  const url = `https://pubsub.googleapis.com/v1/projects/${projectId}/topics/${topicName}:publish`;
  const messageData = JSON.stringify(report);
  const encodedData = base64Encode(new TextEncoder().encode(messageData));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ data: encodedData }] }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Pub/Sub publish error:", errorBody);
    throw new Error(`Failed to publish to Pub/Sub: ${response.status}`);
  }
  console.log(`Message published to topic ${topicName} via REST API.`);
}

export async function subscribeToReports(subscriptionName: string, messageHandler: (message: any) => Promise<void>) {
  const subscriptionPath = `projects/${projectId}/subscriptions/${subscriptionName}`;
  const pullUrl = `https://pubsub.googleapis.com/v1/${subscriptionPath}:pull`;
  console.log(`[Worker] Now listening for messages on ${subscriptionName} via REST API...`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Re-enabled the function call for the worker
      const accessToken = await getAccessToken();
      const response = await fetch(pullUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxMessages: 10 }),
      });

      if (!response.ok) {
        console.error(`[Worker] Error pulling messages: ${response.status}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const { receivedMessages } = await response.json();
      if (receivedMessages && receivedMessages.length > 0) {
        const ackIds: string[] = [];
        for (const receivedMessage of receivedMessages) {
          const messageData = new TextDecoder().decode(base64Decode(receivedMessage.message.data));
          const messagePayload = JSON.parse(messageData);
          await messageHandler(messagePayload);
          ackIds.push(receivedMessage.ackId);
        }
        const ackUrl = `https://pubsub.googleapis.com/v1/${subscriptionPath}:acknowledge`;
        const ackToken = await getAccessToken();
        await fetch(ackUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${ackToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ackIds }),
        });
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('[Worker] A critical error occurred in the subscription loop:', error);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}