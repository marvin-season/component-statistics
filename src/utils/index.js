import fs from "fs";
import path from "path";
const importRegex =
  /import\s+(?:(?:\*\s+as\s+\w+)|(?:\{[^{}]*\})|(?:\w+(?:,\s*\{[^{}]*\})?)|(?:\{[^{}]*\},?\s*\w+))\s+from\s+['"].*['"]/g;
const defaultRegex = `import\\s*(\\{[^}]*\\})?\\s*from\\s+['"].*['"]`;
const specRegex = `import\\s+[^{]*\\s+from\\s+['"].*['"]`;
const maxDepth = 2;

export const getImportStatements = (filePath) => {
  if (!filePath) {
    throw new Error("filePath is null");
  }
  return new Promise((resolve) => {
    // 读取文件内容
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const importStatements = data.match(importRegex);
      return resolve(importStatements);
    });
  });
};

export const convertImportStatments = (importStatements) => {
  const importRegex =
    /import\s+(?:(?:\*\s+as\s+(\w+))|(?:\{([^{}]+)\})|([\w\s,]+))\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];

  let match;
  while ((match = importRegex.exec(importStatements)) !== null) {
    const [, namespace, namedImports, defaultImport, importPath] = match;

    let importItems = [];

    if (namespace) {
      importItems.push({ name: "*", path: importPath });
    } else if (namedImports) {
      const names = namedImports.split(",").map((name) => name.trim());
      importItems = names.map((name) => ({ name, path: importPath }));
    } else if (defaultImport) {
      importItems.push({ name: defaultImport, path: importPath });
    }

    imports.push(...importItems);
  }

  return imports;
};

export const scanFile = async (filePath) => {
  try {
    const importStatements = await getImportStatements(filePath);

    if (!importStatements || importStatements.length === 0) {
      console.log("No import statements found in the file.");
      return;
    }

    const matchedStatements = convertImportStatments(importStatements);
    return Promise.resolve(matchedStatements);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const scanDirectory = async (
  dirPath,
  currentDepth = 0,
  results = [],
  predicate
) => {
  if (currentDepth >= maxDepth || currentDepth >= 6) {
    return;
  }

  const promises = [];
  const files = fs.readdirSync(dirPath);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      promises.push(
        scanDirectory(filePath, currentDepth + 1, results, predicate)
      );
    } else if (stats.isFile() && predicate(filePath)) {
      promises.push(
        scanFile(filePath).then((res) =>
          results.push({
            path: filePath,
            name: path.basename(filePath),
            components: res,
          })
        )
      );
    }
  }
  await Promise.all(promises);
  return results;
};

export const writeFile = (target, content, clean = true) => {
  if (clean) {
    try {
      fs.truncateSync(target, 0);
    } catch (error) {
      console.error("清理文件失败： 目标文件不存在", target);
    }
  }

  fs.appendFileSync(target, JSON.stringify(content, null, 2), (err) => {
    if (err) {
      console.error("Error appending to output.json:", err);
      return;
    }
  });
};
