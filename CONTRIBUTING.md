# Contributing to Tailor AI

Thanks for your interest in contributing to Tailor AI! We welcome contributions from everyone — whether you're fixing bugs, adding features, improving documentation, or helping with community support.

## Code of Conduct

Please read and follow our [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be respectful, inclusive, and constructive.

## How to Contribute

### Reporting Bugs

Found a bug? Great, help us fix it!

1. **Check existing issues** — Search GitHub Issues to see if it's already reported
2. **Open a new issue** — Use the bug report template
3. **Include details:**
   - What you were trying to do
   - What happened
   - What you expected to happen
   - Steps to reproduce
   - Screenshots (if relevant)
   - Environment (OS, Node version, etc.)

### Suggesting Features

Have an idea? We'd love to hear it!

1. **Check existing discussions** — See if it's already been discussed
2. **Open a discussion** — Use GitHub Discussions to propose ideas
3. **Or open an issue** — If it's a concrete feature request, use the feature request template

### Submitting Code

#### Prerequisites

- Node.js 18+
- Git
- Familiarity with TypeScript, React Native, and/or Node.js (depending on what you're working on)

#### Getting Started

1. **Fork the repository** — Click "Fork" on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tailor-ai.git
   cd tailor-ai
   ```
3. **Create a branch** — Use a descriptive name:
   ```bash
   git checkout -b feature/add-mercari-support
   # or
   git checkout -b fix/photo-upload-bug
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your test API keys
   ```

#### Development Workflow

1. **Make your changes** — Keep commits atomic and descriptive
   ```bash
   git add .
   git commit -m "feat: add Mercari listing support"
   ```
2. **Test locally:**
   ```bash
   npm run dev
   npm run test  # Run test suite
   npm run lint  # Check code style
   ```
3. **Push to your fork:**
   ```bash
   git push origin feature/add-mercari-support
   ```
4. **Open a Pull Request** — Provide a clear description of what you changed and why

### Code Style

We use **ESLint** and **Prettier** for code formatting.

```bash
# Format code
npm run format

# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix
```

**Guidelines:**
- Use TypeScript — no `any` types without a good reason
- Write readable, self-documenting code
- Add comments for complex logic
- Follow React/React Native conventions
- One feature per pull request when possible

### Testing

We use **Jest** for unit tests.

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Guidelines:**
- Write tests for new features
- Update tests when changing existing code
- Aim for >80% coverage on critical paths

### Documentation

Good documentation is as important as code!

- Update README.md if you add user-facing features
- Add JSDoc comments to exported functions/components
- Update docs/ folder for architectural changes
- Include examples for new features

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add Mercari listing support
fix: resolve photo upload timeout issue
docs: update eBay integration guide
refactor: simplify AI pipeline
test: add tests for condition grading
```

Format: `<type>: <description>`

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (formatting, missing semicolons, etc.)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Build, dependencies, tooling

### Pull Request Process

1. **Keep it focused** — One feature/fix per PR
2. **Add a clear title** — e.g., "Add Mercari listing support"
3. **Describe what changed and why** — Use the PR template
4. **Link related issues** — e.g., "Closes #123"
5. **Be open to feedback** — Maintainers may request changes
6. **Wait for CI checks to pass** — Tests and linting must pass
7. **One approval, then merge** — Maintainer will merge when ready

### Community Areas

We especially need help with:

#### AI & Prompting
- Refining the clothing analysis prompt
- Testing accuracy on different clothing types (vintage, designer, athletic)
- Improving brand/tag detection
- Condition grading accuracy

#### Frontend
- UI/UX improvements to photo upload flow
- Mobile responsiveness testing
- Accessibility improvements (a11y)
- Visual refinement

#### Backend
- eBay API edge cases and error handling
- Database schema optimizations
- Performance improvements
- API documentation

#### Documentation
- Setup guides for different platforms
- API documentation for self-hosters
- Video tutorials
- Troubleshooting guides

#### Marketplace Integrations
- Research Poshmark/Mercari/Depop APIs
- Browser automation testing (Playwright)
- Platform-specific description/title formatting
- Rate limiting and error handling

#### Community
- Crowdsourced brand resale value database
- Condition grading visual guides
- Clothing-specific AI prompt templates
- Best practices for different clothing niches

## Getting Help

- **GitHub Discussions** — Ask questions, discuss ideas
- **Issues** — Report bugs or request features
- **Code review feedback** — Maintainers will provide constructive feedback on PRs

## Recognition

Contributors will be:
- Added to the README.md contributors section
- Acknowledged in release notes
- Part of the open source community building Tailor AI

---

**Thank you for contributing!** 🎉 Let's build something great together.
