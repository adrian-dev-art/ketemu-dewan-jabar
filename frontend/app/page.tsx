"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-4 bg-gray-50 dark:bg-zinc-900">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
          Gabung Pertemuan
        </h2>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              ID Ruangan
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
              placeholder="Masukkan ID Ruangan"
              aria-required="true"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            Masuk Ruangan
          </button>
        </form>
      </div>
    </div>
  );
}