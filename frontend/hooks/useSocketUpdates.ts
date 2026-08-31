"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketCallbacks {
    onScheduleUpdated?: (data: any) => void;
    onScheduleCreated?: (data: any) => void;
    onFollowUpUpdated?: (data: any) => void;
    onFollowUpViewed?: (data: any) => void;
    onFollowUpFeedback?: (data: any) => void;
    onFollowUpCompleted?: (data: any) => void;
    onTranscriptionProgress?: (data: any) => void;
    onRatingCreated?: (data: any) => void;
}

export function useSocketUpdates(callbacks: SocketCallbacks = {}) {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
                          process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ||
                          'http://localhost:5000';

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        if (callbacks.onScheduleUpdated) socket.on('schedule:updated', callbacks.onScheduleUpdated);
        if (callbacks.onScheduleCreated) socket.on('schedule:created', callbacks.onScheduleCreated);
        if (callbacks.onFollowUpUpdated) socket.on('followup:updated', callbacks.onFollowUpUpdated);
        if (callbacks.onFollowUpViewed) socket.on('followup:viewed', callbacks.onFollowUpViewed);
        if (callbacks.onFollowUpFeedback) socket.on('followup:feedback', callbacks.onFollowUpFeedback);
        if (callbacks.onFollowUpCompleted) socket.on('followup:completed', callbacks.onFollowUpCompleted);
        if (callbacks.onTranscriptionProgress) socket.on('transcription:progress', callbacks.onTranscriptionProgress);
        if (callbacks.onRatingCreated) socket.on('rating:created', callbacks.onRatingCreated);

        return () => {
            socket.disconnect();
        };
    }, []);

    return socketRef;
}
