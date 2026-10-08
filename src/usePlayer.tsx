import { useEffect, useRef, useState } from 'react';
import { readFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getBragiDir } from './storage';
import type { Playlist, Song } from './types_and_functions';

// One audio element for the whole app, created once at module level.
const audio = new Audio();

type Queue = {
  base: string[];    // song ids in the playlist's own order (snapshot)
  order: string[];   // the order actually being played: same as base, or a shuffled copy
  position: number;  // index into `order` of the current song
};

const EMPTY_QUEUE: Queue = { base: [], order: [], position: 0 };

// Fisher–Yates shuffle; `firstId` (the current song) is pinned to the front
function shuffled(ids: string[], firstId: string | null): string[] {
  const rest = ids.filter(id => id !== firstId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return firstId ? [firstId, ...rest] : rest;
}

function usePlayer(songs: Song[]) {
  const [queue, setQueue] = useState<Queue>(EMPTY_QUEUE);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(false);  
  const currentId: string | undefined = queue.order[queue.position];
  const currentSong = songs.find(s => s.id === currentId) ?? null;
  const [isPlaying, setIsPlaying] = useState(false);

  const objectUrlRef = useRef<string | null>(null);
  const loadIdRef = useRef(0);

  // keep React state in sync with what the audio element is really doing
  useEffect(() => {
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  async function loadAndPlay(song: Song) {
    const myLoadId = ++loadIdRef.current;
    try {
      const bragiDir = await getBragiDir();
      const filePath = await join(bragiDir, 'songs', song.path);
      const bytes = await readFile(filePath);
  
      if (myLoadId !== loadIdRef.current) return; // a newer request replaced this one
  
      const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
  
      audio.src = url;
      await audio.play();
    } catch (err) {
      console.error('could not play song:', err);
    }
  }

  function playSong(song: Song, playlist: Playlist) {
    const base = [...playlist.songIds];
    const order = shuffle ? shuffled(base, song.id) : base;
    const position = shuffle ? 0 : base.indexOf(song.id);
    setQueue({ base, order, position });
    loadAndPlay(song);
  }

  function step(direction: 1 | -1) {
    const { order, position } = queue;
    const n = order.length;
    if (n === 0) return;
  
    // walk in that direction, skipping ids whose Song no longer exists
    for (let i = 1; i <= n; i++) {
      const pos = (((position + direction * i) % n) + n) % n;
      const song = songs.find(s => s.id === order[pos]);
      if (song) {
        setQueue(q => ({ ...q, position: pos }));
        loadAndPlay(song);
        return;
      }
    }
    stop(); // nothing playable left
  }
  
  function previous() {
    // like most players: restart the song if it's already well underway
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    step(-1);
  }

  function stop() {
    loadIdRef.current++; // cancels any load still in flight
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setQueue(EMPTY_QUEUE);
  }

  function toggleShuffle() {
    const turningOn = !shuffle;
    setShuffle(turningOn);
    setQueue(q => {
      const id = q.order[q.position] ?? null;
      if (turningOn) {
        return { ...q, order: shuffled(q.base, id), position: 0 };
      }
      // back to playlist order, continuing from where the current song sits in it
      return { ...q, order: q.base, position: Math.max(0, q.base.indexOf(id ?? '')) };
    });
  }

  function togglePlay() {
    if (!audio.src) return; // nothing loaded yet
    if (audio.paused) audio.play();
    else audio.pause();
  }

  // the audio element loops a single song natively (and then never fires 'ended')
  useEffect(() => {
    audio.loop = loop;
  }, [loop]);
  
  // auto-advance when a song ends. `step` is recreated every render and reads
  // the current queue, so the listener (registered once) calls the latest one via a ref
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    const onEnded = () => stepRef.current(1);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, []);
  
  // the playing song's record was deleted: stop instead of playing a ghost
  useEffect(() => {
    if (currentId && !songs.some(s => s.id === currentId)) stop();
  }, [songs, currentId]);

  return {
    currentSong,
    isPlaying,
    loop,
    shuffle,
    playSong,
    togglePlay,
    next: () => step(1),
    previous,
    toggleLoop: () => setLoop(l => !l),
    toggleShuffle,
  };
}

type Player = ReturnType<typeof usePlayer>;

export { usePlayer };
export type { Player };