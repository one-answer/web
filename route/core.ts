import { getCookie } from "hono/cookie";
import { DB, Conf } from "./base";
import { Context } from "hono";
import { verify } from "hono/jwt";
import { JWTSecretKey } from "../config";

export class Config {
    private static conf: { [key: string]: any } = {};
    private constructor() { }
    public static init() {
        DB.select().from(Conf).all().forEach(item => {
            Config.conf[item.key] = JSON.parse(item.value ?? 'null');
        });
    }
    public static get(key: string) {
        return Config.conf[key];
    }
}

export class Counter {
    private static counters: Map<string, number> = new Map();
    private name: string;
    // 如果这个名称的计数器不存在，则初始化为0
    constructor(name: string = 'default') {
        this.name = name;
        if (!Counter.counters.has(name)) {
            Counter.counters.set(name, 0);
        }
    }
    // 获取当前计数
    public get(): number {
        return Counter.counters.get(this.name) ?? 0;
    }
    // 设置计数器值
    public set(value: number): void {
        Counter.counters.set(this.name, value);
    }
    // 增加计数并返回新值
    public add(): number {
        const newValue = (Counter.counters.get(this.name) ?? 0) + 1;
        Counter.counters.set(this.name, newValue);
        return newValue;
    }
    // 获取计数器名称
    public getName(): string {
        return this.name;
    }
    // 获取所有计数器的状态
    public static getAllCounters(): Map<string, number> {
        return new Map(Counter.counters);
    }
}

export function Pagination(perPage: number, sum: number, page: number, near: number) {
    if (!page) { page = 1 }
    // 首页
    const navigation = [1]
    const maxPage = Math.floor((sum + perPage - 1) / perPage)
    if (page <= 1 + near) {
        // 首页邻页
        const edge = 1 + near * 2
        for (let p = 2; p <= edge && p < maxPage; p++) {
            navigation.push(p)
        }
        if (edge < maxPage - 1) {
            navigation.push(0)
        }
    } else if (page >= maxPage - near) {
        // 尾页邻页
        const edge = maxPage - near * 2
        if (edge > 2) {
            navigation.push(0)
        }
        for (let p = edge; p < maxPage; p++) {
            if (p > 1) {
                navigation.push(p)
            }
        }
    } else {
        // 非首尾页
        if (page - near > 2) {
            navigation.push(0)
        }
        for (let p = page - near; p <= page + near; p++) {
            navigation.push(p)
        }
        if (page + near < maxPage - 1) {
            navigation.push(0)
        }
    }
    // 尾页
    if (maxPage > 1) {
        navigation.push(maxPage)
    }
    return navigation
}

export async function Auth(a: Context) {
    const jwt = getCookie(a, 'JWT');
    if (!jwt) { return false }
    try {
        return await verify(jwt, JWTSecretKey)
    } catch (error) {
        return false
    }
}