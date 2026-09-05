/**
 * Shorten branch name to a reasonable length
 * Takes first few words and adds "..." if too long
 */
export function shortenBranchName(branchName: string): string {
  const maxLength = 30;

  if (branchName.length <= maxLength) {
    return branchName;
  }

  // Find a good breaking point (word boundary)
  const truncated = branchName.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return branchName.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Format branch name to show key info only
 * e.g., "COMPUTER SCIENCE AND ENGINEERING(...)" → "CSE (AI & ML)"
 */
export function formatBranchShort(branchName: string): string {
  // Check for common patterns and create abbreviations
  if (branchName.includes("COMPUTER SCIENCE")) {
    const hasAI = branchName.includes("ARTIFICIAL INTELLIGENCE");
    const hasML = branchName.includes("MACHINE LEARNING");
    const hasMachineLearning = branchName.includes("MACHINE");

    if (hasAI || hasML || hasMachineLearning) {
      return "CSE (AI & ML)";
    }
    return "CSE";
  }

  if (branchName.includes("ELECTRONICS")) {
    return "ECE";
  }

  if (branchName.includes("ELECTRICAL")) {
    return "EE";
  }

  if (branchName.includes("MECHANICAL")) {
    return "ME";
  }

  if (branchName.includes("CIVIL")) {
    return "CE";
  }

  // Fallback: just shorten it
  return shortenBranchName(branchName);
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
