import fetch from "node-fetch";

const API_KEY =
  process.env.API_KEY || "2f791c32-9810-4de7-b8a7-5e98a000b2fa";
const SECRET =
  process.env.SECRET || "342878a9-b7bf-4b4c-a943-f07e8d84f707";
const AUTH_URL =
  process.env.AUTH_URL ||
  "https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/auth/generate-signature";
const PUBLISH_URL =
  process.env.PUBLISH_URL ||
  "https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/versions/publish";

function ensureConfig() {
  if (!API_KEY || !SECRET) {
    throw new Error("请先在环境变量中设置 API_KEY 和 SECRET");
  }

  if (!AUTH_URL || !PUBLISH_URL) {
    throw new Error("缺少 AUTH_URL 或 PUBLISH_URL 配置");
  }
}

async function requestSignature(template, version) {
  const authBody = {
    secret: SECRET,
    body: { template, version },
  };

  const resp = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authBody),
  });

  const data = await resp.json();

  if (!data.success || !data.data?.signature) {
    throw new Error(data.message || "签名获取失败");
  }

  return data.data;
}

async function publishTemplate(template, version) {
  ensureConfig();

  const { signature, timestamp } = await requestSignature(template, version);

  const resp = await fetch(PUBLISH_URL, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "x-signature": signature,
      "x-timestamp": timestamp,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template, version }),
  });

  const data = await resp.json();

  if (data.success) {
    return { success: true, message: "发布成功" };
  }

  const message = data.message || "发布失败";
  return { success: false, message };
}

async function publishBatch(items = []) {
  const results = [];

  for (const item of items) {
    const template = item?.template?.trim();
    const version = item?.version?.trim();

    if (!template || !version) {
      results.push({
        template: template || item?.template || "",
        version: version || item?.version || "",
        success: false,
        message: "模板名或版本号缺失",
      });
      continue;
    }

    try {
      const result = await publishTemplate(template, version);
      results.push({ template, version, ...result });
    } catch (err) {
      results.push({
        template,
        version,
        success: false,
        message: err.message || "未知错误",
      });
    }
  }

  return results;
}

export { publishTemplate, publishBatch };
