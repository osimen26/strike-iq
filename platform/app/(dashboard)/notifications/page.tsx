"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getIcon(type: string) {
  switch (type) {
    case "PREDICTION_ALERT": return { icon: "👑", bg: "bg-[var(--color-brand-emerald)]/20", text: "text-[var(--color-brand-mint)]" };
    case "PAYMENT":          return { icon: "💳", bg: "bg-blue-500/20",                   text: "text-blue-400" };
    case "SYSTEM":           return { icon: "🚀", bg: "bg-purple-500/20",                 text: "text-purple-400" };
    case "RESULT":           return { icon: "✅", bg: "bg-green-500/20",                  text: "text-green-400" };
    case "KICKOFF":          return { icon: "⏰", bg: "bg-amber-500/20",                 text: "text-amber-400" };
    default:                 return { icon: "ℹ️", bg: "bg-zinc-500/20",                   text: "text-zinc-400" };
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark as read", err);
    } finally {
      setMarking(false);
    }
  };

  const markOneRead = async (id: string) => {
    // Optimistically update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await supabase.from("notifications").update({ isRead: true }).eq("id", id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Notifications</h1>
          <p className="text-zinc-400 mt-1 text-sm font-mono">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}.` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="link"
            onClick={markAllRead}
            disabled={marking}
            className="text-sm text-primary-400 font-bold h-auto p-0"
          >
            {marking ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-3 mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-zinc-800" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-[var(--color-background-surface)] border-dashed border-white/10">
            <CardContent className="text-center py-16 flex flex-col items-center p-6">
              <span className="text-5xl mb-4 opacity-40">🔔</span>
              <h3 className="text-white font-bold text-lg font-heading mb-1">No notifications yet</h3>
              <p className="text-zinc-500 text-sm">When new Pro Picks drop, you'll be the first to know!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n) => {
            const { icon, bg, text } = getIcon(n.type);
            const Wrapper: any = n.link ? Link : "div";
            const wrapperProps = n.link ? { href: n.link } : {};

            return (
              <Wrapper
                key={n.id}
                {...wrapperProps}
                onClick={() => !n.isRead && markOneRead(n.id)}
                className={`block transition-all cursor-pointer ${
                  n.isRead
                    ? "opacity-60 hover:opacity-80"
                    : "shadow-lg"
                }`}
              >
                <Card className={`${
                  n.isRead 
                    ? "bg-black/20 border-white/5" 
                    : "bg-[var(--color-background-surface)] border-primary-600/30 hover:border-primary-600/60"
                }`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl ${bg} ${text} flex items-center justify-center text-lg`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm leading-snug ${n.isRead ? "text-zinc-300" : "text-white"}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-zinc-500 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className={`text-sm mt-1 leading-relaxed ${n.isRead ? "text-zinc-500" : "text-zinc-400"}`}>
                        {n.message}
                      </p>
                      {n.link && !n.isRead && (
                        <span className="inline-block mt-2 text-xs font-semibold text-primary-400 hover:underline">
                          View now →
                        </span>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-primary-400 mt-1.5 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                    )}
                  </CardContent>
                </Card>
              </Wrapper>
            );
          })
        )}
      </div>
    </div>
  );
}
