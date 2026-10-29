import { Search } from "lucide-react";

const FindingsToolbar = ({
  search, onSearch, count, filters, onFilterChange,
}) => (
  <div className="findings-toolbar">
    <div className="findings-search">
      <Search aria-hidden="true" />
      <input
        type="search"
        aria-label="Search findings"
        placeholder="Search findings or files..."
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
    </div>

    <div className="findings-filters">
      <select
        name="severity"
        aria-label="Filter by severity"
        value={filters.severity}
        onChange={onFilterChange}
      >
        <option value="all">All severities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        name="status"
        aria-label="Filter by review status"
        value={filters.status}
        onChange={onFilterChange}
      >
        <option value="all">All statuses</option>
        <option value="open">Open</option>
        <option value="reviewed">Reviewed</option>
        <option value="dismissed">Dismissed</option>
      </select>
    </div>

    <span className="findings-count" role="status">
      {count} findings
    </span>
  </div>
);

export default FindingsToolbar;