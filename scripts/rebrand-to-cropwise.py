#!/usr/bin/env python3
"""
CropWise Rebranding Script

Automatically updates CropWise -> CropWise throughout the codebase.
Safe, reviewable, and preserves git history.

Usage:
    python3 rebrand-to-cropwise.py [--dry-run] [--verbose]
"""

import os
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Set

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ANSI colors
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# Files/directories to skip
SKIP_PATHS = {
    '.git',
    'node_modules',
    '__pycache__',
    '.pytest_cache',
    'dist',
    'build',
    'coverage',
    '.env',
    '.env.local',
    '.env.production',
    'package-lock.json',
    'npm-debug.log',
    '.DS_Store',
}

# File extensions to process
PROCESSABLE_EXTENSIONS = {
    '.md', '.js', '.jsx', '.ts', '.tsx',
    '.json', '.yml', '.yaml',
    '.html', '.css', '.scss',
    '.py', '.sh', '.bat', '.ps1',
    '.txt', '.conf', '.config',
}

# Safe text replacements (case-sensitive)
REPLACEMENTS = {
    # Display names
    'CropWise': 'CropWise',
    'CropWise': 'CropWise',
    'CropWiseOS': 'CropWise',
    
    # Package/project names
    'cropwise': 'cropwise',
    'cropwise': 'cropwise',
    
    # Code identifiers
    'cropwise': 'cropwise',
    'CROPWISE': 'CROPWISE',
    
    # Docker/container names
    'cropwise-backend': 'cropwise-backend',
    'cropwise-frontend': 'cropwise-frontend',
    'cropwise-dev': 'cropwise-dev',
    'cropwise-prod': 'cropwise-prod',
    
    # Database/service names (keep if too risky, uncomment to change)
    # 'cropwise_db': 'cropwise_db',
    # 'cropwise_user': 'cropwise_user',
}

# URL replacements
URL_REPLACEMENTS = {
    'cropwise.io': 'cropwise.io',
    'cropwise.github.io': 'cropwise.github.io',
    # Add your specific repo URL if different
    # 'github.com/your-org/cropwise': 'github.com/your-org/cropwise',
}

# Special handling for specific files
SPECIAL_FILES = {
    'CHANGELOG.md': 'preserve',  # Keep historical references
    'LICENSE': 'skip',
    'package-lock.json': 'skip',
}

