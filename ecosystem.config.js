module.exports = {
  apps: [{
    name: 'kingpanel',
    cwd: '/home/hyk/kingpanel',
    script: '/home/hyk/kingpanel/.venv/bin/python',
    args: 'main.py',
    interpreter: 'none',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/home/hyk/kingpanel/site/server.err.log',
    out_file: '/home/hyk/kingpanel/site/server.out.log',
    merge_logs: true,
    pid_file: '/home/hyk/kingpanel/kingpanel.pid',
    max_restarts: 10,
    restart_delay: 3000,
    autorestart: true,
  }]
};
