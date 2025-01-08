To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000


杀进程：
while pgrep -f "bun"; do pkill -f "bun"; done;

拉代码：
cd /www/Forum && git fetch && git reset --hard && git pull

热启动：
cd /www/Forum && chmod 755 *; nohup bun run dev > app.log 2>&1 &
