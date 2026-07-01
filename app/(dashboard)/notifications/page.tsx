import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Notifications</h1>
          <p className="text-[var(--color-accent-mutedSage)] mt-1">
            You have {unreadCount} unread alerts.
          </p>
        </div>
        <button className="text-sm text-[var(--color-brand-mint)] hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3 mt-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-[var(--color-background-surface)] rounded-xl border border-white/5">
            You're all caught up! No notifications.
          </div>
        ) : (
          notifications.map((notification) => {
            const Wrapper: any = notification.link ? Link : 'div';
            const wrapperProps = notification.link ? { href: notification.link } : {};

            return (
              <Wrapper 
                key={notification.id} 
                {...wrapperProps}
                className={`block p-4 rounded-xl border transition-colors ${
                  notification.isRead 
                    ? "bg-black/30 border-white/5" 
                    : "bg-[var(--color-background-surface)] border-[var(--color-brand-emerald)]/30 hover:border-[var(--color-brand-emerald)]/60"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    notification.type === 'PREDICTION_ALERT' ? 'bg-[var(--color-brand-emerald)]/20 text-[var(--color-brand-mint)]' :
                    notification.type === 'PAYMENT' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {notification.type === 'PREDICTION_ALERT' ? '🎯' : notification.type === 'PAYMENT' ? '💳' : 'ℹ️'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-mint)] mt-2"></div>
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
