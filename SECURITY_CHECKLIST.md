# Security Quick Reference Checklist

## 🔐 Environment Variables (Required)

```bash
# Authentication
JWT_SECRET=your-secure-random-string-here

# Encryption
ENCRYPTION_KEY=your-encryption-key-min-32-chars
IP_HASH_SALT=your-ip-hashing-salt-here

# Application
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost:5432/formbuilder
REDIS_URL=redis://localhost:6379  # Optional but recommended

# Server
PORT=3000
NODE_ENV=production
TRUST_PROXY_HOPS=1  # Behind reverse proxy
```

---

## ✅ Pre-Deployment Checklist

### Configuration
- [ ] All required environment variables set
- [ ] `NODE_ENV=production` in production
- [ ] `FRONTEND_URL` configured (required in production)
- [ ] Strong random values for all secrets
- [ ] Redis configured for distributed rate limiting

### Database
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Security hardening SQL executed (if not in migrations)
- [ ] Unique indexes created on submission locks
- [ ] Database user has minimal required permissions

### Security Headers
- [ ] Helmet enabled (default in main.ts)
- [ ] HSTS active in production
- [ ] CSP configured appropriately
- [ ] CORS origins restricted to your domains

### Monitoring
- [ ] Error logging configured
- [ ] Rate limit fallback alerts set up
- [ ] Failed login attempt monitoring
- [ ] Unusual activity detection

---

## 🧪 Security Testing Checklist

### Manual Tests
- [ ] Attempt WebSocket connection from unauthorized origin → Should reject
- [ ] Try accessing another user's form → Should return 403
- [ ] Submit duplicate responses with same email → Should allow only one
- [ ] Test account lockout after failed logins → Should lock after N attempts
- [ ] Verify PII fields are encrypted in database → Should not be plaintext

### Automated Tests
- [ ] Run unit tests: `npm test`
- [ ] Run e2e tests: `npm run test:e2e`
- [ ] Run security tests: `npm run test:security` (when implemented)
- [ ] Check dependencies: `npm audit`

---

## 🔍 Common Attack Vectors & Mitigations

### 1. Cross-Site Request Forgery (CSRF)
**Status:** ✅ Protected  
**How:** SameSite cookies + JWT in Authorization header

### 2. Cross-Site Scripting (XSS)
**Status:** ✅ Protected  
**How:** Content Security Policy + httpOnly cookies + input validation

### 3. SQL Injection
**Status:** ✅ Protected  
**How:** Prisma ORM with parameterized queries

### 4. Brute Force Login
**Status:** ✅ Protected  
**How:** Account lockout after N failed attempts + rate limiting

### 5. Session Hijacking
**Status:** ✅ Protected  
**How:** Session token rotation + database validation + httpOnly cookies

### 6. Enumeration Attacks
**Status:** ✅ Protected  
**How:** Old public check endpoint disabled + coarse error messages

### 7. Race Conditions
**Status:** ✅ Protected  
**How:** Serializable transactions + unique database constraints

### 8. Replay Attacks
**Status:** ✅ Protected  
**How:** One-time verification grants + expiration times

### 9. Man-in-the-Middle (MITM)
**Status:** ✅ Protected (with HTTPS)  
**How:** HSTS enforced in production + secure cookies

### 10. Denial of Service (DoS)
**Status:** ⚠️ Partially Protected  
**How:** Rate limiting + request size limits (5MB)  
**Note:** Consider adding DDoS protection at infrastructure level

---

## 🚨 Incident Response

### If Breach Suspected:

1. **Immediate Actions:**
   ```bash
   # Rotate all secrets
   - JWT_SECRET
   - ENCRYPTION_KEY
   - IP_HASH_SALT
   
   # Force logout all users
   UPDATE users SET "sessionToken" = NULL;
   
   # Review logs
   SELECT * FROM activity_logs ORDER BY "createdAt" DESC LIMIT 100;
   ```

2. **Investigation:**
   - Check `activity_logs` table for suspicious patterns
   - Review failed login attempts
   - Audit recent form submissions
   - Check for unusual API usage patterns

3. **Recovery:**
   - Deploy rotated secrets
   - Notify affected users if PII compromised
   - Update security measures based on findings
   - Document incident and lessons learned

---

## 📊 Security Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| Failed logins per IP | >10/hour | Block IP temporarily |
| Form submissions per session | >config limit | Return 429 |
| Verification requests per IP | >20/10min | Return 429 |
| API errors per minute | >100 | Investigate |
| WebSocket connections per IP | >50 | Rate limit |
| Export jobs per user | >5/hour | Queue or reject |

---

## 🔧 Useful Commands

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Run security tests (when available)
npm run test:security

# View recent activity logs
npx prisma studio

# Check rate limit status (Redis)
redis-cli KEYS "public:*"
redis-cli GET "public:form-id:submit:ip:hash"

# Rotate encryption key (requires re-encryption of existing data)
# WARNING: Complex operation - plan carefully
```

---

## 📚 Additional Resources

- [Security Regression Test Plan](security-regression-test-plan.md)
- [Unified Submission Architecture](unified-submission-architecture.md)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/introduction)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last Updated:** 2026-04-24  
**Maintained By:** Development Team
