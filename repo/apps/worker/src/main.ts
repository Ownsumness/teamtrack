import { Queue, Worker, Job } from 'bullmq';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env'), override: true });

const connection = {
  connection: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
};

export const demoQueue = new Queue('demo', connection);

new Worker(
  'demo',
  async (job: Job) => {
    if (job.name === 'send-email') {
      console.log(`Sending email to ${job.data.email}`);
    }
  },
  connection,
);

if (require.main === module) {
  demoQueue
    .add('send-email', { email: 'user@example.com' })
    .then(() => console.log('Demo job enqueued'))
    .catch((error) => {
      console.error('Failed to enqueue demo job', error);
      process.exitCode = 1;
    });
}
