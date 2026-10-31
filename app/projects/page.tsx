import type { Metadata } from "next"

import { ProjectsView } from "@/components/views/projects-view"

export const metadata: Metadata = { title: "프로젝트" }

export default function ProjectsPage() {
  return <ProjectsView />
}
