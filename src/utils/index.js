import fs from "fs";
import path from "path";

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

      const importStatements = data.match(
        new RegExp(defaultRegex + "|" + specRegex, "g")
      );
      return resolve(importStatements);
    });
  });
};

export const matchImportStatement = (importStatement) => {
  const result = {
    components: [],
    path: "",
  };
  const specImportRegex = /import\s+\{([^}]*)\}\s+from\s+['"](.*?)['"]/;
  const anonymousImportRegex = /import\s+([^{\s]+)\s+from\s+['"](.*?)['"]/;

  let matches = importStatement.match(specImportRegex);
  if (!matches) {
    matches = importStatement.match(anonymousImportRegex);
  }

  if (matches && matches.length === 3) {
    const components = matches[1].split(",").map((_) => _.trim());
    const importPath = matches[2];
    result.components = components;
    result.path = importPath;
  } else {
    console.log("No match found.");
  }
  return result;
};

export const scanFile = async (filePath) => {
  try {
    const importStatements = await getImportStatements(filePath);

    if (!importStatements || importStatements.length === 0) {
      console.log("No import statements found in the file.");
      return;
    }

    const matchedStatements = importStatements.map(matchImportStatement);
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
            importStatements: res,
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
    fs.truncateSync(target, 0);
  }

  fs.appendFileSync(target, JSON.stringify(content, null, 2), (err) => {
    if (err) {
      console.error("Error appending to output.json:", err);
      return;
    }
  });
};
