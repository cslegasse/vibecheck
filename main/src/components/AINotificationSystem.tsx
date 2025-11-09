"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, AlertTriangle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AINotification {
  id: string;
  type: "recommendation" | "alert" | "insight" | "success";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
  actionable?: boolean;
}

interface AINotificationSystemProps {
  notifications: AINotification[];
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
}

export default function AINotificationSystem({
  notifications,
  onDismiss,
  onAction,
}: AINotificationSystemProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    // Stagger notification appearance
    notifications.forEach((notif, index) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, notif.id]);
      }, index * 300);
    });
  }, [notifications]);

  const getIcon = (type: AINotification["type"]) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5" />;
      case "insight":
        return <TrendingUp className="h-5 w-5" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getColor = (type: AINotification["type"], priority: AINotification["priority"]) => {
    if (type === "alert") {
      return priority === "high"
        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    }
    if (type === "success") {
      return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    }
    if (type === "recommendation") {
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
    return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
  };

  const getIconColor = (type: AINotification["type"]) => {
    switch (type) {
      case "recommendation":
        return "text-blue-600";
      case "alert":
        return "text-red-600";
      case "insight":
        return "text-purple-600";
      case "success":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence>
        {notifications
          .filter((notif) => visible.includes(notif.id))
          .map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className={`p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm ${getColor(
                notification.type,
                notification.priority
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <Badge
                        variant={
                          notification.priority === "high"
                            ? "destructive"
                            : notification.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={() => onDismiss(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                    {notification.actionable && onAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => onAction(notification.id)}
                      >
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to manage AI notifications
export function useAINotifications() {
  const [notifications, setNotifications] = useState<AINotification[]>([]);

  const addNotification = (
    notification: Omit<AINotification, "id" | "timestamp">
  ) => {
    const newNotification: AINotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss low priority notifications after 10 seconds
    if (notification.priority === "low") {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 10000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}
