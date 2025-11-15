#!/usr/bin/env node

/**
 * CropWise - Documentation Analyzer
 * 
 * This script analyzes all .md files in the repository to:
 * - Identify duplicate or overlapping content
 * - Suggest reorganization
 * - Generate documentation map
 */

const fs = require('fs');
const path = require('path');

const COLOR = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

function log(message, color = COLOR.RESET) {
  console.log(`${color}${message}${COLOR.RESET}`);
}

function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Extract title
  const titleMatch = content.match(/^#\s+(.+)/m);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');
  
  // Count sections
  const sections = content.match(/^##\s+/gm) || [];
  
  // Extract keywords from first 500 chars
  const intro = content.substring(0, 500).toLowerCase();
  const keywords = [];
  
  const keywordPatterns = {
    'setup': /setup|install|configure/gi,
    'deployment': /deploy|aws|cloud|production/gi,
    'development': /develop|code|build|test/gi,
    'guide': /guide|tutorial|how to/gi,
    'workflow': /workflow|process|ci\/cd/gi,
    'security': /security|secret|credential|auth/gi,
    'iot': /iot|esp32|mqtt|sensor/gi,
    'api': /api|endpoint|route|controller/gi,
    'database': /database|postgres|sql/gi,
    'frontend': /frontend|react|ui|component/gi,
    'backend': /backend|node|express|server/gi
  };
  
  for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
    if (pattern.test(intro)) {
      keywords.push(keyword);
    }
  }
  
  return {
    path: filePath,
    relativePath: path.relative(process.cwd(), filePath),
    title,
    size: content.length,
    lines: lines.length,
    sections: sections.length,
    keywords,
    lastModified: fs.statSync(filePath).mtime
  };
}

function findDuplicates(files) {
  const duplicates = [];
  const titleGroups = {};
  const keywordGroups = {};
  
  // Group by similar titles
  files.forEach(file => {
    const normalizedTitle = file.title.toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
    
    if (!titleGroups[normalizedTitle]) {
      titleGroups[normalizedTitle] = [];
    }
    titleGroups[normalizedTitle].push(file);
  });
  
  // Find title duplicates
  for (const [title, group] of Object.entries(titleGroups)) {
    if (group.length > 1) {
      duplicates.push({
        type: 'title',
        title,
        files: group
      });
    }
  }
  
  // Group by keywords
  files.forEach(file => {
    const keywordKey = file.keywords.sort().join(',');
    if (keywordKey && file.keywords.length >= 2) {
      if (!keywordGroups[keywordKey]) {
        keywordGroups[keywordKey] = [];
      }
      keywordGroups[keywordKey].push(file);
    }
  });
  
  // Find keyword overlaps
  for (const [keywords, group] of Object.entries(keywordGroups)) {
    if (group.length > 1) {
      duplicates.push({
        type: 'keywords',
        keywords: keywords.split(','),
        files: group
      });
    }
  }
  
  return duplicates;
}

