export class BlockedError extends Error {
  constructor(message = "You are restricted by GSP++ admin to use this app, contact admin for help.") {
    super(message);
    this.name = "BlockedError";
  }
}

export function isBlockedError(error: unknown): error is BlockedError {
  return error instanceof BlockedError;
}