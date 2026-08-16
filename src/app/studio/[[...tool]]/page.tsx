/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 */

'use client'

import { useSyncExternalStore } from 'react'
import { Studio } from 'sanity'
import config from '../../../../sanity.config'

export const dynamic = 'force-static'

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function StudioPage() {
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  return (
    <div
      id="sanity"
      data-ui="NextStudioLayout"
      style={{
        height: '100vh',
        maxHeight: '100dvh',
        overscrollBehavior: 'none',
        WebkitFontSmoothing: 'antialiased',
        overflow: 'auto',
      }}
    >
      <Studio config={config} />
    </div>
  )
}