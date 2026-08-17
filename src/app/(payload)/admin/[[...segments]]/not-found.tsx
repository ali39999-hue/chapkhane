import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'

const NotFound = (args: any) => NotFoundPage({ config, ...args })
export default NotFound
