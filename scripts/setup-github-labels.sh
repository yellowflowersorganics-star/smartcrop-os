#!/bin/bash
# Setup GitHub Labels for CropWise
# Creates all labels needed for issue-based workflow

set -e

echo "=================================================="
echo "  Setting Up GitHub Labels for CropWise"
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

# Function to create or update label
create_label() {
    local name=$1
    local color=$2
    local description=$3
    
    echo "Creating label: $name"
    gh label create "$name" \
        --color "$color" \
        --description "$description" \
        --force 2>/dev/null || echo "  ✓ Label '$name' already exists"
}

echo "Creating issue type labels..."
create_label "bug" "d73a4a" "Something isn't working"
create_label "feature" "a2eeef" "New feature or request"
create_label "enhancement" "a2eeef" "Improvement to existing feature"
create_label "task" "0e8a16" "General development task"
create_label "documentation" "0075ca" "Documentation improvements"
create_label "refactor" "fbca04" "Code refactoring or restructuring"

echo ""
echo "Creating priority labels..."
create_label "priority-critical" "b60205" "Critical priority - drop everything"
create_label "priority-high" "d93f0b" "High priority"
create_label "priority-medium" "fbca04" "Medium priority"
create_label "priority-low" "0e8a16" "Low priority"

echo ""
echo "Creating status labels..."
create_label "in-progress" "d4c5f9" "Currently being worked on"
create_label "blocked" "d73a4a" "Blocked by something"
create_label "needs-review" "fbca04" "Needs review"
create_label "needs-testing" "fbca04" "Needs testing"
create_label "ready-to-merge" "0e8a16" "Ready to merge"

echo ""
echo "Creating category labels..."
create_label "aws" "FF9900" "AWS related"
create_label "github" "000000" "GitHub related"
create_label "ci-cd" "5319e7" "CI/CD pipeline related"
create_label "frontend" "1d76db" "Frontend related"
create_label "backend" "006b75" "Backend related"
create_label "iot" "ff6b6b" "IoT/Edge devices related"
create_label "database" "006b75" "Database related"
create_label "security" "d73a4a" "Security related"

echo ""
echo "Creating special labels..."
create_label "hotfix" "b60205" "Emergency production fix"
create_label "question" "d876e3" "Question or discussion"
create_label "good-first-issue" "7057ff" "Good for newcomers"
create_label "help-wanted" "008672" "Extra attention is needed"
create_label "duplicate" "cfd3d7" "Duplicate of another issue"
create_label "wontfix" "ffffff" "This will not be worked on"
create_label "invalid" "e4e669" "Invalid issue"

echo ""
echo "Creating testing labels..."
create_label "testing" "c5def5" "Testing related"
create_label "needs-test" "d4c5f9" "Needs test coverage"

echo ""
echo "=================================================="
echo "  ✅ GitHub Labels Setup Complete!"
echo "=================================================="
echo ""
echo "Labels created:"
echo "  - Issue types: bug, feature, task, docs, refactor"
echo "  - Priorities: critical, high, medium, low"
echo "  - Status: in-progress, blocked, needs-review"
echo "  - Categories: aws, github, ci-cd, frontend, backend, iot"
echo "  - Special: hotfix, question, good-first-issue"
echo ""
echo "View labels: gh label list"
echo "Next: Run ./scripts/create-github-issues.sh"

