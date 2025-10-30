#!/bin/bash

# Generic Auto-Backup System
# Simple automated backup with intelligent scheduling
# Runs every time you start work to ensure fresh backups

set -e

# Dynamic directory configuration based on project structure
if [ -d "./workflows/backups" ]; then
    BACKUP_DIR="./workflows/backups"
elif [ -d "./backups" ]; then
    BACKUP_DIR="./backups"
else
    BACKUP_DIR="./.backups"
    mkdir -p "$BACKUP_DIR"
fi

if [ -d "./data/schemas" ]; then
    SCHEMAS_DIR="./data/schemas"
elif [ -d "./schemas" ]; then
    SCHEMAS_DIR="./schemas"
else
    SCHEMAS_DIR="./.schemas"
fi

LAST_BACKUP_FILE="./.backup_tracker"

echo "🔄 Auto-Backup System Starting..."

# Check when last backup was made
if [ -f "$LAST_BACKUP_FILE" ]; then
    LAST_BACKUP=$(cat "$LAST_BACKUP_FILE")
    LAST_BACKUP_DATE=$(date -d "$LAST_BACKUP" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$LAST_BACKUP" +%s 2>/dev/null || echo "0")
    CURRENT_DATE=$(date +%s)
    HOURS_SINCE=$((($CURRENT_DATE - $LAST_BACKUP_DATE) / 3600))
else
    HOURS_SINCE=999
    echo "📅 No previous backup found"
fi

echo "⏰ Hours since last backup: $HOURS_SINCE"

# Backup if it's been more than 4 hours OR if no recent backups exist
MIN_HOURS=4
# Check for recent backups (any pattern)
RECENT_BACKUPS=$(find "$BACKUP_DIR" -name "*.json" -mtime -1 2>/dev/null | wc -l || echo "0")
if [ "$RECENT_BACKUPS" -eq "0" ]; then
    # Also check for git-based backups
    RECENT_GIT_BACKUPS=$(find . -name ".git" -type d 2>/dev/null | wc -l || echo "0")
    RECENT_BACKUPS=$RECENT_GIT_BACKUPS
fi

if [ "$HOURS_SINCE" -gt "$MIN_HOURS" ] || [ "$RECENT_BACKUPS" -eq "0" ]; then
    echo "🚀 Creating fresh backup (${HOURS_SINCE}h since last backup)"
    
    # Run appropriate backup based on what's available
    if [ -f "./scripts/real-n8n-export.sh" ]; then
        echo "🔄 Running n8n workflow backup..."
        ./scripts/real-n8n-export.sh
    elif [ -f "./scripts/project-export.sh" ]; then
        echo "🔄 Running project-specific backup..."
        ./scripts/project-export.sh
    else
        echo "🔄 Running generic git backup..."
        ./scripts/git-backup.sh
    fi
    
    # Update backup tracker
    date "+%Y-%m-%d %H:%M:%S" > "$LAST_BACKUP_FILE"
    
    echo "✅ Auto-backup completed successfully"
    echo "📅 Next backup due in ${MIN_HOURS} hours"
    
    # Cleanup old backups (keep last 10 backup files)
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo "🧹 Cleaning up old backups..."
        cd "$BACKUP_DIR"
        ls -t *.json 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
        cd - > /dev/null
    fi
    
    # Cleanup old schemas (keep last 10)
    if [ -d "$SCHEMAS_DIR" ] && [ "$(ls -A $SCHEMAS_DIR 2>/dev/null)" ]; then
        cd "$SCHEMAS_DIR"
        ls -t *.json 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
        cd - > /dev/null
    fi

    
    echo "🗑️ Cleanup completed (keeping 10 most recent backups)"
    
else
    echo "⏭️ Skipping backup (recent backup exists, ${HOURS_SINCE}h ago)"
    echo "📁 Recent backups available:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        find "$BACKUP_DIR" -name "*.json" -mtime -1 -exec basename {} \; 2>/dev/null | head -3
    else
        echo "  No backup files found (using git-based backups)"
    fi
fi

# Display backup status
echo ""
echo "📊 BACKUP STATUS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.json" 2>/dev/null | wc -l)
    echo "📁 Total data backups: $BACKUP_COUNT"
    LATEST_BACKUP_DATE=$(ls -t "$BACKUP_DIR"/*.json 2>/dev/null | head -1 | xargs stat -f %Sm 2>/dev/null || ls -lt "$BACKUP_DIR"/*.json 2>/dev/null | head -1 | awk '{print $6, $7, $8}' 2>/dev/null || echo 'No backups found')
    echo "📅 Last data backup: $LATEST_BACKUP_DATE"
else
    echo "📁 Total data backups: 0 (using git-based backups)"
    LATEST_GIT_BACKUP=$(git branch -a | grep backup/ | head -1 | sed 's/.*backup\///' 2>/dev/null || echo 'No git backups')
    echo "📅 Last git backup: $LATEST_GIT_BACKUP"
fi

if [ -d "$SCHEMAS_DIR" ] && [ "$(ls -A $SCHEMAS_DIR 2>/dev/null)" ]; then
    SCHEMA_COUNT=$(find "$SCHEMAS_DIR" -name "*.json" 2>/dev/null | wc -l)
    echo "📁 Total schema backups: $SCHEMA_COUNT"
else
    echo "📁 Total schema backups: 0"
fi

echo "☁️ GitHub sync: $(git status --porcelain 2>/dev/null | wc -l | awk '{if($1==0) print "✅ Synced"; else print "⚠️ Pending"}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🎯 To manually force backup: npm run backup"
echo "🎯 To view backup history: ls -la $BACKUP_DIR/"