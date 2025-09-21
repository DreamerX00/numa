# 🤝 Contributing to NUMA

Thank you for your interest in contributing to NUMA! We welcome all types of contributions, from bug reports to feature requests to code contributions.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/numa.git
   cd numa
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```
5. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/your-feature-name` - Feature branches
- `bugfix/issue-description` - Bug fix branches
- `hotfix/critical-fix` - Critical production fixes

### Making Changes

1. **Create a new branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

4. **Commit your changes** using conventional commits

5. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** to `develop` branch

## 🎨 Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use strict mode settings

### Code Style

- **ESLint**: All code must pass ESLint checks
- **Prettier**: Use Prettier for code formatting
- **File naming**: Use kebab-case for files and folders
- **Component naming**: Use PascalCase for React components

### React/Next.js

- Use functional components with hooks
- Prefer server components when possible
- Use proper error boundaries
- Implement proper loading states
- Follow Next.js App Router conventions

### CSS/Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use semantic class names
- Maintain consistent spacing and typography

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Include request/response validation
- Add rate limiting where appropriate

## 📝 Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add Google OAuth integration
fix(cart): resolve quantity update issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): improve error handling
test(auth): add login flow tests
chore(deps): update dependencies
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by at least one maintainer
3. **Testing** verification
4. **Approval** and merge to develop
5. **Release** planning for main branch

## 🐛 Bug Reports

When reporting bugs, please include:

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.

**Implementation ideas**
If you have ideas about how to implement this feature.
```

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   └── pages/          # Page-specific components
├── lib/                # Utility functions and configurations
│   ├── auth/           # Authentication utilities
│   ├── api/            # API utilities
│   ├── utils/          # General utilities
│   └── types/          # TypeScript type definitions
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all utility functions
- Test React components with React Testing Library
- Aim for good test coverage

### Integration Tests

- Test API endpoints
- Test authentication flows
- Test payment processing

### E2E Tests

- Test critical user journeys
- Test admin functionality
- Test responsive design

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🙋‍♀️ Questions?

If you have questions, please:

1. Check existing [issues](https://github.com/DreamerX00/numa/issues)
2. Search [discussions](https://github.com/DreamerX00/numa/discussions)
3. Create a new issue or discussion
4. Contact maintainers directly

Thank you for contributing to NUMA! 🚀