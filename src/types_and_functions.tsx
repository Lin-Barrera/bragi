export type Song = {
  id: string;
  path: string;   // path to the mp3 file, relative to the songs/ folder
  name: string;
  artist: string;
};

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
};

export function getCssVariable(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}