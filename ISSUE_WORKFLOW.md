# 📋 Issue-Based Development Workflow

**CropWise Development Process**  
**Version:** 1.0  
**Last Updated:** November 2025

---

## 🎯 Core Principles

### The Four Rules

1. **Every change requires a GitHub issue** - No exceptions (except emergencies)
2. **No direct commits to protected branches** - main and develop are protected
3. **All changes via Pull Requests** - Code review is mandatory
4. **Every PR must link to an issue** - Automated validation enforces this

### Why Issue-Based Workflow?

✅ **Traceability** - Know why every change was made  
✅ **Planning** - Organize work before coding  
✅ **Collaboration** - Discuss approach before implementation  
✅ **Documentation** - Issues serve as project history  
✅ **Quality** - Forced code review catches bugs early

---

## 🔄 The Complete Workflow

### Overview

```
1. Create Issue → 2. Create Branch → 3. Make Changes → 
4. Create PR → 5. Review → 6. Merge → 7. Deploy → 8. Close Issue
```

---

### Step 1: Create GitHub Issue

**Before writing any code**, create an issue describing what you want to do.

#### Issue Types

| Type | Prefix | When to Use | Example |
|------|--------|-------------|---------|
| Feature | `[FEATURE]` | New functionality | `[FEATURE] Add export to CSV button` |
| Bug | `[BUG]` | Something broken | `[BUG] Login fails with special characters` |
| Task | `[TASK]` | Work that needs doing | `[TASK] Update dependencies` |
| Documentation | `[DOCS]` | Documentation changes | `[DOCS] Add API authentication guide` |
| Refactoring | `[REFACTOR]` | Code improvement | `[REFACTOR] Simplify auth middleware` |

#### Creating an Issue

```bash
# Via GitHub Web UI
1. Go to repository → Issues → New Issue
2. Select appropriate template
3. Fill in title, description, acceptance criteria
4. Add labels
5. Submit

# Via GitHub CLI (faster)
gh issue create \
  --title "[FEATURE] Add CSV export" \
  --label "feature,enhancement" \
  --body "Users need to export harvest data..."
```

#### Good Issue Template

```markdown
## Description
Clear explanation of what needs to be done.

## Acceptance Criteria
- [ ] Specific testable criteria
- [ ] Another criterion
- [ ] Final criterion

## Technical Notes
- Implementation details
- API endpoints affected
- Database changes needed

## Related Issues
Closes #123
Relates to #456
```

---

### Step 2: Create Feature Branch

**Branch from:** `develop` (unless hotfix, then from `main`)

#### Branch Naming Convention

Format: `<type>/<issue-number>-<short-description>`

```bash
# Examples
feature/42-csv-export
bugfix/99-login-validation
docs/15-api-guide
refactor/7-auth-middleware
hotfix/101-critical-security-fix

# Create branch
git checkout develop
git pull origin develop
git checkout -b feature/42-csv-export
```

#### Branch Naming Rules

- **Use lowercase** with hyphens
- **Include issue number** for easy tracking
- **Short but descriptive** (max 50 chars)
- **Type prefix** matches issue type

---

### Step 3: Make Changes

#### Commit Message Format

```
<type>: <short description> [#<issue>]

<optional longer description>

<optional footer>
```

**Types:** feat, fix, docs, refactor, test, chore, style

#### Examples

```bash
# Good commits
git commit -m "feat: add CSV export button to harvest page [#42]"
git commit -m "fix: validate special chars in login form [#99]"
git commit -m "docs: add authentication guide to API docs [#15]"

# Bad commits (don't do this)
git commit -m "updates"
git commit -m "fix bug"
git commit -m "WIP"
```

#### Commit Best Practices

✅ **Make small, logical commits** - One feature/fix per commit  
✅ **Write clear messages** - Future you will thank you  
✅ **Reference issue number** - Enables automatic linking  
✅ **Test before committing** - Don't commit broken code  
✅ **Push frequently** - Don't lose work

```bash
# Working on issue #42
git add src/components/ExportButton.jsx
git commit -m "feat: create CSV export button component [#42]"

git add src/pages/Harvest.jsx
git commit -m "feat: integrate export button in harvest page [#42]"

git add tests/ExportButton.test.js
git commit -m "test: add unit tests for CSV export [#42]"

git push origin feature/42-csv-export
```

---

### Step 4: Create Pull Request

#### When to Create PR

- ✅ Feature complete (meets acceptance criteria)
- ✅ All tests passing locally
- ✅ Code follows style guide
- ✅ Documentation updated
- ✅ Self-reviewed your code

