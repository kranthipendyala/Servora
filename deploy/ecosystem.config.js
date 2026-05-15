// PM2 Configuration for Servora
// Place this in /home/USERNAME/servora-nextjs/
// Start: pm2 start ecosystem.config.js
// Replace USERNAME with actual cPanel username

module.exports = {
  apps: [
    {
      name: "servora",
      cwd: "/home/USERNAME/servora-nextjs",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        NEXT_PUBLIC_API_URL: "https://obesityworldconference.com/servora/api/api",
        NEXT_PUBLIC_SITE_URL: "https://obesityworldconference.com",
        NEXT_PUBLIC_BASE_PATH: "/servora",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/home/USERNAME/logs/servora-error.log",
      out_file: "/home/USERNAME/logs/servora-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
