import fetch from "node-fetch";

const API_KEY = "2f791c32-9810-4de7-b8a7-5e98a000b2fa";
const SECRET = "342878a9-b7bf-4b4c-a943-f07e8d84f707";

const AUTH_URL =
  "https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/auth/generate-signature";
const PUBLISH_URL =
  "https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/versions/publish";

// 你的模板列表
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
  "template-range-xtd:v1.54.0-rc.29"
  // "template-silkie-product:v1.1.0-rc.1"
];

async function publishTemplate(template, version) {
  console.log(`\n🚀 发布中: ${template}:${version}`);

  // 1. 先生成签名
  const authBody = {
    secret: SECRET,
    body: { template, version },
  };

  const authResp = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authBody),
  });

  const authData = await authResp.json();

  if (!authData.success) {
    console.log(`❌ 鉴权失败: ${template} - ${authData.message}`);
    return;
  }

  const { signature, timestamp } = authData.data;

  // 2. 调用 publish
  const publishResp = await fetch(PUBLISH_URL, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "x-signature": signature,
      "x-timestamp": timestamp,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template, version }),
  });

  const publishData = await publishResp.json();

  if (publishData.success) {
    console.log(`✅ 发布成功: ${template}:${version}`);
  } else {
    console.log(`❌ 发布失败: ${template}:${version} - ${publishData.message}`);
  }
}

async function run() {
  for (const item of templates) {
    const [template, version] = item.split(":");
    await publishTemplate(template, version);
  }
}

run();
