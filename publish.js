import { publishBatch } from "./publisher.js";

// 批量模板列表，格式为 "模板名:版本号"
const templates = [
  // "template-align-blog:v1.1.0-rc.1",
  // "template-align-product:v1.1.0-rc.1",
  // "template-boost-product:v1.1.0-rc.2",
  // "template-cover-blog:v1.1.0-rc.1",
  // "template-cover-product:v1.1.0-rc.1",
  // "template-dense-product:v1.1.0-rc.1",
  // "template-dental-blog:v1.1.0-rc.1",
  // "template-dental-product:v1.1.0-rc.1",
  // "template-next-home:v1.0.0-rc.7",
  // "template-plantar-blog:v1.1.0-rc.1",
  // "template-plantar-product:v1.1.0-rc.1",
  // "template-pluggy-product:v1.1.0-rc.1",
  // "template-remedy-blog:v1.1.0-rc.1",
  // "template-remedy-product:v1.2.0-rc.1",
  // "template-revital-product:v1.1.0-rc.1",
  // "template-snug-product:v1.1.0-rc.1",
  // "template-cleaner-product:v1.7.0-rc.1",
  // "template-cleaner-blog:v1.7.0-rc.1",
  // "template-thick-product:v1.1.0-rc.1",
  // "template-toddhair-product:v1.1.0-rc.1",
  "template-range-xtd:v1.54.0-rc.29",
  // "template-silkie-product:v1.1.0-rc.1"
];

async function run() {
  const items = templates.map((item) => {
    const [template, version] = item.split(":");
    return { template, version };
  });

  const results = await publishBatch(items);

  for (const result of results) {
    const prefix = result.success ? "✅ 发布成功" : "❌ 发布失败";
    console.log(
      `${prefix}: ${result.template}:${result.version} - ${result.message}`
    );
  }
}

run().catch((err) => {
  console.error("执行出错:", err);
  process.exit(1);
});
