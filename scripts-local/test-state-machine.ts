import { getPayload } from 'payload';
import configPromise from './payload.config';

async function runTest() {
  const payload = await getPayload({ config: configPromise });

  try {
    console.log("1. Finding an order...");
    const orders = await payload.find({ collection: 'orders', limit: 1 });
    
    if (orders.totalDocs === 0) {
      console.log("No orders found. Please run E2E flow first to create an order.");
      return;
    }

    const order = orders.docs[0];
    console.log(`Order found: ${order.orderNumber} with status: ${order.status}`);

    console.log(`2. Attempting illegal transition to 'in_production' (bypassing proof_approved)...`);
    
    // According to state-machine.ts, 'in_production' doesn't exist, it's 'prepress' or 'printing'
    // 'proof_approved': ['prepress']
    // Let's try to jump from 'paid' or 'draft' straight to 'prepress'
    
    try {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'prepress' // Illegal jump!
        }
      });
      console.log("❌ TEST FAILED: The system allowed an illegal state transition!");
    } catch (e: any) {
      console.log(`✅ TEST PASSED: System blocked illegal transition. Error message: ${e.message}`);
    }

  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTest().then(() => process.exit(0));
