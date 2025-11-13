import { Session } from '../session.entity';
import { RefreshToken } from '../../value-objects/refresh-token.vo';

const buildRefreshToken = () =>
  RefreshToken.create(
    'refresh-token-value-1234567890',
    new Date(Date.now() + 3600 * 1000),
    'token-id-123',
  );

describe('Session aggregate', () => {
  it('creates session and records issued event', () => {
    const refreshToken = buildRefreshToken();
    const session = Session.create({
      id: 'session-id-123',
      userId: 'user-id-123',
      refreshToken,
      userAgent: 'Jest Test',
      ipAddress: '127.0.0.1',
    });

    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('auth.session.issued');
  });

  it('revokes session and records revocation event', () => {
    const session = Session.create({
      id: 'session-id-456',
      userId: 'user-id-456',
      refreshToken: buildRefreshToken(),
    });

    session.pullDomainEvents(); // clear initial event
    session.revoke(new Date());

    const events = session.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('auth.session.revoked');
    expect(session.isActive()).toBe(false);
  });
});
