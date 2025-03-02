import { and, eq } from "drizzle-orm";
import { DB, Message } from "./data";

// 增加消息
export async function mAdd(uid: number, type: number, time: number, pid: number) {
    try {
        await DB
            .insert(Message)
            .values({
                uid,
                type,
                time,
                pid,
            })
            .execute();
    } catch (error) {
        console.error('插入失败:', error);
        // 如果插入失败则提醒 因为发帖时只运行一次 应该不会有冲突 但以防万一
    }
}

// 删除消息
export async function mDel(uid: number, type: number, time: number, pid: number) {
    try {
        await DB
            .delete(Message)
            .where(and(
                eq(Message.uid, uid),
                eq(Message.type, type),
                eq(Message.time, time),
                eq(Message.pid, pid),
            ))
            .execute();
    } catch (error) {
        console.error('删除失败:', error);
        // 如果记录已经被删除 也不会报错 但以防万一
    }
}

// 已读消息 type也可输入负数 从已读切换到未读
export async function mRead(uid: number, type: number, time: number, pid: number) {
    try {
        await DB
            .update(Message)
            .set({
                type: -type,
            })
            .where(and(
                eq(Message.uid, uid),
                eq(Message.type, type),
                eq(Message.time, time),
                eq(Message.pid, pid),
            ))
            .execute();
    } catch (error) {
        console.error('删除失败:', error);
        // 如果记录已经被删除 也不会报错 但以防万一
    }
}
