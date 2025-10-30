#!/bin/bash

# Framework Validation Script
# Validates framework import and configuration

set -e

TARGET_DIR="${1:-.}"

echo "🔍 UYSP Framework Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VALIDATION_ERRORS=0

# Check directory structure
echo "🔸 Checking Directory Structure..."
REQUIRED_DIRS=("cursorrules" "context" "patterns" "tests" "scripts" "docs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$TARGET_DIR/$dir" ]; then
        echo "✅ $dir/ exists"
    else
        echo "❌ $dir/ missing"
        ((VALIDATION_ERRORS++))
    fi
done

# Check documentation structure
echo ""
echo "🔸 Checking Documentation Structure..."
DOC_DIRS=("docs/CURRENT" "docs/PROCESS" "docs/ARCHITECTURE" "docs/ARCHIVE")
for dir in "${DOC_DIRS[@]}"; do
    if [ -d "$TARGET_DIR/$dir" ]; then
        echo "✅ $dir/ exists"
    else
        echo "❌ $dir/ missing"
        ((VALIDATION_ERRORS++))
    fi
done

# Check context structure
echo ""
echo "🔸 Checking Context Structure..."
CONTEXT_DIRS=("context/ROLES" "context/CURRENT-SESSION" "context/SESSIONS-ARCHIVE")
for dir in "${CONTEXT_DIRS[@]}"; do
    if [ -d "$TARGET_DIR/$dir" ]; then
        echo "✅ $dir/ exists"
    else
        echo "❌ $dir/ missing"
        ((VALIDATION_ERRORS++))
    fi
done

# Check critical files
echo ""
echo "🔸 Checking Critical Files..."
CRITICAL_FILES=(
    "docs/PROCESS/UNIVERSAL-CURSOR-WORKFLOW-SYSTEM.md"
    "docs/PROCESS/documentation-control-system.md"
    "docs/MCP-TOOL-SPECIFICATIONS-COMPLETE.md"
    "cursorrules/00-CRITICAL-ALWAYS.md"
    "patterns/00-field-normalization-mandatory.txt"
    "scripts/git-workflow.sh"
    "scripts/real-n8n-export.sh"
    "scripts/framework-import.sh"
    "scripts/framework-validate.sh"
    "context/CURRENT-SESSION/SESSION-GUIDE.template.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$TARGET_DIR/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        ((VALIDATION_ERRORS++))
    fi
done

# Check script permissions
echo ""
echo "🔸 Checking Script Permissions..."
for script in "$TARGET_DIR"/scripts/*.sh; do
    if [ -x "$script" ]; then
        echo "✅ $(basename "$script") executable"
    else
        echo "⚠️ $(basename "$script") not executable - fixing..."
        chmod +x "$script"
    fi
done

# Validate configuration
echo ""
echo "🔸 Checking Configuration..."
if [ -f "$TARGET_DIR/package.json" ]; then
    if grep -q "start-work" "$TARGET_DIR/package.json"; then
        echo "✅ npm scripts configured"
    else
        echo "❌ npm scripts missing"
        ((VALIDATION_ERRORS++))
    fi
fi

# Test basic commands
echo ""
echo "🔸 Testing Framework Commands..."
cd "$TARGET_DIR"

if command -v npm >/dev/null 2>&1; then
    if npm run start-work --silent 2>/dev/null; then
        echo "✅ npm run start-work works"
    else
        echo "⚠️ npm run start-work needs verification"
    fi
else
    echo "⚠️ npm not installed - framework requires npm"
fi

echo ""
if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo "🎉 Framework validation PASSED!"
    echo "✅ All critical components installed correctly"
    echo "🚀 Framework ready for use"
else
    echo "❌ Framework validation FAILED!"
    echo "🔢 Errors found: $VALIDATION_ERRORS"
    echo "🛠️ Please review missing components above"
fi

exit $VALIDATION_ERRORS
