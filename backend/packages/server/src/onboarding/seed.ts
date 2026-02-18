/**
 * Space Seeding
 *
 * Seeds a new space with initial content.
 */

import type { Storage } from '@cast/storage';
import { fetchOnboardingContent } from './sanity-client';
import { transformOnboardingContent } from './transform';

/**
 * Seed a new space with minimal content (no Sanity dependency).
 *
 * Creates:
 * 1. #root channel for system configuration
 * 2. #first-channel as the default working channel
 *
 * @param storage - Storage instance
 * @param spaceId - ID of the space to seed
 */
export async function seedSpace(
  storage: Storage,
  spaceId: string
): Promise<void> {
  // Create #root channel
  await storage.createChannel({
    spaceId,
    name: 'root',
    tagline: 'System configuration',
    mission: 'System-level artifacts and configuration for this space.',
  });

  // Create #first-channel as the default working channel
  await storage.createChannel({
    spaceId,
    name: 'first-channel',
    tagline: 'Your first channel',
    mission: 'A space to get started with AI agents.',
  });
}

/**
 * Seed a new space with content from Sanity.
 *
 * Creates:
 * 1. #root channel for system configuration
 * 2. MCP server artifacts (must be first - agents reference them)
 * 3. Agent template artifacts
 * 4. Playbook artifacts
 * 5. #first-channel as the default working channel
 *
 * @param storage - Storage instance
 * @param spaceId - ID of the space to seed
 */
export async function seedSpaceFromSanity(
  storage: Storage,
  spaceId: string
): Promise<void> {
  // Fetch content from Sanity
  const content = await fetchOnboardingContent();
  const transformed = transformOnboardingContent(content);

  // Create #root channel
  const rootChannel = await storage.createChannel({
    spaceId,
    name: 'root',
    tagline: 'System configuration',
    mission: 'System-level artifacts and configuration for this space.',
  });

  // Create MCP servers first (agents reference them)
  for (const mcp of transformed.mcpServers) {
    await storage.createArtifact(rootChannel.id, {
      ...mcp,
      channelId: rootChannel.id,
    });
  }

  // Create agent templates
  for (const agent of transformed.agentTemplates) {
    await storage.createArtifact(rootChannel.id, {
      ...agent,
      channelId: rootChannel.id,
    });
  }

  // Create playbooks
  for (const playbook of transformed.playbooks) {
    await storage.createArtifact(rootChannel.id, {
      ...playbook,
      channelId: rootChannel.id,
    });
  }

  // Create #first-channel as the default working channel
  await storage.createChannel({
    spaceId,
    name: 'first-channel',
    tagline: 'Your first channel',
    mission: 'A space to get started with AI agents.',
  });
}
