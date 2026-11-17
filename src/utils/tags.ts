/**
 * 标签解析 / 序列化工具
 * 后端 tags 字段存的是 JSON 字符串，例如 '["Java","篮球"]'
 */

export function parseTags(tags: any): string[] {
  if (!tags) {
    return [];
  }
  if (Array.isArray(tags)) {
    return tags.filter((t) => typeof t === 'string');
  }
  try {
    const arr = JSON.parse(tags);
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string') : [];
  } catch (e) {
    return [];
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}
