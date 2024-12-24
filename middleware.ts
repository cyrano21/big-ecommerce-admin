import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/api/:path*', 
    '/webhook', 
    '/api/f072e5ca-1a6a-4312-81dd-23034de5f8cf/products/:id*'
  ],
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
