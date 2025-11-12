/**
 * RevokeSessionCommand revokes refresh session for logout flows
 */
export class RevokeSessionCommand {
  constructor(public readonly tokenId: string) {}
}
