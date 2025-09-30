#!/bin/bash

# Codebase Cleanup Script
# Scans the codebase and removes empty files, unused files, and temporary files
# Usage: ./scripts/cleanup-codebase.sh [--dry-run] [--verbose]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
DRY_RUN=false
VERBOSE=false
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--dry-run] [--verbose]"
            echo "  --dry-run    Show what would be deleted without actually deleting"
            echo "  --verbose    Show detailed output"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to log verbose output
log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo "  $1"
    fi
}

# Function to safely remove file
safe_remove() {
    local file=$1
    local reason=$2
    
    if [ "$DRY_RUN" = true ]; then
        print_status "$YELLOW" "WOULD DELETE: $file ($reason)"
    else
        if rm "$file" 2>/dev/null; then
            print_status "$GREEN" "DELETED: $file ($reason)"
        else
            print_status "$RED" "FAILED TO DELETE: $file"
        fi
    fi
}

print_status "$BLUE" "🧹 Starting codebase cleanup..."
print_status "$BLUE" "Project root: $PROJECT_ROOT"

if [ "$DRY_RUN" = true ]; then
    print_status "$YELLOW" "🔍 DRY RUN MODE - No files will be deleted"
fi

echo

# Counter for deleted files
deleted_count=0

# 1. Remove empty files
print_status "$BLUE" "📁 Scanning for empty files..."
while IFS= read -r -d '' file; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        safe_remove "$file" "empty file"
        ((deleted_count++))
    fi
done < <(find "$PROJECT_ROOT" -type f -size 0 -print0 2>/dev/null)

# 2. Remove common temporary files
print_status "$BLUE" "🗑️  Scanning for temporary files..."
temp_patterns=(
    "*.tmp"
    "*.temp"
    "*.log"
    "*.swp"
    "*.swo"
    "*~"
    ".DS_Store"
    "Thumbs.db"
    "*.bak"
    "*.backup"
    "*.orig"
    "*.rej"
    "*.patch"
    "*.diff"
)

for pattern in "${temp_patterns[@]}"; do
    while IFS= read -r -d '' file; do
        safe_remove "$file" "temporary file ($pattern)"
        ((deleted_count++))
    done < <(find "$PROJECT_ROOT" -name "$pattern" -type f -print0 2>/dev/null)
done

# 3. Remove empty directories (except important ones)
print_status "$BLUE" "📂 Scanning for empty directories..."
important_dirs=(
    "node_modules"
    ".git"
    "dist"
    "build"
    "coverage"
    ".vscode"
    ".idea"
    "src"
    "public"
    "scripts"
    "tests"
    "config"
)

while IFS= read -r -d '' dir; do
    # Check if directory is in important list
    is_important=false
    for important_dir in "${important_dirs[@]}"; do
        if [[ "$dir" == *"/$important_dir" ]] || [[ "$dir" == "$PROJECT_ROOT/$important_dir" ]]; then
            is_important=true
            break
        fi
    done
    
    if [ "$is_important" = false ]; then
        safe_remove "$dir" "empty directory"
        ((deleted_count++))
    else
        log_verbose "Skipping important directory: $dir"
    fi
done < <(find "$PROJECT_ROOT" -type d -empty -print0 2>/dev/null)

# 4. Remove unused TypeScript declaration files
print_status "$BLUE" "📝 Scanning for unused TypeScript declaration files..."
while IFS= read -r -d '' file; do
    if [[ "$file" == *.d.ts ]]; then
        # Check if the corresponding .ts or .tsx file exists
        base_name="${file%.d.ts}"
        if [ ! -f "${base_name}.ts" ] && [ ! -f "${base_name}.tsx" ]; then
            safe_remove "$file" "unused TypeScript declaration"
            ((deleted_count++))
        fi
    fi
done < <(find "$PROJECT_ROOT" -name "*.d.ts" -type f -print0 2>/dev/null)

# 5. Remove unused CSS files (check if imported)
print_status "$BLUE" "🎨 Scanning for unused CSS files..."
while IFS= read -r -d '' file; do
    if [[ "$file" == *.css ]]; then
        filename=$(basename "$file")
        # Check if CSS file is imported anywhere
        if ! grep -r "import.*$filename" "$PROJECT_ROOT/src" >/dev/null 2>&1 && \
           ! grep -r "require.*$filename" "$PROJECT_ROOT/src" >/dev/null 2>&1 && \
           ! grep -r "$filename" "$PROJECT_ROOT/public" >/dev/null 2>&1; then
            # Skip if it's a main CSS file or theme file
            if [[ "$filename" != "index.css" ]] && [[ "$filename" != "theme.css" ]] && [[ "$filename" != "App.css" ]]; then
                safe_remove "$file" "unused CSS file"
                ((deleted_count++))
            fi
        fi
    fi
