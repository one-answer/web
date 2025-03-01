import { DB, Conf, User, Thread, Post, Notice } from '../app/data';
import { eq } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

// 生成密码哈希和盐
function generatePassword(password: string): { hash: string; salt: string } {
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256').update(password + salt).digest('hex');
    return { hash, salt };
}

async function main() {
    const currentTime = Math.floor(Date.now() / 1000);

    try {
        // 初始化系统配置
        const configs = [
            { key: 'site_name', value: JSON.stringify('ASSBBS') },
            { key: 'site_description', value: JSON.stringify('A Simple and Sweet BBS') },
            { key: 'register_enable', value: JSON.stringify(true) },
            { key: 'post_interval', value: JSON.stringify(60) }, // 发帖间隔（秒）
            { key: 'credits_initial', value: JSON.stringify(100) }, // 新用户初始积分
            { key: 'credits_login', value: JSON.stringify(10) }, // 登录奖励积分
            { key: 'credits_post', value: JSON.stringify(5) }, // 发帖奖励积分
            { key: 'theme', value: JSON.stringify({
                primaryColor: '#007bff',
                secondaryColor: '#6c757d',
                backgroundColor: '#f8f9fa'
            })}
        ];

        for (const config of configs) {
            await DB.insert(Conf).values(config).onConflictDoUpdate({
                target: Conf.key,
                set: { value: config.value }
            });
        }

        // 创建管理员用户
        const adminPassword = generatePassword('admin123');
        const adminUser = {
            uid: 1,
            gid: 99, // 管理员组
            mail: 'admin@example.com',
            name: 'admin',
            hash: adminPassword.hash,
            salt: adminPassword.salt,
            credits: 1000,
            golds: 100,
            create_date: currentTime
        };

        await DB.insert(User).values(adminUser).onConflictDoUpdate({
            target: User.uid,
            set: { ...adminUser }
        });

        // 创建测试用户
        const testPassword = generatePassword('test123');
        const testUser = {
            uid: 2,
            gid: 0, // 普通用户组
            mail: 'test@example.com',
            name: 'test',
            hash: testPassword.hash,
            salt: testPassword.salt,
            credits: 100,
            golds: 10,
            create_date: currentTime
        };

        await DB.insert(User).values(testUser).onConflictDoUpdate({
            target: User.uid,
            set: { ...testUser }
        });

        // 创建欢迎主题
        const welcomeThread = {
            tid: 1,
            uid: 1, // 管理员发布
            access: 0,
            is_top: 1, // 置顶
            create_date: currentTime,
            last_date: currentTime,
            last_uid: 1,
            posts: 1,
            subject: '欢迎来到 ASSBBS！'
        };

        await DB.insert(Thread).values(welcomeThread).onConflictDoUpdate({
            target: Thread.tid,
            set: { ...welcomeThread }
        });

        // 创建欢迎帖子
        const welcomePost = {
            pid: 1,
            tid: 1,
            uid: 1,
            access: 0,
            create_date: currentTime,
            quote_pid: 0,
            quote_uid: 0,
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

        await DB.insert(Post).values(welcomePost).onConflictDoUpdate({
            target: Post.pid,
            set: { ...welcomePost }
        });

        // 更新管理员的发帖统计
        await DB.update(User)
            .set({ threads: 1, posts: 1 })
            .where(eq(User.uid, 1));

        console.log('数据库初始化完成！');
        console.log('管理员账号：admin');
        console.log('管理员密码：admin123');
        console.log('测试账号：test');
        console.log('测试密码：test123');

    } catch (error) {
        console.error('初始化数据库时出错：', error);
        process.exit(1);
    }
}

main();
