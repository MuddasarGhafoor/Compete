import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { AtSign, Flame, Search, UserRoundSearch, Users } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import {
  AddFriendButton,
  CancelRequestButton,
  CopyButton,
  RemoveFriendButton,
  RespondButtons,
} from "@/components/app/friend-actions";
import { PageHeader } from "@/components/app/page-header";
import { PersonAvatar } from "@/components/app/person-avatar";
import { PageSkeleton } from "@/components/app/require-session";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getViewer } from "@/lib/data/core";
import { getFriendships, getStandings, searchPeople } from "@/lib/data/social";
import { startOfWeek, timeAgo } from "@/lib/dates";
import { formatPercent, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Friends",
};

export default function FriendsPage(props: PageProps<"/friends">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FriendsContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function FriendsContent({ searchParams }: { searchParams: PageProps<"/friends">["searchParams"] }) {
  const viewer = await getViewer();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const [{ friends, incoming, outgoing }, standings, results] = await Promise.all([
    getFriendships(viewer.id),
    getStandings(viewer, startOfWeek(viewer.today)),
    query ? searchPeople(viewer.id, query) : Promise.resolve([]),
  ]);
  const statsById = new Map(standings.map((entry) => [entry.person.id, entry]));

  return (
    <div className="space-y-8">
      <PageHeader title="Friends" description="The people you compete with. Friend requests need both sides to accept." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Find people</CardTitle>
              <CardDescription>Search by username or name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form action="/friends" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    defaultValue={query}
                    placeholder="alex_runs"
                    aria-label="Search people"
                    className="h-10 pl-9"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" size="lg" className="h-10">
                  Search
                </Button>
              </Form>

              {query && (
                <div>
                  {query.replace(/^@/, "").length < 2 ? (
                    <p className="text-sm text-muted-foreground">Type at least 2 characters.</p>
                  ) : results.length === 0 ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserRoundSearch className="size-4" />
                      No one matches &ldquo;{query}&rdquo;.
                    </p>
                  ) : (
                    <ul className="divide-y rounded-lg border">
                      {results.map((person) => (
                        <li key={person.id} className="flex items-center gap-3 p-3">
                          <PersonAvatar name={person.name} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{person.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {person.username ? `@${person.username}` : "No username yet"}
                            </p>
                          </div>
                          {person.relation === "none" && <AddFriendButton userId={person.id} />}
                          {person.relation === "sent" && person.friendshipId && (
                            <CancelRequestButton friendshipId={person.friendshipId} />
                          )}
                          {person.relation === "received" && person.friendshipId && (
                            <RespondButtons friendshipId={person.friendshipId} />
                          )}
                          {person.relation === "friends" && <Badge variant="secondary">Friends</Badge>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friends list */}
          <section>
            <h2 className="mb-3 text-base font-semibold">
              Your friends <span className="font-normal text-muted-foreground">· {friends.length}</span>
            </h2>
            {friends.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No friends yet"
                description="Search for someone above, or share your username so they can find you."
              />
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {friends.map((friend) => {
                  const stats = statsById.get(friend.id);
                  return (
                    <li key={friend.id} className="flex items-center gap-3 p-4 sm:px-5">
                      <PersonAvatar name={friend.name} />
                      <Link
                        href={friend.username ? `/friends/${friend.username}` : "/friends"}
                        className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <p className="truncate font-medium hover:underline">{friend.name}</p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="truncate">{friend.username ? `@${friend.username}` : "No username yet"}</span>
                          <span className="tabular-nums">{formatPercent(stats?.score)} this week</span>
                          <span className="flex items-center gap-1 tabular-nums">
                            <Flame className="size-3 text-warm" />
                            {plural(stats?.streak ?? 0, "day")}
                          </span>
                        </p>
                      </Link>
                      <RemoveFriendButton friendshipId={friend.friendshipId} name={friend.name} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* Your username */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Your username</CardTitle>
              <CardDescription>Share it so friends can find you.</CardDescription>
            </CardHeader>
            <CardContent>
              {viewer.username ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
                  <span className="flex items-center gap-1 font-medium">
                    <AtSign className="size-4 text-muted-foreground" />
                    {viewer.username}
                  </span>
                  <CopyButton value={`@${viewer.username}`} />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">You don&apos;t have a username yet. People can still find you by name.</p>
                  <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Choose a username
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requests */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">
                Requests {incoming.length > 0 && <Badge className="ml-1">{incoming.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incoming.length === 0 && outgoing.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              )}
              {incoming.map((request) => (
                <div key={request.id} className="flex items-center gap-3">
                  <PersonAvatar name={request.person.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{request.person.name}</p>
                    <p className="text-xs text-muted-foreground">Wants to be friends · {timeAgo(request.createdAt)}</p>
                  </div>
                  <RespondButtons friendshipId={request.id} />
                </div>
              ))}
              {outgoing.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Sent · {plural(outgoing.length, "request")}</p>
                  {outgoing.map((request) => (
                    <div key={request.id} className="flex items-center gap-3">
                      <PersonAvatar name={request.person.name} size="sm" />
                      <p className="min-w-0 flex-1 truncate text-sm">{request.person.name}</p>
                      <CancelRequestButton friendshipId={request.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
