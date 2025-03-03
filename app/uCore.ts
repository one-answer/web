import { Maps } from "./core";

// 用户上次发帖时间（防止频繁发帖）
export function uLastPostTime(uid: number, time: number = 0) {
    const map = Maps.get<number, number>('UserLastPostTime');
    if (time) {
        map.set(uid, time);
        return time;
    } else {
        return (map.get(uid) || 0);
    }
}
