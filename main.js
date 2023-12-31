import { scanDirectory, scanFile, writeFile } from "./src/utils/index.js";
import path from "path";
// 获取命令行参数

const results = [];
await scanDirectory(
  "../asknlearn/packages/core/ask-and-learn/src/pages",
  0,
  results,
  (filePath) => {
    return path.basename(filePath) === "index.tsx";
  }
);
console.log(`共扫描${results.length}个文件`);

writeFile(
  "output.json",
  {
    pages: results,
  },
  true
);
