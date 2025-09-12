import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@gaten/backend/src/router'; // Changed from 'routers' to 'router'

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
});