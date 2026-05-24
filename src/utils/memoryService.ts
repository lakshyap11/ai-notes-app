export type MemoryType = "emotion" | "goal" | "reflection" | "habit" | "stressor" | "relationship";

export interface Memory {
  id: string;
  type: MemoryType;
  summary: string;
  importance: number; // 1 to 10
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "aether-memories";

// Safe wrapper to access localStorage in Next.js (SSR friendly)
const isBrowser = typeof window !== "undefined";

/**
 * Fetch all memories from localStorage.
 */
export function getMemories(): Memory[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read aether-memories from localStorage", e);
    return [];
  }
}

/**
 * Save memories to localStorage.
 */
export function saveMemories(memories: Memory[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error("Failed to save aether-memories to localStorage", e);
  }
}

/**
 * Delete a specific memory block by ID.
 */
export function deleteMemory(id: string): Memory[] {
  const current = getMemories();
  const updated = current.filter((m) => m.id !== id);
  saveMemories(updated);
  return updated;
}

/**
 * Clear all memories.
 */
export function clearMemories(): void {
  saveMemories([]);
}

/**
 * Performs a simple clean keyword extraction to check overlap.
 */
function getKeywords(str: string): Set<string> {
  const stopwords = new Set([
    "a", "an", "the", "and", "or", "but", "about", "for", "with", "to", "at", 
    "from", "by", "in", "on", "is", "are", "was", "were", "has", "have", "had", 
    "user", "i", "my", "me", "he", "she", "they", "we", "wants", "tends", "feels", "feeling"
  ]);
  
  return new Set(
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopwords.has(word))
  );
}

/**
 * Checks if two summaries overlap significantly (share at least one key noun/concept of the same type).
 */
function hasOverlap(m1: Omit<Memory, "id" | "createdAt" | "updatedAt">, m2: Memory): boolean {
  if (m1.type !== m2.type) return false;
  
  const keywords1 = getKeywords(m1.summary);
  const keywords2 = getKeywords(m2.summary);
  
  // Find intersection
  for (const word of keywords1) {
    if (keywords2.has(word)) {
      return true;
    }
  }
  return false;
}

/**
 * Adds new memories. If a new memory overlaps with an existing memory of the same type,
 * it merges them by updating the summary to the newer one, bumping importance (taking max),
 * and updating the timestamp.
 */
export function addOrMergeMemories(
  newRawMemories: Omit<Memory, "id" | "createdAt" | "updatedAt">[]
): Memory[] {
  const currentMemories = getMemories();
  const nowStr = new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  
  let updatedMemories = [...currentMemories];
  
  for (const raw of newRawMemories) {
    // Look for an overlapping memory of the same type
    const overlapIndex = updatedMemories.findIndex((existing) => hasOverlap(raw, existing));
    
    if (overlapIndex !== -1) {
      // Merge
      const existing = updatedMemories[overlapIndex];
      updatedMemories[overlapIndex] = {
        ...existing,
        summary: raw.summary, // prefer the latest, potentially more specific summary
        importance: Math.max(existing.importance, raw.importance), // hold on to high importance
        updatedAt: nowStr
      };
      console.log(`[Memory Merge]: Merged into existing memory: "${raw.summary}"`);
    } else {
      // Add as new
      const newMemory: Memory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: raw.type,
        summary: raw.summary,
        importance: raw.importance,
        createdAt: nowStr,
        updatedAt: nowStr
      };
      updatedMemories.push(newMemory);
      console.log(`[Memory Add]: Added new memory: "${raw.summary}"`);
    }
  }
  
  // Prune memories to prevent memory bloat
  const pruned = pruneMemories(updatedMemories);
  saveMemories(pruned);
  return pruned;
}

/**
 * Pruning system: Keep only the top memories. Removes the lowest importance items first.
 * If importance scores are equal, removes the oldest ones (based on updatedAt).
 */
export function pruneMemories(memories: Memory[], maxLimit = 12): Memory[] {
  if (memories.length <= maxLimit) return memories;
  
  console.log(`[Memory Pruning]: Memory count (${memories.length}) exceeds limit (${maxLimit}). Pruning lowest relevance items.`);
  
  // Sort: highest importance first. If equal, newest first.
  const sorted = [...memories].sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance; // high importance first
    }
    // Simple date comparison fallback (reverse chronological order)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  // Return only the top items
  return sorted.slice(0, maxLimit);
}

/**
 * Finds and returns the top 3 most relevant memories based on active notes or user inputs.
 * If no semantic matches exist, returns the top 3 overall highest importance memories.
 */
export function getRelevantMemories(chatText: string, noteContext = "", count = 3): Memory[] {
  const current = getMemories();
  if (current.length === 0) return [];
  
  const textToMatch = `${chatText} ${noteContext}`.toLowerCase();
  const searchKeywords = getKeywords(textToMatch);
  
  // Calculate a relevance score for each memory
  const scored = current.map((memory) => {
    const memoryKeywords = getKeywords(memory.summary);
    let matchCount = 0;
    
    for (const kw of memoryKeywords) {
      if (searchKeywords.has(kw) || textToMatch.includes(kw)) {
        matchCount += 1.5; // matching direct keywords gives higher score
      }
    }
    
    // Add type matching boost (e.g. if text mentions emotional terms)
    if (memory.type === "stressor" && (textToMatch.includes("stress") || textToMatch.includes("anxious") || textToMatch.includes("worry"))) {
      matchCount += 1.0;
    }
    if (memory.type === "goal" && (textToMatch.includes("want to") || textToMatch.includes("goal") || textToMatch.includes("plan") || textToMatch.includes("improve"))) {
      matchCount += 1.0;
    }
    
    // Total score is a function of keyword match and intrinsic memory importance
    const score = matchCount * 2.0 + memory.importance * 0.5;
    
    return { memory, score };
  });
  
  // Sort scored list descending
  scored.sort((a, b) => b.score - a.score);
  
  // Log scores for debugging
  console.log(`[Memory Relevance]: Evaluated matching for text snippet. Top score: ${scored[0]?.score}`);
  
  // Extract and return the requested count of memories
  return scored.slice(0, count).map((item) => item.memory);
}
