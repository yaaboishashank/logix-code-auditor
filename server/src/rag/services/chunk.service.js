export const createCodeChunks = ({ path, content }) => {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const chunks = [];
  let start = 0;

  if (lines[lines.length - 1] === "") lines.pop();

  while (start < lines.length) {
    let end = start;
    let bytes = 0;

    while (end < lines.length && end - start < 60) {
      const size = Buffer.byteLength(lines[end], "utf8") + (end > start ? 1 : 0);

      if (bytes + size > 6000) break;

      bytes += size;
      end += 1;
    }

    if (end === start) {
      const error = new Error(
        `${path}:${start + 1} exceeds the 6000-byte line limit.`
      );

      error.statusCode = 422;
      throw error;
    }

    const code = lines.slice(start, end).join("\n");

    if (code.trim()) {
      chunks.push({
        path,
        chunkIndex: chunks.length,
        startLine: start + 1,
        endLine: end,
        content: code,
      });
    }

    if (end === lines.length) break;

    start = Math.max(start + 1, end - 10);
  }

  return chunks;
};