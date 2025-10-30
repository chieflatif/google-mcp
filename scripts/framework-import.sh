#!/bin/bash

# Framework Import Script
# Automatically sets up UYSP development framework in new project

set -e

PROJECT_CONFIG="${1:-project-config.json}"
TARGET_DIR="${2:-.}"

if [ ! -f "$PROJECT_CONFIG" ]; then
    echo "❌ Error: Project config file not found: $PROJECT_CONFIG"
    echo "📋 Please create config file using templates/project-config.template.json"
    exit 1
fi

echo "🚀 UYSP Framework Import Starting..."
echo "📁 Target Directory: $TARGET_DIR"
echo "⚙️ Config File: $PROJECT_CONFIG"

# Read configuration
PROJECT_NAME=$(cat "$PROJECT_CONFIG" | grep -o '"projectName": *"[^"]*"' | cut -d'"' -f4)
N8N_WORKFLOW_ID=$(cat "$PROJECT_CONFIG" | grep -o '"workflowId": *"[^"]*"' | cut -d'"' -f4)
AIRTABLE_BASE_ID=$(cat "$PROJECT_CONFIG" | grep -o '"baseId": *"[^"]*"' | cut -d'"' -f4)

echo "📋 Project: $PROJECT_NAME"
echo "🔄 n8n Workflow: $N8N_WORKFLOW_ID"
echo "📊 Airtable Base: $AIRTABLE_BASE_ID"

# Create target directory structure
echo ""
echo "🔸 Step 1: Creating Directory Structure"
mkdir -p "$TARGET_DIR"/{.cursorrules,context,patterns,tests,scripts,workflows/backups,data/schemas,memory_bank}
mkdir -p "$TARGET_DIR/docs"/{CURRENT,PROCESS,ARCHITECTURE,ARCHIVE}
mkdir -p "$TARGET_DIR/context"/{ROLES,CURRENT-SESSION,SESSIONS-ARCHIVE}

# Copy framework files
echo ""
echo "🔸 Step 2: Installing Framework Files"
cp -r cursorrules/* "$TARGET_DIR/.cursorrules/"
cp -r context/* "$TARGET_DIR/context/"
cp -r patterns/* "$TARGET_DIR/patterns/"
cp -r tests/* "$TARGET_DIR/tests/"
cp -r docs/* "$TARGET_DIR/docs/"

# Customize documentation templates
echo ""
echo "🔸 Step 2.1: Customizing Documentation Templates"
if [ -f "$TARGET_DIR/docs/README.template.md" ]; then
    sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
        -e "s/{{TIMESTAMP}}/$(date)/g" \
        "$TARGET_DIR/docs/README.template.md" > "$TARGET_DIR/docs/README.md"
    rm "$TARGET_DIR/docs/README.template.md"
fi

# Customize session guide template
if [ -f "$TARGET_DIR/context/CURRENT-SESSION/SESSION-GUIDE.template.md" ]; then
    sed -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
        -e "s/{{CURRENT_PHASE}}/Setup/g" \
        -e "s/{{TIMESTAMP}}/$(date)/g" \
        -e "s/{{PHASE_NUMBER}}/1/g" \
        -e "s/{{OBJECTIVE_1}}/Framework Setup/g" \
        -e "s/{{OBJECTIVE_2}}/Service Configuration/g" \
        -e "s/{{OBJECTIVE_3}}/Initial Testing/g" \
        -e "s/{{COMPLETION_PERCENTAGE}}/0/g" \
        -e "s/{{EVIDENCE_FILES}}/TBD/g" \
        -e "s/{{NEXT_STEP_1}}/Configure service IDs/g" \
        -e "s/{{NEXT_STEP_2}}/Test workflow automation/g" \
        "$TARGET_DIR/context/CURRENT-SESSION/SESSION-GUIDE.template.md" > "$TARGET_DIR/context/CURRENT-SESSION/SESSION-GUIDE.md"
    rm "$TARGET_DIR/context/CURRENT-SESSION/SESSION-GUIDE.template.md"
fi

# Customize scripts with project-specific variables
echo ""
echo "🔸 Step 3: Customizing Scripts"
for script in scripts/*.sh scripts/*.js; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        echo "⚙️ Customizing $filename..."
        
        # Replace UYSP-specific variables
        sed -e "s/UYSP/$PROJECT_NAME/g" \
            -e "s/CefJB1Op3OySG8nb/$N8N_WORKFLOW_ID/g" \
            -e "s/appuBf0fTe8tp8ZaF/$AIRTABLE_BASE_ID/g" \
            -e "s/uysp-lead-processing-WORKING/${PROJECT_NAME,,}-workflow/g" \
            "$script" > "$TARGET_DIR/scripts/$filename"
            
        chmod +x "$TARGET_DIR/scripts/$filename"
    fi
done

# Create package.json with framework scripts
echo ""
echo "🔸 Step 4: Setting up npm Integration"
cat > "$TARGET_DIR/package.json" << PACKAGE_EOF
{
  "name": "${PROJECT_NAME,,}-development",
  "version": "1.0.0",
  "description": "$PROJECT_NAME development framework",
  "scripts": {
    "start-work": "bash scripts/work-start.sh",
    "branch": "bash scripts/git-workflow.sh",
    "backup": "bash scripts/git-backup.sh",
    "auto-backup": "bash scripts/auto-backup.sh",
    "test": "echo 'No tests configured yet. Add your test command here.'",
    "validate": "bash scripts/framework-validate.sh"
  },
  "private": true
}
PACKAGE_EOF

# Create initial README
cat > "$TARGET_DIR/README.md" << README_EOF
# $PROJECT_NAME Development Framework

**Framework Origin**: UYSP Lead Qualification System  
**Framework Version**: $(date +%Y-%m-%d)  

## 🚀 Quick Start

\`\`\`bash
# Initialize work session
npm run start-work

# Create feature branch  
npm run branch new feature-name 'Description'

# Manual backup
npm run real-backup
\`\`\`

## 📚 Documentation

- **Workflow System**: See \`docs/MASTER-WORKFLOW-GUIDE.md\`
- **Universal System**: See \`docs/UNIVERSAL-CURSOR-WORKFLOW-SYSTEM.md\`
- **MCP Tools**: See \`docs/MCP-TOOL-SPECIFICATIONS-COMPLETE.md\`

## ⚙️ Configuration

- **n8n Workflow ID**: $N8N_WORKFLOW_ID
- **Airtable Base ID**: $AIRTABLE_BASE_ID

For customization details, see \`docs/UNIVERSAL-CURSOR-WORKFLOW-SYSTEM.md\`
README_EOF

echo ""
echo "✅ Framework Import Complete!"
echo "🎯 Next Steps:"
echo "   1. cd $TARGET_DIR"
echo "   2. git init"
echo "   3. npm run start-work"
echo "   4. Customize workflows for your project"
