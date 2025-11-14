import { Session } from "../session.entity";
import { RefreshToken } from "../../value-objects/refresh-token.vo";
import { SessionId } from "../../value-objects/session-id.vo";

const buildRefreshToken = () =>
  RefreshToken.create(
    "refresh-token-value-1234567890",
    new Date(Date.now() + 3600 * 1000),
    "token-id-123",
  );

describe("Session aggregate", () => {
  it("creates session and records issued event", () => {
    const refreshToken = buildRefreshToken();
    const session = Session.create({
      id: SessionId.create("11111111-1111-4111-8111-111111111111"),
      userId: "user-id-123",
      userType: "user",
      refreshToken,
      userAgent: "Jest Test",
      ipAddress: "127.0.0.1",
    });

    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("auth.session.issued");
  });

  it("revokes session and records revocation event", () => {
    const session = Session.create({
      id: SessionId.create("22222222-2222-4222-8222-222222222222"),
      userId: "user-id-456",
      userType: "customer",
      refreshToken: buildRefreshToken(),
    });

    session.pullDomainEvents(); // clear initial event
    session.revoke(new Date());

    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe("auth.session.revoked");
    expect(session.isActive()).toBe(false);
  });
});
