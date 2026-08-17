import '@payloadcms/next/css'
import './custom.css'
import '../../styles/admin.css'
import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '@payload-config'
import { importMap } from './admin/importMap.js'
import React from 'react'

const serverFunction = async function (args: any) {
  'use server'
  const { handleServerFunctions } = await import('@payloadcms/next/layouts')
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

const Layout = (args: any) => RootLayout({ config: configPromise, importMap, serverFunction, ...args })
export default Layout
