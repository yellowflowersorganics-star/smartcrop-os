# 🤝 Contributing to SmartCrop OS

Thank you for your interest in contributing to SmartCrop OS! This document provides guidelines and best practices for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Message Guidelines](#commit-message-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Review Process](#review-process)
9. [Community](#community)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. We pledge to make participation in our project a harassment-free experience for everyone, regardless of:

- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Examples of behavior that contributes to creating a positive environment:**

- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints and experiences
- ✅ Gracefully accepting constructive criticism
- ✅ Focusing on what is best for the community
- ✅ Showing empathy towards other community members

**Examples of unacceptable behavior:**

- ❌ Trolling, insulting/derogatory comments, and personal or political attacks
- ❌ Public or private harassment
- ❌ Publishing others' private information without explicit permission
- ❌ Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed
- ✅ **Git** installed and configured
- ✅ **Docker** (optional, for local testing)
- ✅ **PostgreSQL** or **SQLite** for development
- ✅ A **GitHub account**

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# Click the "Fork" button at https://github.com/your-org/smartcrop-os

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/smartcrop-os.git
cd smartcrop-os

# 3. Add upstream remote
git remote add upstream https://github.com/your-org/smartcrop-os.git

# 4. Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Local Development Setup

```bash
# Start backend (development mode)
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

Visit `http://localhost:8080` to see the application.

---

## 🔄 Development Workflow

We follow **GitFlow** workflow. Please read [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) for detailed instructions.

### Quick Workflow Summary:

```bash
# 1. Update your local develop branch
git checkout develop
git pull upstream develop

# 2. Create a feature branch
git checkout -b feature/add-awesome-feature

# 3. Make your changes
# ... write code ...

# 4. Commit your changes
git add .
git commit -m "feat: add awesome feature"

# 5. Push to your fork
git push origin feature/add-awesome-feature

# 6. Create a Pull Request on GitHub
# - Base: develop
# - Compare: feature/add-awesome-feature
# - Fill in the PR template
```

---

## 💻 Coding Standards

### JavaScript/Node.js Style Guide

We follow **Airbnb JavaScript Style Guide** with some modifications.

**Key Points:**

```javascript
// ✅ Good
const calculateYield = (batch) => {
  if (!batch) {
    throw new Error('Batch is required');
  }
  
  const totalYield = batch.harvests.reduce((sum, h) => sum + h.yield_kg, 0);
  return totalYield;
};

// ❌ Bad
function calc_yield(batch){
  var total=0
  for(var i=0;i<batch.harvests.length;i++){
    total+=batch.harvests[i].yield_kg
  }
  return total
}
```

**Rules:**

- ✅ Use `const` and `let`, never `var`
- ✅ Use arrow functions for callbacks
- ✅ Use template literals for string concatenation
- ✅ Use destructuring when appropriate
- ✅ Use async/await instead of callbacks
- ✅ Add JSDoc comments for functions
- ✅ Use meaningful variable names
- ❌ No `console.log()` in production code
- ❌ No commented-out code
- ❌ No trailing whitespace

### React/JSX Style Guide

```jsx
// ✅ Good
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FarmCard = ({ farm, onEdit }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await onEdit(farm.id);
    } catch (error) {
      console.error('Edit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="farm-card">
      <h3>{farm.name}</h3>
      <button onClick={handleEdit} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Edit'}
      </button>
    </div>
  );
};

FarmCard.propTypes = {
  farm: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FarmCard;
```

### File Naming Conventions

```
backend/
  src/
    controllers/
      farm.controller.js       ✅ (lowercase, dot notation)
    models/
      Farm.js                  ✅ (PascalCase for classes)
    utils/
      logger.js                ✅ (lowercase)

frontend/
  src/
    components/
      FarmCard.jsx             ✅ (PascalCase for React components)
    pages/
      Dashboard.jsx            ✅ (PascalCase)
    services/
      farm.service.js          ✅ (lowercase, dot notation)
```

### Linting

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix
```

---

## 🧪 Testing Guidelines

### Writing Tests

Every feature should include tests:

```javascript
// backend/src/controllers/__tests__/farm.controller.test.js
const request = require('supertest');
const app = require('../../app');
const { Farm } = require('../../models');

describe('Farm Controller', () => {
  describe('GET /api/farms', () => {
    it('should return all farms for authenticated user', async () => {
      const token = 'valid_jwt_token';
      
      const response = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/farms')
        .expect(401);
    });
  });
});
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# With coverage
npm test -- --coverage
```

### Test Coverage Requirements

- **Minimum coverage**: 80%
- **Critical paths**: 100% (authentication, payment, data integrity)
- **New features**: Must include tests

---

## 📝 Commit Message Guidelines

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic changes)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
# Good commit messages
feat(auth): add Google OAuth integration
fix(dashboard): resolve chart rendering issue
docs(api): update harvest endpoints documentation
refactor(models): simplify batch status logic
perf(query): optimize farm listing query

# Bad commit messages
update stuff
fix bug
changes
WIP
```

### Detailed Example

```bash
feat(harvest): add multi-flush harvest recording

Implemented the ability to record multiple harvests (flushes)
for a single batch. Each harvest can have different yields,
quality grades, and notes.

Features:
- Add flush number to harvest model
- Calculate total yield across all flushes
- Display flush history in batch detail view

Closes #123
```

---

## 🔍 Pull Request Process

### Before Creating a PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No linting errors
- [ ] No console.log() statements
- [ ] Branch is up to date with develop

### Creating a PR

1. **Push your branch** to your fork
2. **Go to GitHub** and create a Pull Request
3. **Fill in the template** completely
4. **Add labels** (feature, bug, documentation, etc.)
5. **Request reviewers** (at least one)
6. **Link related issues** using keywords (Closes #123)

### PR Checklist

```markdown
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented hard-to-understand areas
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged
```

### PR Size Guidelines

- **Small**: 1-100 lines (ideal)
- **Medium**: 101-400 lines (acceptable)
- **Large**: 401-1000 lines (break it down if possible)
- **Extra Large**: 1000+ lines (requires special justification)

---

## 👀 Review Process

### For Authors

- Respond to review comments within 24 hours
- Be open to feedback
- Don't take criticism personally
- Ask questions if you don't understand feedback
- Update the PR based on feedback
- Mark conversations as resolved when addressed

### For Reviewers

- Review within 24 hours
- Be constructive, not critical
- Explain why changes are needed
- Ask questions instead of making demands
- Approve when satisfied
- Test locally if possible

### Review Checklist for Reviewers

**Functionality:**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] No code duplication
- [ ] Functions are small and focused
- [ ] Variable names are meaningful

**Testing:**
- [ ] Tests cover new functionality
- [ ] Tests are meaningful
- [ ] All tests pass

**Documentation:**
- [ ] Code is commented where necessary
- [ ] API changes are documented
- [ ] README updated if needed

**Security:**
- [ ] No security vulnerabilities
- [ ] Input validation is present
- [ ] No sensitive data exposed

---

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md):

1. Go to Issues → New Issue
2. Select "Bug Report"
3. Fill in all sections
4. Add relevant labels
5. Submit

---

## ✨ Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md):

1. Go to Issues → New Issue
2. Select "Feature Request"
3. Explain the problem and proposed solution
4. Add mockups if applicable
5. Submit

---

## 🌍 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Slack**: Real-time chat (ask for invite)
- **Email**: support@smartcrop.io

### Getting Help

- Check [documentation](docs/)
- Search [existing issues](https://github.com/your-org/smartcrop-os/issues)
- Ask in GitHub Discussions
- Join our Slack channel

---

## 🎓 Learning Resources

### SmartCrop OS Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Git Workflow](docs/GIT_WORKFLOW.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [AWS Deployment](docs/AWS_DEPLOYMENT_GUIDE.md)

### External Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📊 Project Statistics

Help us improve! We track:

- PR merge time (target: < 24 hours)
- Test coverage (target: > 80%)
- Code quality score
- Community contributions

---

## 🙏 Recognition

All contributors are recognized in:

- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- GitHub Contributors page
- Release notes

---

## ⚖️ License

By contributing to SmartCrop OS, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## 📞 Contact

- **Project Lead**: [your-email@example.com]
- **Support**: support@smartcrop.io
- **Security**: security@smartcrop.io

---

## 🎉 Thank You!

Thank you for contributing to SmartCrop OS! Your contributions help make farming smarter and more sustainable. 🌱🚀

**Happy Coding!** 💚

