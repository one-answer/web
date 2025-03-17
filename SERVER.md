### 安装：
bun install

### 停止：
while pgrep -f "bun"; do pkill -f "bun"; done;

### 拉取：
cd /www/assbbs_com && git fetch && git reset --hard && git pull

### 启动：
cd /www/assbbs_com && chmod 755 *; nohup bun app > app.log 2>&1 &

### 升级：
while pgrep -f "bun"; do pkill -f "bun"; done && sleep 1 && cd /www/assbbs_com && git fetch && git reset --hard && git pull && bun upgrade && bun install && cd /www/assbbs_com && chmod 755 *; nohup bun app > app.log 2>&1 &
