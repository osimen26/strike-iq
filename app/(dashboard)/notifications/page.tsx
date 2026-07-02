"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
    case "KICKOFF":          return { icon: "⏰", bg: "bg-orange-500/20",                 text: "text-orange-400" };
    default:                 return { icon: "ℹ️", bg: "bg-gray-500/20",                   text: "text-gray-400" };
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

  const fetchNotifications = async () => {
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Notifications</h1>
          <p className="text-[var(--color-accent-mutedSage)] mt-1 text-sm">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}.` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="text-sm text-[var(--color-brand-mint)] hover:underline disabled:opacity-50 transition-opacity"
          >
            {marking ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-3 mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-white/10 border-t-[var(--color-brand-emerald)] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm animate-pulse">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-[var(--color-background-surface)] rounded-2xl border border-dashed border-white/10 flex flex-col items-center">
            <span className="text-5xl mb-4 opacity-40">🔔</span>
            <h3 className="text-white font-bold text-lg font-heading mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">When new Pro Picks drop, you'll be the first to know!</p>
          </div>
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
                className={`block p-4 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? "bg-black/20 border-white/5 opacity-60 hover:opacity-80"
                    : "bg-[var(--color-background-surface)] border-[var(--color-brand-emerald)]/30 hover:border-[var(--color-brand-emerald)]/60 shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`shrink-0 w-10 h-10 rounded-xl ${bg} ${text} flex items-center justify-center text-lg`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm leading-snug ${n.isRead ? "text-gray-300" : "text-white"}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-500 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${n.isRead ? "text-gray-500" : "text-gray-400"}`}>
                      {n.message}
                    </p>
                    {n.link && !n.isRead && (
                      <span className="inline-block mt-2 text-xs font-semibold text-[var(--color-brand-mint)] hover:underline">
                        View now →
                      </span>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-[var(--color-brand-mint)] mt-1.5 animate-pulse"></div>
                  )}
                </div>
              </Wrapper>
            );
          })
        )}
      </div>
    </div>
  );
}
