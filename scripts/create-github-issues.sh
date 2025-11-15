#!/bin/bash
# Create all GitHub issues for CropWise project
# Requires: GitHub CLI (gh) - https://cli.github.com/

set -e

echo "=================================================="
echo "  Creating GitHub Issues for CropWise"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI ready"
echo ""

# Check if labels exist, if not suggest running label setup
echo "Checking for required labels..."
if ! gh label list | grep -q "task" 2>/dev/null; then
    echo "⚠️  Labels not found. Creating basic labels..."
    gh label create "task" --color "0e8a16" --description "General task" --force 2>/dev/null || true
    gh label create "documentation" --color "0075ca" --description "Documentation" --force 2>/dev/null || true
    gh label create "refactor" --color "fbca04" --description "Code refactoring" --force 2>/dev/null || true
    gh label create "priority-high" --color "d93f0b" --description "High priority" --force 2>/dev/null || true
    gh label create "priority-critical" --color "b60205" --description "Critical priority" --force 2>/dev/null || true
    gh label create "aws" --color "FF9900" --description "AWS related" --force 2>/dev/null || true
    gh label create "github" --color "000000" --description "GitHub related" --force 2>/dev/null || true
    gh label create "ci-cd" --color "5319e7" --description "CI/CD related" --force 2>/dev/null || true
    gh label create "testing" --color "c5def5" --description "Testing related" --force 2>/dev/null || true
    echo "✅ Basic labels created"
fi
echo ""

# Issue #1: Verify Rebranding
echo "Creating Issue #1: Verify CropWise rebranding..."
gh issue create \
  --title "[TASK] Verify CropWise rebranding across entire codebase" \
  --label "task,testing,priority-high" \
  --body "## 📋 Task Description
Verify that the automated rebranding from SmartCrop to CropWise was successful across all 167 updated files.

