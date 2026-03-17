import type { NextApiRequest, NextApiResponse } from 'next';
import canonicalPreferencesHandler from '@/pages/api/preferences';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Link', '</api/preferences>; rel="successor-version"');

  if (req.method === 'POST') {
    req.method = 'PATCH';
  }

  return canonicalPreferencesHandler(req, res);
}
