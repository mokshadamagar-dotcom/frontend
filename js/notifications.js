/**
 * KrishiMitra AI – notifications.js
 * Frontend client for WebSockets real-time notifications.
 * Connects to the backend and routes live alerts.
 */

'use strict';

(function () {
  let ws = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  function getNotificationUser() {
    const keys = ['km_user_data', 'km_user'];
    for (const key of keys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  }

  function connectWebSocket() {
    const user = getNotificationUser();
    const userId = user ? (user.id || user.user_id || user.email || 'mock_farmer_123') : 'mock_farmer_123';
    const district = user ? (user.district || '') : '';
    const taluka = user ? (user.taluka || '') : '';
    const village = user ? (user.village || '') : '';

    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'localhost:8000'
      : 'krishimitra-backend.onrender.com';

    const wsUrl = `${wsProto}//${wsHost}/api/v1/notifications/ws?user_id=${encodeURIComponent(userId)}&district=${encodeURIComponent(district)}&taluka=${encodeURIComponent(taluka)}&village=${encodeURIComponent(village)}`;

    console.log(`[KrishiMitra WS] Connecting to ${wsUrl}`);
    ws = new WebSocket(wsUrl);

    ws.onopen = function () {
      console.log('[KrishiMitra WS] Connected to notification server.');
      reconnectAttempts = 0;
    };

    ws.onmessage = function (event) {
      try {
        const notif = JSON.parse(event.data);
        console.log('[KrishiMitra WS] New notification received:', notif);
        handleIncomingNotification(notif);
      } catch (err) {
        console.error('[KrishiMitra WS] Failed to parse socket message:', err);
      }
    };

    ws.onclose = function () {
      console.warn('[KrishiMitra WS] Connection closed.');
      attemptReconnect();
    };

    ws.onerror = function (err) {
      console.error('[KrishiMitra WS] Socket error:', err);
      ws.close();
    };
  }

  function attemptReconnect() {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      console.log(`[KrishiMitra WS] Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms...`);
      setTimeout(connectWebSocket, delay);
    } else {
      console.error('[KrishiMitra WS] Max connection retries reached. Real-time notifications disabled.');
    }
  }

  function handleIncomingNotification(newNotif) {
    // 1. Load existing notifications from localStorage
    const storedKey = 'km_notifications_v2';
    const stored = localStorage.getItem(storedKey);
    let list = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [];
      }
    }

    // Add unique ID if missing
    if (!newNotif.id) {
      newNotif.id = 'ws_' + Date.now();
    }

    // 2. Add to top of list
    list.unshift(newNotif);
    localStorage.setItem(storedKey, JSON.stringify(list));

    // 3. Trigger UI feedback: Display real-time toast alert
    if (typeof window.showToast === 'function') {
      window.showToast(newNotif.text, 'info', newNotif.title, 7000);
    } else {
      alert(`${newNotif.title}\n${newNotif.text}`);
    }

    // 4. Update Navbar bell badge
    if (typeof window.updateNavbarNotifBadge === 'function') {
      window.updateNavbarNotifBadge();
    }

    // 5. If notifications page is currently open, refresh notifications view immediately
    if (
      window.location.pathname.includes('notifications.html') &&
      typeof window.loadNotifications === 'function' &&
      typeof window.renderNotifications === 'function'
    ) {
      window.loadNotifications();
      window.renderNotifications();
    }
  }

  // Initialize socket connection on script load
  if (window.WebSocket) {
    connectWebSocket();
  } else {
    console.warn('[KrishiMitra WS] WebSockets are not supported by this browser.');
  }

  // Expose triggers for manual reconnects
  window.KM_WS_Notifications = {
    reconnect: function () {
      if (ws) ws.close();
      reconnectAttempts = 0;
      connectWebSocket();
    }
  };
})();
