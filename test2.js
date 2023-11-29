const extractImports = (code) => {
    const importRegex = /import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^{}]+)\})|([\w\s,]+))\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
  
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const [, namespace, namedImports, defaultImport, importPath] = match;
  
      let importItems = [];
  
      if (namespace) {
        importItems.push({ name: '*', path: importPath });
      } else if (namedImports) {
        const names = namedImports.split(',').map((name) => name.trim());
        importItems = names.map((name) => ({ name, path: importPath }));
      } else if (defaultImport) {
        importItems.push({ name: defaultImport, path: importPath });
      }
  
      imports.push(...importItems);
    }
  
    return { importStatements: imports };
  };
  
  // 测试示例
  const code = `
    import React, { useEffect, useState } from 'react';
    import AIAbilityDetailContext from './context';
    import * as R from 'ramda';
    import {
      HeaderLayout,
      Link,
      IconPark,
    } from '@strapi/design-system';
    import { goBackCheck, setNavigateParams } from '@/utils/url';
    import {
      usePrivateAIAbilityDetail,
      usePublicAIAbilityDetail,
    } from './hooks';
  `;
  
  const extractedImports = extractImports(code);
  console.log(extractedImports);
  