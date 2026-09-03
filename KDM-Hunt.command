#!/bin/bash
# KDM-Hunt 狩猎纯净版 —— macOS 启动器（.command）
# 双击本文件即可运行；若系统提示无权限，请在“终端”里先执行一次：
#   chmod +x "KDM-Hunt.command"
cd "$(dirname "$0")" || exit 1
if [ ! -f "data/manifest.json" ]; then
  if [ -d "dist" ] && [ -f "dist/data/manifest.json" ]; then
    cd dist || exit 1
  else
    echo
    echo "[错误] 未找到 data/manifest.json，请确认目录已完整解压。"
    echo
    read -r -p "按回车键退出…" _
    exit 1
  fi
fi
PY=""
if [ -x "./runtime/python3" ]; then
  PY="./runtime/python3"
elif command -v python3 >/dev/null 2>&1; then
  PY="python3"
fi
if [ -z "$PY" ]; then
  echo
  echo "[错误] 未找到 Python 3.10+。"
  echo "解决办法：到 python.org 安装 Python 3（或安装 Xcode 命令行工具），"
  echo "或把 macOS 版 python3 放入本目录 runtime/ 子文件夹。"
  echo
  read -r -p "按回车键退出…" _
  exit 1
fi
echo "正在启动，浏览器将自动打开狩猎面板……"
echo "按 Ctrl+C 或关闭本窗口即可停止服务。"
exec "$PY" server.py