function analyzeDocumentation() {
  log('🔍 CropWise Documentation Analyzer\n', COLOR.BLUE);
  
  const rootDir = process.cwd();
  const markdownFiles = getAllMarkdownFiles(rootDir);
  
  log(`Found ${markdownFiles.length} markdown files\n`, COLOR.GREEN);
  
  // Analyze each file
  const analyzedFiles = markdownFiles.map(analyzeFile);
  
  // Organize by directory
  const byDirectory = {};
  analyzedFiles.forEach(file => {
    const dir = path.dirname(file.relativePath);
    if (!byDirectory[dir]) {
      byDirectory[dir] = [];
    }
    byDirectory[dir].push(file);
  });
  
  // Print organization
  log('📁 Current Organization:\n', COLOR.BLUE);
  for (const [dir, files] of Object.entries(byDirectory).sort()) {
    log(`${dir}/ (${files.length} files)`, COLOR.YELLOW);
    files.forEach(file => {
      const fileName = path.basename(file.relativePath);
      const keywords = file.keywords.length > 0 ? ` [${file.keywords.join(', ')}]` : '';
      log(`  - ${fileName}${keywords}`);
    });
    console.log('');
  }
  
  // Find duplicates
  log('\n🔍 Analyzing for Duplicates...\n', COLOR.BLUE);
  const duplicates = findDuplicates(analyzedFiles);
  
  if (duplicates.length === 0) {
    log('✅ No obvious duplicates found\n', COLOR.GREEN);
  } else {
    log(`⚠️  Found ${duplicates.length} potential duplicates:\n`, COLOR.YELLOW);
    
    duplicates.forEach((dup, idx) => {
      if (dup.type === 'title') {
        log(`${idx + 1}. Similar Titles: "${dup.title}"`, COLOR.YELLOW);
      } else {
        log(`${idx + 1}. Similar Content: [${dup.keywords.join(', ')}]`, COLOR.YELLOW);
      }
      
      dup.files.forEach(file => {
        log(`   - ${file.relativePath} (${file.size} bytes)`, COLOR.RESET);
      });
      console.log('');
    });
  }
  
  // Generate statistics
  log('\n📊 Statistics:\n', COLOR.BLUE);
  const totalSize = analyzedFiles.reduce((sum, file) => sum + file.size, 0);
  const avgSize = Math.round(totalSize / analyzedFiles.length);
  
  log(`Total files: ${analyzedFiles.length}`);
  log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);
  log(`Average size: ${(avgSize / 1024).toFixed(2)} KB`);
  log(`Total sections: ${analyzedFiles.reduce((sum, file) => sum + file.sections, 0)}`);
  
  // Category distribution
  const allKeywords = analyzedFiles.flatMap(f => f.keywords);
  const keywordCounts = {};
  allKeywords.forEach(k => {
    keywordCounts[k] = (keywordCounts[k] || 0) + 1;
  });
  
  log('\n📑 Content Categories:', COLOR.BLUE);
  Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([keyword, count]) => {
      log(`  ${keyword}: ${count} files`);
    });
  
  // Generate reorganization suggestions
  log('\n💡 Reorganization Suggestions:\n', COLOR.BLUE);
  
  const suggestions = [
    {
      action: 'MERGE',
      reason: 'Similar setup/installation content',
      files: analyzedFiles.filter(f => 
        f.keywords.includes('setup') && !f.relativePath.includes('docs/')
      ).map(f => f.relativePath)
    },
    {
      action: 'MOVE',
      reason: 'Root-level docs should be in docs/',
      files: analyzedFiles.filter(f => 
        f.relativePath.split(path.sep).length === 1 && 
        f.relativePath !== 'README.md' &&
        f.relativePath !== 'CHANGELOG.md' &&
        f.relativePath !== 'CONTRIBUTING.md' &&
        f.relativePath !== 'LICENSE.md'
      ).map(f => f.relativePath)
    },
    {
      action: 'CONSOLIDATE',
      reason: 'Multiple AWS deployment guides',
      files: analyzedFiles.filter(f => 
        f.keywords.includes('deployment') && 
        f.keywords.includes('aws')
      ).map(f => f.relativePath)
    },
    {
      action: 'REMOVE',
      reason: 'Outdated or superseded files',
      files: analyzedFiles.filter(f => {
        const name = f.relativePath.toLowerCase();
        return name.includes('old') || 
               name.includes('backup') || 
               name.includes('temp') ||
               name.includes('summary') && f.size < 1000;
      }).map(f => f.relativePath)
    }
  ];
  
  suggestions.forEach((suggestion, idx) => {
    if (suggestion.files.length > 0) {
      log(`${idx + 1}. ${suggestion.action}: ${suggestion.reason}`, COLOR.YELLOW);
      suggestion.files.forEach(file => {
        log(`   - ${file}`);
      });
      console.log('');
    }
  });
  
  // Generate documentation map
  log('\n🗺️  Documentation Map:\n', COLOR.BLUE);
  
  const categories = {
    'Getting Started': analyzedFiles.filter(f => 
      f.relativePath.includes('GETTING_STARTED') ||
      f.relativePath.includes('QUICK_START') ||
      f.relativePath.includes('INSTALLATION')
    ),
    'Development': analyzedFiles.filter(f => 
      f.keywords.includes('development') ||
      f.relativePath.includes('DEVELOPER')
    ),
    'Deployment': analyzedFiles.filter(f => 
      f.keywords.includes('deployment')
    ),
    'Operations': analyzedFiles.filter(f => 
      f.keywords.includes('workflow') ||
      f.relativePath.includes('RELEASE') ||
      f.relativePath.includes('CI')
    ),
    'Features': analyzedFiles.filter(f => 
      f.keywords.includes('iot') ||
      f.relativePath.includes('INVENTORY') ||
      f.relativePath.includes('TASK') ||
      f.relativePath.includes('QUALITY')
    ),
    'Reference': analyzedFiles.filter(f => 
      f.relativePath.includes('QUICK_REFERENCE') ||
      f.relativePath.includes('API')
    )
  };
  
  for (const [category, files] of Object.entries(categories)) {
    if (files.length > 0) {
      log(`${category}:`, COLOR.YELLOW);
      files.forEach(file => {
        log(`  - ${file.relativePath}`);
      });
      console.log('');
    }
  }
  
  // Save report
  const report = {
    generated: new Date().toISOString(),
    totalFiles: analyzedFiles.length,
    totalSize,
    files: analyzedFiles.map(f => ({
      path: f.relativePath,
      title: f.title,
      size: f.size,
      sections: f.sections,
      keywords: f.keywords
    })),
    duplicates,
    suggestions
  };
  
  fs.writeFileSync('docs-analysis-report.json', JSON.stringify(report, null, 2));
  log('\n✅ Report saved to: docs-analysis-report.json', COLOR.GREEN);
}

// Run analysis
try {
  analyzeDocumentation();
} catch (error) {
  log(`\n❌ Error: ${error.message}`, COLOR.RED);
  process.exit(1);
}

