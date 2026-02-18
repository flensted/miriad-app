/**
 * Disclaimer Routes
 *
 * Handles fetching the legal disclaimer from Sanity and recording user acceptance.
 */

import { Hono } from 'hono';
import type { Storage } from '@cast/storage';
import { requireAuth, getUserId } from '../auth/index.js';

// =============================================================================
// Sanity Config
// =============================================================================

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || 'z6gp2g0b';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_API_VERSION = '2024-01-01';

// =============================================================================
// Types
// =============================================================================

interface SanityDisclaimer {
  _id: string;
  _type: 'disclaimer';
  name: string;
  slug: { current: string };
  title: string;
  content: string;
  version: string;
  active: boolean;
}

export interface DisclaimerResponse {
  title: string;
  content: string;
  version: string;
}

// =============================================================================
// Sanity Query
// =============================================================================

const DISCLAIMER_QUERY = `*[_id == "legalDisclaimer"][0]{
  _id,
  _type,
  name,
  slug,
  title,
  content,
  version,
  active
}`;

async function fetchDisclaimer(): Promise<SanityDisclaimer | null> {
  // Stub: Return default disclaimer to bypass Sanity dependency
  // TODO: Re-enable Sanity integration when configured
  return {
    _id: 'legalDisclaimer',
    _type: 'disclaimer',
    name: 'Legal Disclaimer',
    slug: { current: 'legal-disclaimer' },
    title: 'Terms of Use',
    content: `By using this service, you acknowledge that:

1. This is experimental software provided "as is" without warranty.
2. AI-generated content may contain errors or inaccuracies.
3. You are responsible for reviewing and validating any code or content produced.
4. Do not share sensitive credentials or proprietary information.

Use responsibly and at your own risk.`,
    version: '1.0.0',
    active: true,
  };
}

// =============================================================================
// Routes
// =============================================================================

export function createDisclaimerRoutes(storage: Storage) {
  const app = new Hono();

  /**
   * GET /disclaimer
   *
   * Fetch the current legal disclaimer content.
   * Requires authentication.
   */
  app.get('/', requireAuth, async (c) => {
    const disclaimer = await fetchDisclaimer();

    if (!disclaimer || !disclaimer.active) {
      return c.json({ error: 'No active disclaimer found' }, 404);
    }

    const response: DisclaimerResponse = {
      title: disclaimer.title,
      content: disclaimer.content,
      version: disclaimer.version,
    };

    return c.json(response);
  });

  /**
   * POST /disclaimer/accept
   *
   * Record that the user has accepted the disclaimer.
   * Requires the user to type "i accept the responsibility" (case insensitive).
   */
  app.post('/accept', requireAuth, async (c) => {
    const userId = getUserId(c);
    const body = await c.req.json<{ confirmation: string; version: string }>();

    // Validate confirmation text
    const normalizedConfirmation = body.confirmation?.toLowerCase().trim();
    if (normalizedConfirmation !== 'i accept the responsibility') {
      return c.json(
        { error: 'Invalid confirmation. Please type "I accept the responsibility"' },
        400
      );
    }

    // Validate version is provided
    if (!body.version) {
      return c.json({ error: 'Version is required' }, 400);
    }

    // Update user's disclaimer acceptance
    const updatedUser = await storage.acceptDisclaimer(userId, body.version);

    if (!updatedUser) {
      return c.json({ error: 'Failed to update user' }, 500);
    }

    return c.json({ success: true, disclaimerAcceptedVersion: body.version });
  });

  return app;
}
