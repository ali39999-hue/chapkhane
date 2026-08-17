// @ts-nocheck
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'

export const generateMetadata = async (args: any) => generatePageMetadata({ config, ...args })

const Page = (args: any) => RootPage({ config, ...args })
export default Page
