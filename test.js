const code = `
  import moduleName from 'module';
  import { namedModule1, namedModule2 } from 'module';
  import moduleName, { namedModule1, namedModule2 } from 'module';
  import * as namespace from 'module';
  const a = () =>
`;
const importRegex = /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^{}]*\})|(?:\w+(?:,\s*\{[^{}]*\})?)|(?:\{[^{}]*\},?\s*\w+))\s+from\s+['"].*['"]/g;
const imports = code.match(importRegex);
console.log(imports);
