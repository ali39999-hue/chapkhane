import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../../payload.config';

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log('Fetching products and papers...');
    
    const products = await payload.find({ collection: 'product-types', limit: 100 });
    const papers = await payload.find({ collection: 'paper-types', limit: 100 });
    
    const paperById = new Map(papers.docs.map(p => [String(p.id), p]));
    const priceRows = [];

    console.log(`Found ${products.docs.length} products.`);

    for (const prod of products.docs) {
      if (prod.pricingModel === 'rfq') continue;

      const seed = 1_000_000 + (prod.slug?.length || 5) * 250_000;
      
      let allowedPapers = prod.allowedPapers || [];
      if (allowedPapers.length === 0) {
        console.log(`- ${prod.slug} has no allowedPapers. Generating prices for ALL papers!`);
        allowedPapers = papers.docs.map(p => p.id);
      }
      for (const paperIdRef of allowedPapers) {
        const paperId = typeof paperIdRef === 'object' ? paperIdRef.id : paperIdRef;
        const paper = paperById.get(String(paperId));
        
        const grammages = (paper?.allowedGrammages ?? []).map(g => g.grammage);
        if (grammages.length === 0) grammages.push(300);
        
        for (const grammage of grammages) {
          for (const sides of [1, 2]) {
            priceRows.push({
              productType: prod.id,
              paperType: paperId,
              finishingOption: null,
              grammage,
              sides,
              basePrice: Math.round(seed * (1 + grammage / 1000) * (sides === 2 ? 1.6 : 1)),
            });
            console.log(`  + Added base price for ${prod.slug} (paper=${paperId}, grammage=${grammage}, sides=${sides})`);
          }
        }
      }

      const finishings = prod.allowedFinishings || [];
      for (const finIdRef of finishings) {
        const finId = typeof finIdRef === 'object' ? finIdRef.id : finIdRef;
        const paperTypeToUse = allowedPapers.length > 0 
          ? (typeof allowedPapers[0] === 'object' ? allowedPapers[0].id : allowedPapers[0])
          : null;
        
        if (!paperTypeToUse) {
           console.log(`  ! Skipping finishing ${finId} for ${prod.slug} (no paperType)`);
           continue;
        }

        priceRows.push({
          productType: prod.id,
          paperType: paperTypeToUse,
          finishingOption: finId,
          grammage: 0,
          sides: 1,
          basePrice: 250_000,
        });
        console.log(`  + Added finishing price for ${prod.slug} (fin=${finId})`);
      }
    }

    console.log(`Creating master price list with ${priceRows.length} rows...`);
    
    // Auto-archive will handle old lists.
    await payload.create({
      collection: 'price-lists',
      data: {
        version: 'V1-Master-Fix-' + Date.now(),
        status: 'active',
        validFrom: new Date().toISOString(),
        rows: priceRows,
        notes: 'تولید شده برای رفع مشکل قیمت‌گذاری'
      }
    });

    console.log('Successfully fixed pricing seed!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

run();
