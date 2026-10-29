import { useMemo } from "react";

const CodeBlock = ({ code }) => {
  const tokens = useMemo(
    () =>
      code.split(
        /(\/\/[^\n]*|"[^"]*"|\b(?:async|function|try|return|await|catch|null)\b)/g,
      ),
    [code],
  );

  return (
    <pre tabIndex={0} aria-label="JavaScript sample">
      <code>
        {tokens.map((token, index) => {
          let type = "";

          if (token.startsWith("//")) {
            type = "comment";
          } else if (token.startsWith('"')) {
            type = "string";
          } else if (
            /^(async|function|try|return|await|catch|null)$/.test(token)
          ) {
            type = "keyword";
          }

          return (
            <span key={index} className={type && `token-${type}`}>
              {token}
            </span>
          );
        })}
      </code>
    </pre>
  );
};

export default CodeBlock;