import { scanDirectory, scanFile, writeFile } from "./src/utils/index.js";
import path from "path";
// 获取命令行参数

import * as R from "ramda";

const results = [];
await scanDirectory(
  "../asknlearn/packages/core/ask-and-learn/src/pages/AIAbilityDetailPage",
  0,
  results,
  (filePath) => {
    return path.basename(filePath) === "index.tsx";
  }
);
console.log(`共扫描${results.length}个文件`);

console.log(results);
writeFile(
  "output.json",
  {
    pages: results,
  },
  true
);
