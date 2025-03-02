import { DB, Conf, User, Thread, Post } from '../app/base';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

// 删除原有的 generatePassword 函数,改用与前端一致的 md5 函数
function md5(r: string): string {
    function n(r: number, n: number): number {
        var t = (65535 & r) + (65535 & n);
        return (r >> 16) + (n >> 16) + (t >> 16) << 16 | 65535 & t;
    }
    function t(r: number, t: number, u: number, e: number, a: number, c: number): number {
        var f = n(n(t, r), n(e, c));
        return n(f << a | f >>> 32 - a, u);
    }
    function u(r: number, n: number, u: number, e: number, a: number, c: number, f: number): number {
        return t(n & u | ~n & e, r, n, a, c, f);
    }
    function e(r: number, n: number, u: number, e: number, a: number, c: number, f: number): number {
        return t(n & e | u & ~e, r, n, a, c, f);
    }
    function a(r: number, n: number, u: number, e: number, a: number, c: number, f: number): number {
        return t(n ^ u ^ e, r, n, a, c, f);
    }
    function c(r: number, n: number, u: number, e: number, a: number, c: number, f: number): number {
        return t(u ^ (n | ~e), r, n, a, c, f);
    }
    const f: number[] = [];
    const o = 8 * r.length;
    let i = 1732584193;
    let h = -271733879;
    let v = -1732584194;
    let A = 271733878;
    let d = 0;
    for (d = 0; d < o; d += 8) {
        f[d >> 5] |= (255 & r.charCodeAt(d / 8)) << d % 32;
    }
    f[o >> 5] |= 128 << o % 32;
    f[14 + (o + 64 >>> 9 << 4)] = o;
    for (d = 0; d < f.length; d += 16) {
        const g = i;
        const l = h;
        const y = v;
        const b = A;
        h = c(h = c(h = c(h = c(h = a(h = a(h = a(h = a(h = e(h = e(h = e(h = e(h = u(h = u(h = u(h = u(h,
            v = u(v, A = u(A, i = u(i, h, v, A, f[d + 0], 7, -680876936), h, v, f[d + 1], 12, -389564586),
                i, h, f[d + 2], 17, 606105819), A, i, f[d + 3], 22, -1044525330),
            v = u(v, A = u(A, i = u(i, h, v, A, f[d + 4], 7, -176418897), h, v, f[d + 5], 12, 1200080426),
                i, h, f[d + 6], 17, -1473231341), A, i, f[d + 7], 22, -45705983),
            v = u(v, A = u(A, i = u(i, h, v, A, f[d + 8], 7, 1770035416), h, v, f[d + 9], 12, -1958414417),
                i, h, f[d + 10], 17, -42063), A, i, f[d + 11], 22, -1990404162),
            v = u(v, A = u(A, i = u(i, h, v, A, f[d + 12], 7, 1804603682), h, v, f[d + 13], 12, -40341101),
                i, h, f[d + 14], 17, -1502002290), A, i, f[d + 15], 22, 1236535329),
            v = e(v, A = e(A, i = e(i, h, v, A, f[d + 1], 5, -165796510), h, v, f[d + 6], 9, -1069501632),
                i, h, f[d + 11], 14, 643717713), A, i, f[d + 0], 20, -373897302),
            v = e(v, A = e(A, i = e(i, h, v, A, f[d + 5], 5, -701558691), h, v, f[d + 10], 9, 38016083),
                i, h, f[d + 15], 14, -660478335), A, i, f[d + 4], 20, -405537848),
            v = e(v, A = e(A, i = e(i, h, v, A, f[d + 9], 5, 568446438), h, v, f[d + 14], 9, -1019803690),
                i, h, f[d + 3], 14, -187363961), A, i, f[d + 8], 20, 1163531501),
            v = e(v, A = e(A, i = e(i, h, v, A, f[d + 13], 5, -1444681467), h, v, f[d + 2], 9, -51403784),
                i, h, f[d + 7], 14, 1735328473), A, i, f[d + 12], 20, -1926607734),
            v = a(v, A = a(A, i = a(i, h, v, A, f[d + 5], 4, -378558), h, v, f[d + 8], 11, -2022574463),
                i, h, f[d + 11], 16, 1839030562), A, i, f[d + 14], 23, -35309556),
            v = a(v, A = a(A, i = a(i, h, v, A, f[d + 1], 4, -1530992060), h, v, f[d + 4], 11, 1272893353),
                i, h, f[d + 7], 16, -155497632), A, i, f[d + 10], 23, -1094730640),
            v = a(v, A = a(A, i = a(i, h, v, A, f[d + 13], 4, 681279174), h, v, f[d + 0], 11, -358537222),
                i, h, f[d + 3], 16, -722521979), A, i, f[d + 6], 23, 76029189),
            v = a(v, A = a(A, i = a(i, h, v, A, f[d + 9], 4, -640364487), h, v, f[d + 12], 11, -421815835),
                i, h, f[d + 15], 16, 530742520), A, i, f[d + 2], 23, -995338651),
            v = c(v, A = c(A, i = c(i, h, v, A, f[d + 0], 6, -198630844), h, v, f[d + 7], 10, 1126891415),
                i, h, f[d + 14], 15, -1416354905), A, i, f[d + 5], 21, -57434055),
            v = c(v, A = c(A, i = c(i, h, v, A, f[d + 12], 6, 1700485571), h, v, f[d + 3], 10, -1894986606),
                i, h, f[d + 10], 15, -1051523), A, i, f[d + 1], 21, -2054922799),
            v = c(v, A = c(A, i = c(i, h, v, A, f[d + 8], 6, 1873313359), h, v, f[d + 15], 10, -30611744),
                i, h, f[d + 6], 15, -1560198380), A, i, f[d + 13], 21, 1309151649),
            v = c(v, A = c(A, i = c(i, h, v, A, f[d + 4], 6, -145523070), h, v, f[d + 11], 10, -1120210379),
                i, h, f[d + 2], 15, 718787259), A, i, f[d + 9], 21, -343485551),
            i = n(i, g), h = n(h, l), v = n(v, y), A = n(A, b);
    }
    const m = [i, h, v, A];
    const C = "0123456789abcdef";
    let j = "";
    for (d = 0; d < 4 * m.length; d++) {
        j += C.charAt(m[d >> 2] >> d % 4 * 8 + 4 & 15) + C.charAt(m[d >> 2] >> d % 4 * 8 & 15);
    }
    return j;
}