## 🎯 Acceptance Criteria
- [ ] Review \`git diff\` for all changes
- [ ] Verify README.md shows CropWise branding
- [ ] Check CHANGELOG.md has rebrand notice
- [ ] Test Docker Compose: \`docker-compose up -d\`
- [ ] Test Backend starts: \`cd backend && npm start\`
- [ ] Test Frontend starts: \`cd frontend && npm run dev\`
- [ ] Check frontend UI shows \"CropWise\" not \"SmartCrop\"
- [ ] Verify all links still work
- [ ] Check package.json files are correct

## 🔗 Related
- Rebranding script: \`scripts/rebrand-to-cropwise.py\`
- Plan: \`REBRANDING_AND_DOCS_PLAN.md\`

## ✅ Definition of Done
- [ ] All services start without errors
- [ ] No \"SmartCrop\" references in user-facing UI
- [ ] PR created with verification results
- [ ] Changes committed to develop branch" || echo "⚠️  Issue #1 may already exist"

echo ""

# Issue #2: Consolidate Quick Start
echo "Creating Issue #2: Consolidate Quick Start guides..."
gh issue create \
  --title "[DOCS] Consolidate Quick Start and Installation Guides" \
  --label "documentation,refactor" \
  --body "## 📚 Documentation Task

Consolidate 4 overlapping quick start/installation guides into 2 well-organized files.

## Current Files (4)
- \`QUICK_START.md\`
- \`CROPWISE_QUICK_START.md\`
- \`docs/GETTING_STARTED.md\`
- \`docs/INSTALLATION.md\`

## Target Structure
- \`QUICK_START.md\` - 5-minute Docker setup only
- \`docs/INSTALLATION.md\` - Comprehensive guide for all platforms
- \`docs/FIRST_STEPS.md\` - Post-install tutorial

See \`GITHUB_ISSUES_TO_CREATE.md\` for full details." || echo "⚠️  Issue #2 may already exist"

echo ""

# Issue #3: Consolidate AWS Guides
echo "Creating Issue #3: Consolidate AWS deployment guides..."
gh issue create \
  --title "[DOCS] Consolidate AWS deployment guides into single comprehensive guide" \
  --label "documentation,refactor,aws" \
  --body "## 📚 Documentation Task

Merge 7 scattered AWS deployment files into ONE comprehensive guide.

## Current Files (7)
1. \`DEPLOY_TO_AWS_NOW.md\`
2. \`AWS_INFRASTRUCTURE_SETUP.md\`
3. \`AWS_RDS_POSTGRESQL_SETUP.md\`
4. \`AWS_SECURITY_CHECKLIST.md\`
5. \`docs/AWS_DEPLOYMENT_GUIDE.md\`
6. \`docs/AWS_QUICK_START.md\`
7. \`QUICK_START_ELASTIC_BEANSTALK.md\`

## Target
Single file: \`docs/AWS_DEPLOYMENT.md\` with 9 chapters

See \`GITHUB_ISSUES_TO_CREATE.md\` for full details." || echo "⚠️  Issue #3 may already exist"

echo ""

# Issue #4: Consolidate GitHub Guides
echo "Creating Issue #4: Consolidate GitHub setup guides..."
gh issue create \
  --title "[DOCS] Consolidate GitHub and workflow documentation" \
  --label "documentation,refactor,github" \
  --body "## 📚 Documentation Task

Consolidate 6 GitHub/workflow files into 2 organized guides.

## Current Files (6)
- \`SETUP_BRANCH_PROTECTION.md\`
- \`GITHUB_SETUP_CHECKLIST.md\`
- \`docs/GITHUB_SETUP_GUIDE.md\`
- \`WORKFLOW_DIAGRAM.md\`
- \`docs/GIT_WORKFLOW.md\`
- \`CICD_SETUP_COMPLETE.md\`

## Target
- \`docs/GITHUB_SETUP.md\` - Consolidated setup guide
- \`docs/GIT_WORKFLOW.md\` - Enhanced with diagrams

See \`GITHUB_ISSUES_TO_CREATE.md\` for full details." || echo "⚠️  Issue #4 may already exist"

echo ""

# Issue #5: Reorganize Documentation
echo "Creating Issue #5: Reorganize documentation structure..."
gh issue create \
  --title "[REFACTOR] Reorganize documentation into 8-category structure" \
  --label "refactor,documentation,priority-high" \
  --body "## 🔧 Refactoring Task

Reorganize 72 markdown files into a clean 8-category structure.

## Problem
- 42 files in root (should be ~5)
- Hard to find information
- ~30% duplicate content

## Solution
Create 8-category structure:
- 01-getting-started/
- 02-development/
- 03-deployment/
- 04-operations/
- 05-features/
- 06-integrations/
- 07-reference/
- 08-team/

See \`REBRANDING_AND_DOCS_PLAN.md\` for full plan." || echo "⚠️  Issue #5 may already exist"

echo ""

# Issue #6: Documentation Hub
echo "Creating Issue #6: Create documentation hub..."
gh issue create \
  --title "[DOCS] Create docs/README.md as central documentation hub" \
  --label "documentation" \
  --body "## 📚 Documentation Task

Create a central \`docs/README.md\` file that serves as the main entry point for all documentation.

## Content
- Quick links to key documentation
- Documentation organized by category (8 categories)
- Role-based guides (users, developers, devops, contributors)
- Search tips

See \`GITHUB_ISSUES_TO_CREATE.md\` for structure." || echo "⚠️  Issue #6 may already exist"

echo ""

# Issue #7: Archive Historical Docs
echo "Creating Issue #7: Archive historical documents..."
gh issue create \
  --title "[REFACTOR] Move historical documents to archive" \
  --label "refactor,documentation" \
  --body "## 🔧 Refactoring Task

Move outdated/historical documents to \`docs/archive/\` directory.

## Files to Archive
- \`EXECUTIVE_SUMMARY.md\`
- \`HARVEST_SYSTEM_COMPLETE.md\`
- \`HARVEST_TRACKING_SUMMARY.md\`
- \`COMMERCIALIZATION_STATUS.md\`
- \`README_UPDATE.md\`
- \`REGISTRATION_FIX.md\`
- \`MIGRATION_PLAN.md\`

Use \`git mv\` to preserve history." || echo "⚠️  Issue #7 may already exist"

echo ""

# Issue #8: Branch Protection
echo "Creating Issue #8: Update branch protection rules..."
gh issue create \
  --title "[TASK] Update branch protection to prevent direct commits" \
  --label "task,github,priority-critical" \
  --body "## 📋 Task Description

Update branch protection rules for \`main\` and \`develop\` branches to enforce issue-based workflow.

## Requirements
- ✅ NO direct commits to main/develop
- ✅ All changes via Pull Request
- ✅ Every PR must link to GitHub issue
- ✅ Status checks must pass
- ✅ At least 1 review required

## Branch Protection Settings

### For \`main\` branch:
- Require pull request before merging
- Require 1 approval
- Require status checks (CI/CD)
- Include administrators
- Restrict direct pushes
- No force pushes
- No deletions

### For \`develop\` branch:
- Require pull request before merging
- Require 1 approval
- Require status checks
- Require linked issue
- Include administrators

See \`GITHUB_ISSUES_TO_CREATE.md\` for full details." || echo "⚠️  Issue #8 may already exist"

echo ""

# Issue #9: Workflow Guide
echo "Creating Issue #9: Create issue-based workflow guide..."
gh issue create \
  --title "[DOCS] Create comprehensive issue-based workflow guide" \
  --label "documentation,github,priority-high" \
  --body "## 📚 Documentation Task

Create complete guide for the new issue-based development workflow.

## Content Needed
- Core principles (4 rules)
- Complete workflow (8 steps)
- Issue types and templates
- Branch naming conventions
- PR title format
- Emergency hotfix process
- Cheat sheet
- Common mistakes
- Best practices

File created: \`ISSUE_WORKFLOW.md\` (needs review and enhancement)

See \`GITHUB_ISSUES_TO_CREATE.md\` for details." || echo "⚠️  Issue #9 may already exist"

echo ""

# Issue #10: Enhance PR Validation
echo "Creating Issue #10: Enhance PR validation..."
gh issue create \
  --title "[TASK] Enhance PR validation to require linked GitHub issues" \
  --label "task,ci-cd,github" \
  --body "## 📋 Task Description

Enhance existing PR issue validator to be more strict and informative.

## Desired Enhancements
1. Strict validation - block PR if no issue linked
2. Better feedback - comment with instructions
3. Exemptions - dependabot, hotfixes

## Files
- \`.github/workflows/pr-issue-validator.yml\`

See \`GITHUB_ISSUES_TO_CREATE.md\` for full requirements." || echo "⚠️  Issue #10 may already exist"

echo ""
echo "=================================================="
echo "  ✅ GitHub Issues Created!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Review issues on GitHub"
echo "2. Set up branch protection (Issue #8)"
echo "3. Start working on Issue #1 (verify rebranding)"
echo ""
echo "View issues: gh issue list"
echo "View in browser: gh repo view --web"

