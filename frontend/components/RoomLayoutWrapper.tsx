"use client";

import { usePathname } from "next/navigation";

export default function RoomLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoomPage = pathname?.startsWith("/room");

  if (isRoomPage) return null;
  return <>{children}</>;
}
