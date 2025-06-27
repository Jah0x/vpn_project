import { prisma } from '../lib/prisma';
import { retrySubPushQueue, pushSubscription } from '../lib/subPush';

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'list') {
    const q = await prisma.subPushQueue.findMany();
    console.table(q.map(r => ({ id: r.id, uuid: r.uuid, tries: r.tries, nextRetryAt: r.nextRetryAt })));
  } else if (cmd === 'retry') {
    await retrySubPushQueue();
  } else if (cmd === 'flush') {
    await prisma.subPushQueue.deleteMany();
  } else {
    console.log('Usage: list | retry | flush');
  }
  await prisma.$disconnect();
}

main();
