import { spawn } from "node:child_process";

// 注：以下 spawn 调用添加了 stdio: "inherit" 参数
// 原因：让子进程的输出（如文件服务器启动日志、Vite 启动信息）正确显示在终端中，便于调试和排查问题
// 修改时间：2025-03-27
// 如需同步官方仓库更新，注意检查此处是否产生冲突
spawn("pnpm -F @noname/fs dev --debug --dirname=../../apps/core", { shell: true, stdio: "inherit" });
spawn("pnpm -F ./packages/extension/** build:watch", { shell: true, stdio: "inherit" });
spawn("pnpm -F noname dev --open", { shell: true, stdio: "inherit" });
