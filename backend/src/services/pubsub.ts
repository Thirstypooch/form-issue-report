// @ts-ignore: Deno environment
import { PubSub } from 'npm:@google-cloud/pubsub';
// @ts-ignore: Deno environment
import { Buffer } from "std/node/buffer.ts";

const pubSubClient = new PubSub({
  // @ts-ignore: Deno environment
  projectId: Deno.env.get('GCP_PROJECT_ID'),
  // Authentication will be handled by GCP's environment (e.g., service account)
});

export async function publishReport(report: any) {
  const topicName = 'report-submission-topic';
  const dataBuffer = Buffer.from(JSON.stringify(report));
  await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
  console.log(`Message published to topic ${topicName}`);
}

export async function subscribeToReports(subscriptionName: string, messageHandler: (message: any) => Promise<void>) {
  const subscription = pubSubClient.subscription(subscriptionName);
  subscription.on('message', async (message: any) => {
    try {
      const data = JSON.parse(message.data.toString());
      await messageHandler(data);
      message.ack();
    } catch (e) {
      console.error('Error processing message:', e);
      message.nack();
    }
  });
  console.log(`Listening for messages on subscription ${subscriptionName}...`);
}