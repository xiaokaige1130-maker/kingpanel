"""
KingPanel — 运维状态 API
GET /api/ops/status  返回本机、PVE、NAS 基础监控状态
"""
from __future__ import annotations

import json
import os
import shlex
import socket
import subprocess
import time
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter()

ROOT = Path(__file__).resolve().parent.parent
LOCAL_CONFIG = ROOT / "ops_hosts.local.json"
METRICS_COMMAND = r"""
printf 'HOSTNAME='; hostname
printf 'LOAD='; cat /proc/loadavg
printf 'CORES='; nproc
printf 'MEM='; awk '/MemTotal|MemAvailable/ {print $1 $2}' /proc/meminfo | xargs
printf 'DISK='; df -P / | tail -1
printf 'UPTIME='; awk '{print int($1)}' /proc/uptime
"""


def _read_hosts() -> list[dict[str, Any]]:
    hosts = [
        {"id": "local", "name": "Ubuntu", "kind": "local"},
    ]
    if LOCAL_CONFIG.exists():
        try:
            data = json.loads(LOCAL_CONFIG.read_text("utf-8"))
            hosts.extend(data.get("hosts", []))
        except Exception:
            pass
    return hosts


def _local_metrics() -> dict[str, Any]:
    load1, load5, load15 = Path("/proc/loadavg").read_text().split()[:3]
    mem = {}
    for line in Path("/proc/meminfo").read_text().splitlines():
        key, value = line.split(":", 1)
        mem[key] = int(value.strip().split()[0])
    total = mem.get("MemTotal", 0)
    available = mem.get("MemAvailable", 0)
    used_percent = round((1 - available / total) * 100, 1) if total else 0
    disk = subprocess.check_output(["df", "-P", "/"], text=True).splitlines()[-1].split()
    uptime_seconds = float(Path("/proc/uptime").read_text().split()[0])
    return {
        "status": "online",
        "hostname": socket.gethostname(),
        "load": [float(load1), float(load5), float(load15)],
        "cpuCores": os.cpu_count() or 1,
        "memory": {
            "totalMb": round(total / 1024),
            "usedMb": round((total - available) / 1024),
            "usedPercent": used_percent,
        },
        "disk": {
            "mount": disk[5],
            "total": disk[1],
            "used": disk[2],
            "usedPercent": float(disk[4].rstrip("%")),
        },
        "uptimeSeconds": int(uptime_seconds),
    }


def _connect_ssh(host: dict[str, Any]):
    import paramiko

    clients = []
    sock = None
    chain = [*host.get("jumps", []), host]
    for idx, node in enumerate(chain):
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(
            hostname=node["host"],
            port=int(node.get("port", 22)),
            username=node["username"],
            password=node.get("password"),
            timeout=5,
            banner_timeout=5,
            auth_timeout=5,
            look_for_keys=False,
            allow_agent=False,
            sock=sock,
        )
        clients.append(client)
        if idx < len(chain) - 1:
            transport = client.get_transport()
            if transport is None:
                raise RuntimeError(f"{node.get('name', node['host'])} transport unavailable")
            next_node = chain[idx + 1]
            sock = transport.open_channel(
                "direct-tcpip",
                (next_node["host"], int(next_node.get("port", 22))),
                ("127.0.0.1", 0),
            )
    return clients[-1], clients


def _run_metrics_command(client, command: str = METRICS_COMMAND) -> dict[str, Any]:
    _, stdout, stderr = client.exec_command(command, timeout=8)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace").strip()
    if err and not out:
        return {"status": "error", "error": err[:180]}
    parsed = _parse_remote_output(out)
    parsed["status"] = "online"
    if err:
        parsed["warning"] = err[:180]
    return parsed


def _ssh_metrics(host: dict[str, Any]) -> dict[str, Any]:
    try:
        import paramiko
    except Exception as exc:
        return {"status": "error", "error": f"缺少 paramiko: {exc}"}

    started = time.time()
    clients = []
    try:
        client, clients = _connect_ssh(host)
        if host.get("kind") == "ssh_alias":
            command = (
                "ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "
                f"-o ConnectTimeout=6 {shlex.quote(host['alias'])} "
                f"{shlex.quote(METRICS_COMMAND)}"
            )
            parsed = _run_metrics_command(client, command)
        else:
            parsed = _run_metrics_command(client)
        parsed["latencyMs"] = round((time.time() - started) * 1000)
        return parsed
    except Exception as exc:
        return {"status": "offline", "error": str(exc)[:180]}
    finally:
        for client in reversed(clients):
            client.close()


def _parse_remote_output(out: str) -> dict[str, Any]:
    values: dict[str, str] = {}
    for line in out.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            values[key] = value.strip()

    load = [float(x) for x in values.get("LOAD", "0 0 0").split()[:3]]
    cores = int(values.get("CORES", "1") or 1)
    mem_bits = values.get("MEM", "").replace("MemTotal:", "MemTotal ").replace(
        "MemAvailable:", "MemAvailable "
    ).split()
    mem_map = {mem_bits[i]: int(mem_bits[i + 1]) for i in range(0, len(mem_bits) - 1, 2)}
    total = mem_map.get("MemTotal", 0)
    available = mem_map.get("MemAvailable", 0)
    disk_bits = values.get("DISK", "").split()
    used_percent = round((1 - available / total) * 100, 1) if total else 0
    return {
        "hostname": values.get("HOSTNAME", ""),
        "load": load,
        "cpuCores": cores,
        "memory": {
            "totalMb": round(total / 1024),
            "usedMb": round((total - available) / 1024),
            "usedPercent": used_percent,
        },
        "disk": {
            "mount": disk_bits[5] if len(disk_bits) > 5 else "/",
            "total": disk_bits[1] if len(disk_bits) > 1 else "0",
            "used": disk_bits[2] if len(disk_bits) > 2 else "0",
            "usedPercent": float(disk_bits[4].rstrip("%")) if len(disk_bits) > 4 else 0,
        },
        "uptimeSeconds": int(values.get("UPTIME", "0") or 0),
    }


@router.get("/api/ops/status")
def ops_status():
    result = []
    for host in _read_hosts():
        if host.get("kind") == "local":
            metrics = _local_metrics()
        else:
            metrics = _ssh_metrics(host)
        result.append({
            "id": host.get("id"),
            "name": host.get("name"),
            "role": host.get("role", ""),
            "address": host.get("host", "127.0.0.1"),
            **metrics,
        })
    return {"hosts": result}
