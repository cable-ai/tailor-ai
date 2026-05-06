# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Tailor AI, please report it responsibly. **Do not open a public GitHub issue.**

### How to Report

1. **Email us** with the subject "Security Vulnerability Report"
   - Include: description of the vulnerability, steps to reproduce, and potential impact
   - Email: [INSERT SECURITY EMAIL]

2. **Include details:**
   - Type of vulnerability (e.g., XSS, CSRF, injection, auth bypass)
   - Where the vulnerability exists (component, file, etc.)
   - Steps to reproduce
   - Potential impact and severity
   - Any suggested fixes (optional)

3. **Allow time for response:** We will acknowledge receipt within 48 hours and provide a timeline for a fix.

### What Happens Next

1. We'll investigate and confirm the vulnerability
2. We'll develop and test a fix
3. We'll release a patch version with the fix
4. We'll credit you in the release notes (if you'd like)

### Security Best Practices

When using Tailor AI:

- **Keep your API keys secret** — Never commit `.env` files or keys to Git
- **Use HTTPS** — Always use HTTPS in production
- **Authenticate properly** — Use OAuth for marketplace connections
- **Validate inputs** — Always validate user input on the server side
- **Keep dependencies updated** — Run `npm audit` regularly

## Supported Versions

We support the latest version of Tailor AI with security patches.

| Version | Supported |
|---------|-----------|
| Latest | ✅ Yes |
| Previous | ⚠️ Depends on severity |
| Older | ❌ No |

## Known Vulnerabilities

None currently known. We scan for vulnerabilities regularly using npm audit.

---

**Thank you for helping us keep Tailor AI secure!**