#### PR Title Format

**Must include issue link:**

```
[Fixes #42] Add CSV export functionality to harvest page
[Closes #99] Fix login validation for special characters
[Resolves #15] Add authentication guide to API documentation
```

**Keywords that close issues:**
- `Fixes #123`
- `Closes #123`
- `Resolves #123`

#### Creating PR

```bash
# Via GitHub Web UI
1. Push your branch
2. Go to repository → Pull Requests → New
3. Base: develop ← Compare: your-branch
4. Fill in title (with [Fixes #X])
5. Use PR template
6. Request reviewers
7. Create PR

# Via GitHub CLI
gh pr create \
  --title "[Fixes #42] Add CSV export functionality" \
  --body "Implements CSV export as described in #42" \
  --base develop \
  --head feature/42-csv-export \
  --reviewer @teammate
```

#### PR Description Template

```markdown
## Issue
Fixes #42

## Changes
- Added CSV export button component
- Integrated button in harvest page
- Added unit tests
- Updated user documentation

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manually tested on Chrome/Firefox
- [ ] Tested with large datasets (1000+ records)

## Screenshots
[If UI changes, add screenshots]

## Checklist
- [x] Code follows style guide
- [x] Self-reviewed code
- [x] Added/updated tests
- [x] Updated documentation
- [x] No console errors
- [x] Branch up to date with develop
```

---

### Step 5: Code Review

#### For PR Author

**After creating PR:**
1. ✅ Verify CI/CD checks pass
2. ✅ Check PR description is clear
3. ✅ Respond to review comments promptly
4. ✅ Push fixes to same branch (auto-updates PR)
5. ✅ Request re-review after changes

#### For Reviewer

**What to check:**
- ✅ Code quality and readability
- ✅ Logic errors or bugs
- ✅ Security issues
- ✅ Performance concerns
- ✅ Tests cover new code
- ✅ Documentation updated
- ✅ Follows project conventions

**Review guidelines:**
- 🎯 Be constructive, not critical
- 💬 Ask questions, don't demand
- ✅ Approve if minor issues (suggest changes)
- 🔴 Request changes if major issues
- ⏱️ Review within 24 hours

```bash
# Approve PR
gh pr review 42 --approve --body "LGTM! Great work on the tests."

# Request changes
gh pr review 42 --request-changes --body "Please handle error case on line 45"

# Just comment
gh pr review 42 --comment --body "Consider using useMemo here for performance"
```

---

### Step 6: Merge Pull Request

#### Merge Requirements (Automated Checks)

Before merge is allowed:
- ✅ All CI/CD checks pass
- ✅ At least 1 approval
- ✅ No requested changes
- ✅ Branch up to date with base
- ✅ Issue linked to PR
- ✅ Conversations resolved

#### Merge Strategy

**For develop branch:**
- Use "**Squash and Merge**" (clean history)
- Edit commit message to be concise

**For main branch (releases):**
- Use "**Create a merge commit**" (preserve release history)

```bash
# Merge via GitHub CLI
gh pr merge 42 --squash --delete-branch

# Or via Web UI
1. Click "Squash and merge"
2. Edit commit message if needed
3. Confirm merge
4. Delete branch
```

---

### Step 7: Deploy

#### Automatic Deployment

**After merge to develop:**
- ✅ CI/CD automatically builds
- ✅ Tests run
- ✅ Deploys to **staging** environment
- ✅ Smoke tests run

**After merge to main:**
- ✅ CI/CD automatically builds
- ✅ Full test suite runs
- ✅ Deploys to **production**
- ✅ Post-deploy verification

#### Manual Verification

After deployment:
1. Check deployment logs
2. Verify feature works in staging/prod
3. Monitor error logs for 15 minutes
4. Update issue with deployment notes

---

### Step 8: Close Issue

**Issues close automatically** when PR with `Fixes #X` merges.

**If manual close needed:**
```bash
gh issue close 42 --comment "Deployed to production successfully"
```

**Before closing, verify:**
- ✅ Deployed to production
- ✅ Feature works as expected
- ✅ No new errors in logs
- ✅ Acceptance criteria met

---

## 🚨 Emergency Hotfixes

### When to Use Hotfix Workflow

**ONLY for critical production issues:**
- 🔥 Site is down
- 🔒 Security vulnerability
- 💔 Data corruption risk
- 🐛 Critical bug affecting all users

### Hotfix Process

