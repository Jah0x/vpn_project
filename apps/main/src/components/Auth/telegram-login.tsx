import { useEffect } from "react";

export default function TelegramLogin() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData || "" }),
    }).then(() => tg.close());
  }, []);

  return <div>Telegram login...</div>;
}
