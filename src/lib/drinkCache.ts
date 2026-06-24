// src/lib/drinkCache.ts
// Simple in‑memory cache for cafe menu drinks. TTL = 5 minutes.
// No external dependencies – uses native Map.

import type { Drink } from '@prisma/client';
import db from '@/lib/db';

interface CacheEntry {
  drinks: Partial<Drink>[];
  expiresAt: number; // epoch ms
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Get the list of available drinks for a cafe, using a cached result when possible.
 * Only the fields required by `analyzeMood` are selected.
 */
export async function getMenuDrinks(cafeId: string): Promise<Partial<Drink>[]> {
  const now = Date.now();
  const cached = cache.get(cafeId);
  if (cached && cached.expiresAt > now) {
    return cached.drinks;
  }

  const drinks = await db.drink.findMany({
    where: { isAvailable: true, cafeId },
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      description: true,
      price: true,
      image: true,
      category: true,
      caffeine: true,
      energy: true,
      sweetness: true,
      isHot: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  cache.set(cafeId, { drinks, expiresAt: now + CACHE_TTL_MS });
  return drinks;
}

// Optional: expose a function to clear cache (useful for tests or admin actions).
export function clearDrinkCache(cafeId?: string) {
  if (cafeId) {
    cache.delete(cafeId);
  } else {
    cache.clear();
  }
}
