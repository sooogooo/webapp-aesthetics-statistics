# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest version of this project.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Known Security Advisories

### Development Dependencies

The following low-severity vulnerabilities exist in development dependencies only and do not affect production builds:

#### @lhci/cli (Lighthouse CI)

**Status:** Accepted Risk (Development Only)

- **Severity:** Low (4 vulnerabilities)
- **Affected:** Development environment only
- **Impact:** None on production builds
- **Reason:**
  - Used only for performance testing during development
  - Not included in production bundle
  - Requires local file system access (developer's machine)
  - Upgrading to fix would break Lighthouse CI functionality

**Vulnerabilities:**

```
tmp  <=0.2.3
- CVE: GHSA-52f5-9888-hmc6
- Description: Arbitrary temporary file/directory write via symbolic link
- Mitigation: Only used in development environment with trusted code
```

**Decision:** We accept this risk because:

1. ✅ Development-only dependency
2. ✅ Not in production bundle
3. ✅ Low severity
4. ✅ Breaking change required to fix (@lhci/cli 0.15.1 → 0.1.0)
5. ✅ Requires local file access (developer's machine only)

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will:

- Acknowledge receipt within 48 hours
- Investigate and respond within 7 days
- Work on a fix and release timeline
- Credit you in the security advisory (if desired)

## Security Best Practices

When working with this project:

1. **Dependencies:**
   - Run `npm audit` regularly
   - Update dependencies with `npm update`
   - Review breaking changes before major updates

2. **API Keys:**
   - Never commit API keys to version control
   - Use `.env.local` for local development
   - Use environment variables in production

3. **Build:**
   - Only deploy production builds (`npm run build`)
   - Verify build output before deployment
   - Use HTTPS for all production deployments

## Security Updates

We monitor dependencies for security advisories and:

- Update patch versions automatically (via renovate/dependabot)
- Review minor/major updates carefully
- Document any accepted risks

Last audit: 2025-12-17
Next scheduled audit: Monthly

---

For questions about this security policy, please open a GitHub Discussion.
