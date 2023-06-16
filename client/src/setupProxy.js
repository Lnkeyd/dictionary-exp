const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://deploy-dict-exp.vercel.app:5000",
      changeOrigin: true,
    })
  );
};
