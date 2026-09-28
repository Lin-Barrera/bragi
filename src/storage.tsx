import { readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { homeDir, join } from '@tauri-apps/api/path';
import type { Playlist, Song } from './types_and_functions';

async function getBragiDir() {
  const home = await homeDir();
  return join(home, 'Bragi');
}

async function ensureBragiFolders() {
  const bragiDir = await getBragiDir();
  const songsDir = await join(bragiDir, 'songs');

  if (!(await exists(bragiDir))) {
    await mkdir(bragiDir, { recursive: true });
  }
  if (!(await exists(songsDir))) {
    await mkdir(songsDir, { recursive: true });
  }
}

async function loadPlaylists(): Promise<Playlist[]> {
  const bragiDir = await getBragiDir();
  const filePath = await join(bragiDir, 'playlists.json');

  if (!(await exists(filePath))) {
    return [];
  }
  const content = await readTextFile(filePath);
  return JSON.parse(content);
}

async function savePlaylists(playlists: Playlist[]): Promise<void> {
  const bragiDir = await getBragiDir();
  const filePath = await join(bragiDir, 'playlists.json');
  await writeTextFile(filePath, JSON.stringify(playlists, null, 2));
}

async function loadSongs(): Promise<Song[]> {
  const bragiDir = await getBragiDir();
  const filePath = await join(bragiDir, 'songs.json');

  if (!(await exists(filePath))) {
    return [];
  }
  const content = await readTextFile(filePath);
  return JSON.parse(content);
}

async function saveSongs(songs: Song[]): Promise<void> {
  const bragiDir = await getBragiDir();
  const filePath = await join(bragiDir, 'songs.json');
  await writeTextFile(filePath, JSON.stringify(songs, null, 2));
}

export { ensureBragiFolders, loadPlaylists, savePlaylists, loadSongs, saveSongs, getBragiDir };