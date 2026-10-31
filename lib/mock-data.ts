/**
 * Mock data for InfraDash.
 *
 * Every value is fake and generated deterministically (fixed reference date
 * plus seeded PRNGs) so that the static export renders identically on the
 * server and in the browser. The dashboard never calls a real API and never
 * uses tokens: all pages read from this module only.
 *
 * The data set is split by topic under lib/mock/ and re-exported here.
 */

export * from "./mock/core"
export * from "./mock/users"
export * from "./mock/projects"
export * from "./mock/commits"
export * from "./mock/merge-requests"
export * from "./mock/pipelines"
export * from "./mock/runners"
export * from "./mock/storage"
export * from "./mock/security"
export * from "./mock/incidents"
export * from "./mock/audit"
export * from "./mock/upgrade"
export * from "./mock/activity"
export * from "./mock/access"

export const currentUser = {
  name: "김인프라",
  email: "infra.admin@example.com",
  role: "관리자",
}
