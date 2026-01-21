import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PUSH_QUEUE_NAME, PUSH_QUEUE_TOKEN } from './queue.constants';

@Injectable()
export class PushQueueService {
  constructor(@Inject(PUSH_QUEUE_TOKEN) private readonly queue: Queue) {}

  async enqueueCampaign(campaignId: string, subscriptionIds: string[]) {
    const jobs = subscriptionIds.map((subscriptionId) => ({
      name: 'send',
      data: { campaignId, subscriptionId },
    }));

    if (jobs.length === 0) {
      return;
    }

    await this.queue.addBulk(
      jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: { removeOnComplete: true, removeOnFail: true },
      })),
    );
  }

  async getCounts() {
    return this.queue.getJobCounts();
  }

  getQueueName() {
    return PUSH_QUEUE_NAME;
  }
}
