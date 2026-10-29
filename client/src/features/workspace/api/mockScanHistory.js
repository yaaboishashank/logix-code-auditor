import mockFindings from "./mockFindings";

const mockScanHistory = [
  {
    id: "scan-001",
    repository: "logix-demo",
    branch: "main",
    createdAt: "2026-10-24T09:00:00+05:30",
    status: "completed",
    findings: mockFindings.length,
  },
  {
    id: "scan-002",
    repository: "logix-demo",
    branch: "feature/logging",
    createdAt: "2026-10-23T15:30:00+05:30",
    status: "failed",
    findings: null,
  },
  {
    id: "scan-003",
    repository: "logix-demo",
    branch: "main",
    createdAt: "2026-10-22T11:00:00+05:30",
    status: "cancelled",
    findings: null,
  },
];

export default mockScanHistory;