async function main() {
    const currentTime = Math.floor(Date.now() / 1000);

    try {
        console.log('开始初始化数据库...');

        // 检查数据库表结构
        console.log('检查数据库表结构...');

        // 初始化系统配置
        console.log('正在初始化系统配置...');
        const configs = [
            { key: 'site_name', value: JSON.stringify('ASSBBS') },
            { key: 'site_description', value: JSON.stringify('A Simple and Sweet BBS') },
            { key: 'register_enable', value: JSON.stringify(true) },
            { key: 'post_interval', value: JSON.stringify(60) }, // 发帖间隔（秒）
            { key: 'credits_initial', value: JSON.stringify(100) }, // 新用户初始积分
            { key: 'credits_login', value: JSON.stringify(10) }, // 登录奖励积分
            { key: 'credits_post', value: JSON.stringify(5) }, // 发帖奖励积分
            {
                key: 'theme', value: JSON.stringify({
                    primaryColor: '#007bff',
                    secondaryColor: '#6c757d',
                    backgroundColor: '#f8f9fa'
                })
            },
            { key: 'secret_key', value: JSON.stringify('your-secret-key-here') },
            {
                key: 'friend_link', value: JSON.stringify([
                    { name: 'ASSBBS', url: 'https://github.com/your-username/assbbs' }
                ])
            }
        ];

        for (const config of configs) {
            console.log(`正在设置配置: ${config.key} = ${config.value}`);
            await DB.insert(Conf).values(config).onConflictDoUpdate({
                target: Conf.key,
                set: { value: config.value }
            });
        }

        // 创建管理员用户
        console.log('正在创建管理员用户...');
        const adminSalt = randomBytes(16).toString('hex');
        const adminUser = {
            uid: 1,
            gid: 1, // 管理员组
            mail: 'admin@example.com',
            name: 'admin',
            hash: md5(md5('admin123') + adminSalt),
            salt: adminSalt,
            credits: 1000,
            golds: 100,
            time: currentTime
        };
        console.log('管理员用户数据:', adminUser);

        try {
            await DB.insert(User).values(adminUser).onConflictDoUpdate({
                target: User.uid,
                set: { ...adminUser }
            });
            console.log('管理员用户创建成功');
        } catch (error) {
            console.error('创建管理员用户失败:', error);
            throw error;
        }

        // 创建测试用户
        console.log('正在创建测试用户...');
        const testSalt = randomBytes(16).toString('hex');
        const testUser = {
            uid: 2,
            gid: 0, // 普通用户组
            mail: 'test@example.com',
            name: 'test',
            hash: md5(md5('test123') + testSalt),
            salt: testSalt,
            credits: 100,
            golds: 10,
            time: currentTime
        };
        console.log('测试用户数据:', testUser);

        try {
            await DB.insert(User).values(testUser).onConflictDoUpdate({
                target: User.uid,
                set: { ...testUser }
            });
            console.log('测试用户创建成功');
        } catch (error) {
            console.error('创建测试用户失败:', error);
            throw error;
        }

        // 创建欢迎主题
        console.log('正在创建欢迎主题...');
        const welcomeThread = {
            tid: 1,
            uid: 1, // 管理员发布
            access: 0,
            is_top: 1, // 置顶
            time: currentTime,
            last_time: currentTime,
            last_uid: 1,
            posts: 1,
            subject: '欢迎来到 ASSBBS！'
        };
        console.log('欢迎主题数据:', welcomeThread);

        try {
            await DB.insert(Thread).values(welcomeThread).onConflictDoUpdate({
                target: Thread.tid,
                set: { ...welcomeThread }
            });
            console.log('欢迎主题创建成功');
        } catch (error) {
            console.error('创建欢迎主题失败:', error);
            throw error;
        }

        // 创建欢迎帖子
        console.log('正在创建欢迎帖子...');
        const welcomePost = {
            pid: 1,
            tid: 1,
            uid: 1,
            access: 0,
            time: currentTime,
            quote_pid: 0,
            content: `# 欢迎来到 ASSBBS！

这是一个简单而温馨的论坛系统。

## 主要功能
- 用户注册和登录
- 发帖和回复
- 主题管理
- 积分系统

## 新手指南
1. 注册账号即可参与讨论
2. 每日登录可获得积分奖励
3. 发帖和回复也可以获得积分
4. 请遵守论坛规则，文明发言

祝您使用愉快！`
        };
        console.log('欢迎帖子数据:', welcomePost);

        try {
            await DB.insert(Post).values(welcomePost).onConflictDoUpdate({
                target: Post.pid,
                set: { ...welcomePost }
            });
            console.log('欢迎帖子创建成功');
        } catch (error) {
            console.error('创建欢迎帖子失败:', error);
            throw error;
        }

        // 更新管理员统计
        console.log('正在更新管理员统计...');
        try {
            await DB.update(User)
                .set({ threads: 1, posts: 1 })
                .where(eq(User.uid, 1));
            console.log('管理员统计更新成功');
        } catch (error) {
            console.error('更新管理员统计失败:', error);
            throw error;
        }

        console.log('数据库初始化完成！');
        console.log('管理员账号：admin@example.com');
        console.log('管理员密码：admin123');
        console.log('测试账号：test@example.com');
        console.log('测试密码：test123');

    } catch (error) {
        console.error('初始化数据库时出错：', error);
        process.exit(1);
    }
}

main();
