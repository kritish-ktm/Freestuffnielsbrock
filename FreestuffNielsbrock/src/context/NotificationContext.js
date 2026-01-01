// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestUpdates, setRequestUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications for item owners (people interested in MY items)
  const fetchIncomingRequests = async () => {
    if (!user) return;

    try {
      // Get items posted by current user
      const { data: userItems, error: itemsError } = await supabase
        .from("items")
        .select("id, name, image")
        .eq("posted_by", user.id);

      if (itemsError) throw itemsError;

      if (!userItems || userItems.length === 0) {
        setIncomingRequests([]);
        return;
      }

      const itemIds = userItems.map(item => item.id);

      // Get unread requests for those items
      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .in("item_id", itemIds)
        .eq("read_by_poster", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (requestsError) throw requestsError;

      // Enrich with item info
      const enriched = requests.map(req => {
        const item = userItems.find(i => i.id === req.item_id);
        return {
          ...req,
          item_name: item?.name,
          item_image: item?.image
        };
      });

      setIncomingRequests(enriched);
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
    }
  };

  // Fetch notifications for requesters (updates on items I'm interested in)
  const fetchRequestUpdates = async () => {
    if (!user) return;

    try {
      // Get requests made by current user with status changes
      const { data: requests, error: requestsError } = await supabase
        .from("requests")
        .select(`
          *,
          items (
            id,
            name,
            image
          )
        `)
        .eq("requester_id", user.id)
        .eq("read_by_requester", false)
        .in("status", ["approved", "rejected"])
        .order("last_status_change", { ascending: false })
        .limit(5);

      if (requestsError) throw requestsError;

      setRequestUpdates(requests || []);
    } catch (error) {
      console.error("Error fetching request updates:", error);
    }
  };

  // Mark incoming requests as read (for posters)
  const markIncomingAsRead = async (requestId) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ read_by_poster: true })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all incoming requests as read
  const markAllIncomingAsRead = async () => {
    if (!user || incomingRequests.length === 0) return;

    try {
      // Get all item IDs owned by user
      const { data: userItems } = await supabase
        .from("items")
        .select("id")
        .eq("posted_by", user.id);

      if (!userItems) return;

      const itemIds = userItems.map(item => item.id);

      // Mark all unread requests for user's items as read
      const { error } = await supabase
        .from("requests")
        .update({ read_by_poster: true })
        .in("item_id", itemIds)
        .eq("read_by_poster", false);

      if (error) throw error;

      setIncomingRequests([]);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Mark request updates as read (for requesters)
  const markUpdateAsRead = async (requestId) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ read_by_requester: true })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setRequestUpdates(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error marking update as read:", error);
    }
  };

  // Mark all updates as read
  const markAllUpdatesAsRead = async () => {
    if (!user || requestUpdates.length === 0) return;

    try {
      const { error } = await supabase
        .from("requests")
        .update({ read_by_requester: true })
        .eq("requester_id", user.id)
        .eq("read_by_requester", false);

      if (error) throw error;

      setRequestUpdates([]);
    } catch (error) {
      console.error("Error marking all updates as read:", error);
    }
  };

  // Refresh all notifications
  const refreshNotifications = async () => {
    setLoading(true);
    await Promise.all([
      fetchIncomingRequests(),
      fetchRequestUpdates()
    ]);
    setLoading(false);
  };

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshNotifications();

      // Refresh every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setIncomingRequests([]);
      setRequestUpdates([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    incomingRequests,
    requestUpdates,
    incomingCount: incomingRequests.length,
    updatesCount: requestUpdates.length,
    loading,
    refreshNotifications,
    markIncomingAsRead,
    markAllIncomingAsRead,
    markUpdateAsRead,
    markAllUpdatesAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}