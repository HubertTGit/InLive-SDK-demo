'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createPeer, Peer, room } from './peer-connection';
import { useRoom } from './room.context';

type VideoPayload = {
  messages: string[];
};

const defaultValue: VideoPayload = {
  messages: [],
};

const VideoContext = createContext<VideoPayload>(defaultValue);

type VideoProviderProps = {
  children: ReactNode;
};

export const useVideo = () => {
  return useContext(VideoContext);
};

export const VideoProvider = ({ children }: VideoProviderProps) => {
  return (
    <VideoContext.Provider value={{ messages }}>
      {children}
    </VideoContext.Provider>
  );
};
