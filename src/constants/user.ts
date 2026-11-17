import defaultAvatarUrl from '../assets/default-avatar.svg';

/**
 * 用户相关常量
 */

/**
 * 性别映射：0-男，1-女
 */
export const genderMap: Record<number, string> = {
  0: '男',
  1: '女',
};

/**
 * 性别选项
 */
export const genderOptions = [
  { label: '男', value: 0 },
  { label: '女', value: 1 },
];

/**
 * 默认头像（本地资源，离线可用）
 */
export const DEFAULT_AVATAR = defaultAvatarUrl;