class Rebrander:
    def __init__(self, root_dir: Path, dry_run: bool = False, verbose: bool = False):
        self.root_dir = root_dir
        self.dry_run = dry_run
        self.verbose = verbose
        self.files_changed = 0
        self.files_skipped = 0
        self.errors: List[str] = []
        
    def should_skip_path(self, path: Path) -> bool:
        """Check if path should be skipped"""
        # Check if any part of path is in skip list
        for part in path.parts:
            if part in SKIP_PATHS:
                return True
        return False
    
    def is_processable_file(self, path: Path) -> bool:
        """Check if file should be processed"""
        return path.suffix.lower() in PROCESSABLE_EXTENSIONS
    
    def handle_special_file(self, path: Path) -> str:
        """Check if file needs special handling"""
        return SPECIAL_FILES.get(path.name, 'process')
    
    def rebrand_content(self, content: str, file_path: Path) -> tuple[str, int]:
        """Apply rebranding replacements to content"""
        original_content = content
        changes = 0
        
            # Apply text replacements
        for old, new in REPLACEMENTS.items():
            if old in content:
                count = content.count(old)
                content = content.replace(old, new)
                changes += count
                if self.verbose and count > 0:
                    print(f"      Replaced '{old}' -> '{new}' ({count}x)")
        
        # Apply URL replacements
        for old_url, new_url in URL_REPLACEMENTS.items():
            if old_url in content:
                count = content.count(old_url)
                content = content.replace(old_url, new_url)
                changes += count
                if self.verbose and count > 0:
                    print(f"      Replaced '{old_url}' -> '{new_url}' ({count}x)")
        
        return content, changes
    
    def process_file(self, file_path: Path) -> bool:
        """Process a single file"""
        try:
            # Check special handling
            special = self.handle_special_file(file_path)
            if special == 'skip':
                if self.verbose:
                    print(f"  >> Skipped (special): {file_path.relative_to(self.root_dir)}")
                self.files_skipped += 1
                return False
            
            # Read file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                # Try binary mode for non-UTF8 files
                if self.verbose:
                    print(f"  >> Skipped (binary): {file_path.relative_to(self.root_dir)}")
                self.files_skipped += 1
                return False
            
            # Apply rebranding
            new_content, changes = self.rebrand_content(content, file_path)
            
            if changes == 0:
                if self.verbose:
                    print(f"  >> No changes: {file_path.relative_to(self.root_dir)}")
                self.files_skipped += 1
                return False
            
            # Special handling for CHANGELOG.md
            if file_path.name == 'CHANGELOG.md':
                rebrand_note = """
## Rebranding Notice

**Effective November 2024**: This project was rebranded from **CropWise** to **CropWise** due to domain availability.

All historical references to "CropWise" in this changelog have been preserved for accuracy.

---

"""
                # Add note at the top if not already there
                if 'Rebranding Notice' not in new_content:
                    # Insert after first heading
                    parts = new_content.split('\n', 2)
                    if len(parts) >= 2:
                        new_content = parts[0] + '\n' + rebrand_note + '\n'.join(parts[1:])
            
            # Write file (unless dry-run)
            if not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            
            print(f"  {Colors.GREEN}[OK] Updated{Colors.RESET}: {file_path.relative_to(self.root_dir)} ({changes} changes)")
            self.files_changed += 1
            return True
            
        except Exception as e:
            error_msg = f"Error processing {file_path}: {e}"
            self.errors.append(error_msg)
            print(f"  {Colors.RED}[ERR] Error{Colors.RESET}: {file_path.relative_to(self.root_dir)}")
            if self.verbose:
                print(f"      {e}")
            return False
    
    def run(self):
        """Run the rebranding process"""
        print(f"{Colors.BLUE}{Colors.BOLD}")
        print("=" * 60)
        print("  CropWise Rebranding Tool")
        print("  CropWise -> CropWise")
        print("=" * 60)
        print(f"{Colors.RESET}\n")
        
        if self.dry_run:
            print(f"{Colors.YELLOW}[DRY RUN] No files will be modified{Colors.RESET}\n")
        
        print(f"Root directory: {self.root_dir}")
        print(f"Scanning for files...\n")
        
        # Find all processable files
        all_files = []
        for ext in PROCESSABLE_EXTENSIONS:
            pattern = f"**/*{ext}"
            files = list(self.root_dir.glob(pattern))
            all_files.extend(files)
        
        # Filter files
        processable_files = [
            f for f in all_files 
            if not self.should_skip_path(f) and self.is_processable_file(f)
        ]
        
        print(f"Found {len(processable_files)} files to process\n")
        print(f"{Colors.BLUE}{'-' * 60}{Colors.RESET}\n")
        
        # Process files
        for file_path in sorted(processable_files):
            self.process_file(file_path)
        
        # Print summary
        print(f"\n{Colors.BLUE}{'-' * 60}{Colors.RESET}\n")
        print(f"{Colors.BOLD}Summary{Colors.RESET}\n")
        print(f"  {Colors.GREEN}[OK] Files updated:{Colors.RESET} {self.files_changed}")
        print(f"  >> Files skipped: {self.files_skipped}")
        
        if self.errors:
            print(f"  {Colors.RED}[ERR] Errors:{Colors.RESET} {len(self.errors)}")
            if self.verbose:
                print("\n  Errors:")
                for error in self.errors:
                    print(f"    - {error}")
        
        print(f"\n{Colors.YELLOW}[!] Manual Review Needed:{Colors.RESET}")
        print("  1. Review CHANGELOG.md - rebrand note added")
        print("  2. Check package.json files are correct")
        print("  3. Test: docker-compose up -d")
        print("  4. Test: Backend starts (cd backend && npm start)")
        print("  5. Test: Frontend starts (cd frontend && npm run dev)")
        print("  6. Review git diff before committing")
        
        if not self.dry_run:
            print(f"\n{Colors.GREEN}[DONE] Rebranding complete!{Colors.RESET}")
            print(f"\n{Colors.BOLD}Next steps:{Colors.RESET}")
            print("  git diff                    # Review changes")
            print("  git add -A                  # Stage all changes")
            print("  git commit -m 'rebrand: Complete rebranding to CropWise'")
        else:
            print(f"\n{Colors.YELLOW}[DRY RUN] No files were modified{Colors.RESET}")
            print("  Run without --dry-run to apply changes")

def main():
    parser = argparse.ArgumentParser(
        description='Rebrand CropWise to CropWise throughout the codebase'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without modifying files'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed output'
    )
    parser.add_argument(
        '--root',
        type=str,
        default='.',
        help='Root directory (default: current directory)'
    )
    
    args = parser.parse_args()
    
    root_dir = Path(args.root).resolve()
    if not root_dir.exists():
        print(f"{Colors.RED}[ERROR] Directory not found: {root_dir}{Colors.RESET}")
        sys.exit(1)
    
    rebrander = Rebrander(
        root_dir=root_dir,
        dry_run=args.dry_run,
        verbose=args.verbose
    )
    
    try:
        rebrander.run()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}[!] Interrupted by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}[FATAL] Error: {e}{Colors.RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()

