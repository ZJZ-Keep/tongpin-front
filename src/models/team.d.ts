import type {UserType} from "./user";

/**
 * 队伍类别
 */
export type TeamType = {
    id: number;
    description?: string,
    expireTime: Date,
    maxNum: number
    name: string
    password?: string
    status: number,
    userId: number
    createTime: Date;
    updateTime: Date;
    createUser?: UserType;
    createUserVo?: UserType;
    hasJoin?: boolean;
    hasJoinNum?: number;
};
