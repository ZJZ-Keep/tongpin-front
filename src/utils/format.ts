/**
 * 时间格式化工具
 * 兼容后端返回的 Date 字符串 / 时间戳 / 已格式化字符串
 */

export function formatDate(
  value?: string | number | Date | null,
  withTime = true,
): string {
  if (!value) {
    return '';
  }
  const d = new Date(value as string | number | Date);
  if (isNaN(d.getTime())) {
    // 已经是不可解析的字符串，原样返回
    return String(value);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!withTime) {
    return date;
  }
  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 只显示日期（yyyy-MM-dd）
 */
export function formatDateOnly(value?: string | number | Date | null): string {
  return formatDate(value, false);
}
