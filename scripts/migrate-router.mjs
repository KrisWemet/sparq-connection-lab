import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const files = execSync('grep -rl "react-router-dom" src').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace imports
  content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react-router-dom['"];/g, (match, p1) => {
    let newImports = [];
    const imports = p1.split(',').map(i => i.trim());
    
    if (imports.includes('useNavigate') || imports.includes('useParams') || imports.includes('useLocation') || imports.includes('useRouter')) {
      newImports.push("import { useRouter } from 'next/router';");
    }
    if (imports.includes('Link')) {
      newImports.push("import Link from 'next/link';");
    }
    return newImports.join('\n');
  });

  // Replace hook calls
  content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\);/g, 'const router = useRouter();');
  content = content.replace(/navigate\(/g, 'router.push(');
  content = content.replace(/const\s+location\s*=\s*useLocation\(\);/g, 'const router = useRouter();');
  content = content.replace(/location\.pathname/g, 'router.pathname');
  
  // Replace useParams
  content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*useParams\(\);/g, 'const router = useRouter();\n  const { $1 } = router.query;');

  // Replace Link to
  content = content.replace(/<Link([^>]*?)to=/g, '<Link$1href=');

  fs.writeFileSync(file, content);
  console.log(`Migrated ${file}`);
}
