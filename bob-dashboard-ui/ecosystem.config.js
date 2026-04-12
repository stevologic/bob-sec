module.exports = {
  apps: [
    {
      name: "bob-dashboard",
      script: "npm",
      args: "run dev -- --host 0.0.0.0",
      cwd: "./",
      interpreter: "none",
      watch: false,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};