```bash
# 1. Create issue IMMEDIATELY
gh issue create \
  --title "[HOTFIX] Critical login bug blocking all users" \
  --label "bug,hotfix,priority-critical"

# 2. Branch from MAIN (not develop)
git checkout main
git pull origin main
git checkout -b hotfix/123-critical-login-bug

# 3. Fix the issue (minimal changes)
# Only fix the critical issue, nothing else!

# 4. Create PR to main (expedited review)
gh pr create \
  --title "[HOTFIX] Fix critical login bug [Fixes #123]" \
  --base main \
  --label "hotfix" \
  --assignee @lead-developer

# 5. Fast-track review (< 1 hour)
# Get immediate review from available team member

# 6. Deploy ASAP after merge

# 7. Backport to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### Hotfix Exemptions

- ❌ No waiting for multiple reviews
- ❌ No waiting for full CI (only critical tests)
- ✅ Issue still required
- ✅ PR still required
- ✅ Post-deploy monitoring critical

---

## 📊 Workflow Cheat Sheet

### Quick Reference

```bash
# Start new feature
gh issue create --title "[FEATURE] My feature"
git checkout -b feature/42-my-feature
# ... make changes ...
git commit -m "feat: implement feature [#42]"
git push origin feature/42-my-feature
gh pr create --title "[Fixes #42] My feature"

# Start bug fix
gh issue create --title "[BUG] Bug description"
git checkout -b bugfix/99-bug-description
# ... fix bug ...
git commit -m "fix: resolve bug [#99]"
git push origin bugfix/99-bug-description
gh pr create --title "[Fixes #99] Bug description"

# Add documentation
gh issue create --title "[DOCS] Doc needed"
git checkout -b docs/15-doc-needed
# ... write docs ...
git commit -m "docs: add documentation [#15]"
git push origin docs/15-doc-needed
gh pr create --title "[Closes #15] Doc description"

# Emergency hotfix
gh issue create --title "[HOTFIX] Critical issue"
git checkout main
git checkout -b hotfix/101-critical-issue
# ... fix critical issue ...
git commit -m "fix: critical issue [#101]"
git push origin hotfix/101-critical-issue
gh pr create --title "[HOTFIX] Critical fix [Fixes #101]" --base main
```

---

## ❌ Common Mistakes

### DON'T Do These Things

```bash
# ❌ Commit directly to develop/main
git checkout develop
git commit -m "quick fix"  # BLOCKED BY BRANCH PROTECTION

# ❌ Create PR without issue
gh pr create --title "Add feature"  # BLOCKED BY PR VALIDATOR

# ❌ Use generic commit messages
git commit -m "updates"  # Not helpful

# ❌ Commit unfinished work
git commit -m "WIP"  # Use draft PR instead

# ❌ Force push to shared branches
git push --force origin develop  # NEVER DO THIS

# ❌ Skip code review
# Can't merge without approval
```

---

## ✅ Best Practices

### Issue Management

- 📝 Write clear, detailed issues
- 🏷️ Use appropriate labels
- 🎯 Define acceptance criteria
- 🔗 Link related issues
- 💬 Update issue with progress

### Branch Management

- 🌿 Keep branches short-lived (< 3 days)
- 🔄 Sync with develop daily
- 🧹 Delete after merge
- 📦 Keep changes focused (one issue = one PR)

### Code Quality

- ✅ Write tests for new code
- 📖 Update documentation
- 🎨 Follow style guide
- 🔍 Self-review before PR
- 💬 Add code comments for complex logic

### Communication

- 💬 Comment on issues with questions
- 📸 Add screenshots for UI changes
- 🔗 Reference related PRs/issues
- ✅ Update stakeholders on progress
- 🚀 Announce deployments

---

## 📚 Related Documentation

- [Branch Protection Setup](SETUP_BRANCH_PROTECTION.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Git Workflow](docs/GIT_WORKFLOW.md)
- [Release Process](docs/RELEASE_PROCESS.md)
- [CI/CD Setup](CICD_SETUP_COMPLETE.md)

---

## 🆘 Getting Help

**Stuck? Questions?**

1. 💬 Ask in team chat
2. 📝 Comment on the issue
3. 👥 Tag team lead in PR
4. 📖 Check documentation
5. 🎫 Create discussion issue

---

## 🔄 Workflow Version History

- **v1.0** (Nov 2024): Initial issue-based workflow
- Future: May add project boards, automated deployment gates

---

**Remember:** This workflow ensures quality, traceability, and collaboration. It might feel slower at first, but it prevents bugs and technical debt in the long run! 🚀

---

**Questions?** Create an issue with label `question` 😊

