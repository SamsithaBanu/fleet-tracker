// Logs every request that comes through the gateway
// Shows: method, path, status code, time taken

const logger = (req, res, next) => {
  const start = Date.now();

  //when response is finished, log the details
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    //color code by status
    const color =
      status >= 500
        ? "\x1b[31m" // red   — server error
        : status >= 400
          ? "\x1b[33m" // yellow — client error
          : status >= 300
            ? "\x1b[36m" // cyan  — redirect
            : "\x1b[32m";

    console.log(
      `${color}[Gateway] ${req.method} ${req.path} → ${status} (${duration}ms)\x1b[0m`,
    );
  });
  next();
};
export default logger;
