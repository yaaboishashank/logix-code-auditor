import { useId } from "react";
import { Link } from "react-router";
import useCodeSearch from "../../hooks/useCodeSearch";
import "../../code-search.css";

const CodeSearch = ({ scanId }) => {
  const inputId = useId();
  const { query, setQuery, result, error, isSearching, search } =
    useCodeSearch(scanId);

  return (
    <section className="code-search" aria-label="Search repository code">
      <h3>Search repository code</h3>

      <form className="code-search-form" onSubmit={search}>
        <label htmlFor={inputId}>What are you looking for?</label>

        <div className="code-search-controls">
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Where are API errors handled?"
            minLength={3}
            maxLength={500}
            required
          />

          <button
            type="submit"
            className="ui-button"
            disabled={isSearching || query.trim().length < 3}
          >
            {isSearching ? "Searching…" : "Search code"}
          </button>
        </div>
      </form>

      {error && (
        <p className="code-search-error" role="alert">
          {error.message}{" "}
          {error.status === 401 && <Link to="/login">Log in again</Link>}
        </p>
      )}

      <p className="code-search-status" role="status">
        {isSearching
          ? "Finding matching code…"
          : result
            ? `${result.matches.length} results for “${result.query}”`
            : "Search your indexed source files."}
      </p>

      {result?.matches.length === 0 && (
        <p className="code-search-empty">
          No matches returned. Try another query, or wait briefly if indexing
          just finished.
        </p>
      )}

      <div className="code-search-results" aria-busy={isSearching}>
        {result?.matches.map((match) => (
          <article className="code-search-result" key={match.id}>
            <header>
              <h4>{match.path}</h4>
              <span>
                Lines {match.startLine}–{match.endLine}
              </span>
            </header>

            <pre
              tabIndex={0}
              aria-label={`Source code from ${match.path}`}
            >
              <code>{match.content}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CodeSearch;