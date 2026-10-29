import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page not found — LOGIX";
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-badge">
          <span aria-hidden="true" />
          DETOUR AHEAD · CODE 404
        </div>

        <section className="not-found-card" aria-labelledby="not-found-title">
          <svg
            className="not-found-art"
            viewBox="0 0 480 280"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <filter
                id="logix-compass-shadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feDropShadow
                  dx="0"
                  dy="8"
                  stdDeviation="9"
                  floodColor="#82778f"
                  floodOpacity="0.18"
                />
              </filter>
            </defs>

            <path
              d="M90 55 L145 35 L190 68 M330 45 L385 65 L405 32"
              fill="none"
              stroke="#d9d4ed"
              strokeWidth="1.5"
              strokeDasharray="3 5"
            />
            <g fill="#9d8aff">
              <circle cx="90" cy="55" r="4" />
              <circle cx="190" cy="68" r="3" />
              <circle cx="385" cy="65" r="4" />
            </g>
            <g fill="#ffad9e">
              <circle cx="145" cy="35" r="2.5" />
              <circle cx="330" cy="45" r="3" />
            </g>
            <circle cx="405" cy="32" r="2.5" fill="#b39a76" />

            <text x="240" y="137" textAnchor="middle" className="not-found-number">
              404
            </text>

            <path
              d="M110 210 C150 162 184 178 211 190 S308 103 365 205"
              fill="none"
              stroke="#ff806b"
              strokeWidth="4"
              strokeDasharray="8 12"
              strokeLinecap="round"
            />
            <circle cx="110" cy="210" r="6" fill="#5940df" />
            <circle cx="365" cy="205" r="6" fill="#ff806b" />

            <path d="M80 166 L84 175 L94 179 L84 183 L80 192 L76 183 L66 179 L76 175 Z" fill="#ffd08d" />
            <path d="M405 143 L408 149 L415 152 L408 155 L405 162 L402 155 L395 152 L402 149 Z" fill="#a28cff" />

            <g filter="url(#logix-compass-shadow)">
              <circle cx="240" cy="148" r="61" fill="#fff" />
              <circle cx="240" cy="148" r="52" fill="#f4f2ff" />
              <circle
                cx="240"
                cy="148"
                r="45"
                fill="none"
                stroke="#cfc8e8"
                strokeWidth="1.5"
                strokeDasharray="2 7"
              />

              <g fill="#8c889f" fontSize="9" textAnchor="middle">
                <text x="240" y="112">N</text>
                <text x="280" y="151">E</text>
                <text x="240" y="189">S</text>
                <text x="200" y="151">W</text>
              </g>

              <g transform="rotate(-32 240 148)">
                <polygon points="240,112 229,148 251,148" fill="#ff806b" />
                <polygon points="240,184 229,148 251,148" fill="#5b43df" />
              </g>

              <circle cx="240" cy="148" r="7" fill="#fff" />
              <circle cx="240" cy="148" r="3" fill="#292539" />
            </g>

            <path
              d="M48 246 C115 221 165 255 228 235 S339 223 432 228"
              fill="none"
              stroke="#ecebff"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M70 262 C132 245 180 266 247 251 S347 253 422 249"
              fill="none"
              stroke="#dedff4"
              strokeWidth="4"
              strokeDasharray="5 9"
              strokeLinecap="round"
            />
          </svg>

          <h1 id="not-found-title">
            Oops! Page Not Found <span aria-hidden="true">•</span>
          </h1>

          <p className="not-found-hint">(Raasta bhatak gaye lagta hai)</p>

          <p className="not-found-description">
            The page you’re looking for might have been moved or removed.
            Let’s get you back to LOGIX.
          </p>

          <Link to="/" className="not-found-home">
            <ArrowLeft aria-hidden="true" />
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
};

export default NotFoundPage;