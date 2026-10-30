"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  USER_CHANGE_WINDOW_DAYS,
  joiners,
  leavers,
  users,
  type MockUser,
  type UserStatus,
} from "@/lib/mock-data"

const statusVariant: Record<UserStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "outline",
  blocked: "destructive",
  deactivated: "secondary",
}

function UserTable({
  rows,
  dateColumn,
}: {
  rows: MockUser[]
  dateColumn: "joinedAt" | "leftAt" | "lastActivity"
}) {
  const dateLabel =
    dateColumn === "joinedAt" ? "Joined" : dateColumn === "leftAt" ? "Left" : "Last activity"

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">{dateLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">@{u.username}</div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {u.email}
                </TableCell>
                <TableCell>{u.department}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[u.status]} className="capitalize">
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {u[dateColumn] ?? "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersView() {
  const [query, setQuery] = React.useState("")

  const filter = React.useCallback(
    (rows: MockUser[]) => {
      const q = query.trim().toLowerCase()
      if (!q) return rows
      return rows.filter((u) =>
        [u.name, u.username, u.email, u.department, u.role]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
    },
    [query]
  )

  const sortedJoiners = [...joiners].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
  const sortedLeavers = [...leavers].sort((a, b) =>
    (b.leftAt ?? "").localeCompare(a.leftAt ?? "")
  )

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {users.length} accounts. Joiners and leavers cover the last{" "}
            {USER_CHANGE_WINDOW_DAYS} days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">
                  All <Badge variant="secondary">{users.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="joiners">
                  Joiners <Badge variant="secondary">{joiners.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="leavers">
                  Leavers <Badge variant="secondary">{leavers.length}</Badge>
                </TabsTrigger>
              </TabsList>
              <div className="relative sm:w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, team..."
                  className="pl-8"
                  aria-label="Search users"
                />
              </div>
            </div>
            <TabsContent value="all">
              <UserTable rows={filter(users)} dateColumn="lastActivity" />
            </TabsContent>
            <TabsContent value="joiners">
              <UserTable rows={filter(sortedJoiners)} dateColumn="joinedAt" />
            </TabsContent>
            <TabsContent value="leavers">
              <UserTable rows={filter(sortedLeavers)} dateColumn="leftAt" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
