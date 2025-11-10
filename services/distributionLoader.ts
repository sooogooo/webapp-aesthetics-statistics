/**
 * Distribution Data Loader Service
 *
 * This service provides lazy loading of distribution data to improve initial bundle size.
 *
 * Architecture:
 * - index.json (~3KB): Contains minimal metadata for all distributions (id, name, title, group)
 * - group-{N}.json (1-8KB each): Contains full data for distributions in each group
 *
 * Usage:
 * ```typescript
 * // Get index (synchronous, loaded with bundle)
 * const index = getDistributionIndex();
 *
 * // Load full data for a specific distribution (async)
 * const distribution = await loadDistribution(distributionId);
 *
 * // Load all distributions in a group (async)
 * const groupDistributions = await loadDistributionGroup(groupNumber);
 * ```
 */

import type { Distribution } from '../types';
import distributionIndex from '../data/distributions/index.json';

// Type for the lightweight index entry
export interface DistributionIndexEntry {
  id: number;
  name: string;
  title: string;
  group: number;
}

// Cache for loaded distribution groups
const groupCache = new Map<number, Distribution[]>();

// Cache for individual distributions
const distributionCache = new Map<number, Distribution>();

/**
 * Get the distribution index (synchronous, included in bundle)
 * This provides minimal data for rendering lists and navigation
 */
export function getDistributionIndex(): DistributionIndexEntry[] {
  return distributionIndex as DistributionIndexEntry[];
}

/**
 * Load distributions for a specific group (async, lazy loaded)
 * @param groupNumber - The group number (1-7)
 * @returns Promise resolving to array of distributions in that group
 */
export async function loadDistributionGroup(groupNumber: number): Promise<Distribution[]> {
  // Check cache first
  if (groupCache.has(groupNumber)) {
    return groupCache.get(groupNumber)!;
  }

  try {
    // Dynamically import the group file
    const module = await import(`../data/distributions/group-${groupNumber}.json`);
    const distributions: Distribution[] = module.default;

    // Cache the group
    groupCache.set(groupNumber, distributions);

    // Also cache individual distributions
    distributions.forEach((dist) => {
      distributionCache.set(dist.id, dist);
    });

    return distributions;
  } catch (error) {
    console.error(`Failed to load distribution group ${groupNumber}:`, error);
    throw new Error(`Distribution group ${groupNumber} not found`);
  }
}

/**
 * Load a single distribution by ID (async, lazy loaded)
 * @param id - The distribution ID
 * @returns Promise resolving to the distribution
 */
export async function loadDistribution(id: number): Promise<Distribution> {
  // Check cache first
  if (distributionCache.has(id)) {
    return distributionCache.get(id)!;
  }

  // Find which group this distribution belongs to
  const indexEntry = distributionIndex.find((entry: DistributionIndexEntry) => entry.id === id);

  if (!indexEntry) {
    throw new Error(`Distribution with ID ${id} not found in index`);
  }

  // Load the entire group (this will cache all distributions in the group)
  const groupDistributions = await loadDistributionGroup(indexEntry.group);

  // Find and return the specific distribution
  const distribution = groupDistributions.find((dist) => dist.id === id);

  if (!distribution) {
    throw new Error(`Distribution with ID ${id} not found in group ${indexEntry.group}`);
  }

  return distribution;
}

/**
 * Preload a distribution group in the background
 * Useful for preloading likely-to-be-needed data
 * @param groupNumber - The group number to preload
 */
export function preloadDistributionGroup(groupNumber: number): void {
  // Fire and forget - load in background
  loadDistributionGroup(groupNumber).catch((error) => {
    console.warn(`Failed to preload distribution group ${groupNumber}:`, error);
  });
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearCache(): void {
  groupCache.clear();
  distributionCache.clear();
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats() {
  return {
    groupsCached: groupCache.size,
    distributionsCached: distributionCache.size,
    cachedGroups: Array.from(groupCache.keys()),
  };
}
