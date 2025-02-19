装依赖：
bun install

杀进程：
while pgrep -f "bun"; do pkill -f "bun"; done;

拉代码：
cd /www/a && git fetch && git reset --hard && git pull

热启动：
cd /www/a && chmod 755 *; nohup bun dev > app.log 2>&1 &