done < <(find "$PROJECT_ROOT" -name "*.css" -type f -print0 2>/dev/null)

# 6. Remove unused image files
print_status "$BLUE" "🖼️  Scanning for unused image files..."
while IFS= read -r -d '' file; do
    if [[ "$file" == *.png ]] || [[ "$file" == *.jpg ]] || [[ "$file" == *.jpeg ]] || [[ "$file" == *.gif ]] || [[ "$file" == *.svg ]]; then
        filename=$(basename "$file")
        # Check if image is referenced anywhere
        if ! grep -r "$filename" "$PROJECT_ROOT/src" >/dev/null 2>&1 && \
           ! grep -r "$filename" "$PROJECT_ROOT/public" >/dev/null 2>&1 && \
           ! grep -r "$filename" "$PROJECT_ROOT" --include="*.html" >/dev/null 2>&1; then
            safe_remove "$file" "unused image file"
            ((deleted_count++))
        fi
    fi
done < <(find "$PROJECT_ROOT" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" \) -print0 2>/dev/null)

# 7. Remove duplicate files (by content hash)
print_status "$BLUE" "🔄 Scanning for duplicate files..."
declare -A file_hashes
duplicates_found=0

while IFS= read -r -d '' file; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        hash=$(md5sum "$file" | cut -d' ' -f1)
        if [[ -n "${file_hashes[$hash]}" ]]; then
            # Duplicate found
            original="${file_hashes[$hash]}"
            if [ "$file" != "$original" ]; then
                safe_remove "$file" "duplicate of $original"
                ((deleted_count++))
                ((duplicates_found++))
            fi
        else
            file_hashes[$hash]="$file"
        fi
    fi
done < <(find "$PROJECT_ROOT" -type f -print0 2>/dev/null)

# 8. Clean up node_modules if it exists and is corrupted
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    print_status "$BLUE" "📦 Checking node_modules integrity..."
    if [ ! -f "$PROJECT_ROOT/node_modules/.package-lock.json" ] && [ ! -f "$PROJECT_ROOT/package-lock.json" ]; then
        print_status "$YELLOW" "⚠️  node_modules might be corrupted (no package-lock.json found)"
        if [ "$DRY_RUN" = false ]; then
            read -p "Do you want to remove node_modules and reinstall? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_status "$YELLOW" "Removing node_modules..."
                rm -rf "$PROJECT_ROOT/node_modules"
                print_status "$BLUE" "Running npm install..."
                cd "$PROJECT_ROOT" && npm install
            fi
        fi
    fi
fi

# 9. Clean up build artifacts
print_status "$BLUE" "🏗️  Cleaning build artifacts..."
build_dirs=("dist" "build" "coverage" ".nyc_output")
for dir in "${build_dirs[@]}"; do
    if [ -d "$PROJECT_ROOT/$dir" ]; then
        if [ "$DRY_RUN" = true ]; then
            print_status "$YELLOW" "WOULD DELETE: $dir/ (build artifact)"
        else
            rm -rf "$PROJECT_ROOT/$dir"
            print_status "$GREEN" "DELETED: $dir/ (build artifact)"
            ((deleted_count++))
        fi
    fi
done

# Summary
echo
print_status "$BLUE" "📊 Cleanup Summary:"
if [ "$DRY_RUN" = true ]; then
    print_status "$YELLOW" "🔍 DRY RUN - $deleted_count items would be deleted"
    print_status "$YELLOW" "Run without --dry-run to actually delete files"
else
    if [ $deleted_count -eq 0 ]; then
        print_status "$GREEN" "✅ No files needed cleanup - codebase is clean!"
    else
        print_status "$GREEN" "✅ Cleaned up $deleted_count files/directories"
    fi
fi

if [ $duplicates_found -gt 0 ]; then
    print_status "$YELLOW" "🔄 Found and removed $duplicates_found duplicate files"
fi

print_status "$BLUE" "🎉 Cleanup completed!"

# Optional: Show disk space saved
if [ "$VERBOSE" = true ] && [ "$DRY_RUN" = false ]; then
    echo
    print_status "$BLUE" "💾 Current project size:"
    du -sh "$PROJECT_ROOT" 2>/dev/null || echo "Could not calculate size"
fi
