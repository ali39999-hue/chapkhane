import { calculatePrice } from '../modules/pricing/engine'
import { PricingInput, PriceList, PricingContext } from '../modules/pricing/types'
import fs from 'fs'
import path from 'path'

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: tsx src/scripts/pricing-cli.ts <path-to-input.json>')
  process.exit(1)
}

try {
  const fullPath = path.resolve(process.cwd(), inputPath)
  const rawData = fs.readFileSync(fullPath, 'utf8')
  const data = JSON.parse(rawData)

  const input = data.input as PricingInput
  const priceList = data.priceList as PriceList
  const context = data.context as PricingContext

  const result = calculatePrice(input, priceList, context)
  console.log('--- محاسبه با موفقیت انجام شد ---')
  console.log(JSON.stringify(result, null, 2))
} catch (e: any) {
  console.error('Error:', e.message)
}
