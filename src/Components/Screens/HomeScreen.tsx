// HomeScreen.tsx
import "./HomeScreen.css";
import { useEffect, useState } from "react";
import { PlaylistListItem } from "../Playlist_List_Item";
import { CursorList } from "../CursorList";
import type { Playlist, Song } from '../../types_and_functions';
import { open } from '@tauri-apps/plugin-dialog';
import { copyFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { getBragiDir } from '../../storage';

type FocusColumn = "playlists" | "songs";

function SongListItem({ song, selected }: { song: Song; selected: boolean }) {
  return (
    <div>
      <div style={{ color: selected ? "var(--primary-accent-color)" : "white" }}>
        {song.name}
      </div>
      <div style={{ color: "grey"}}>
        {song.artist}
        </div>
    </div>
    
  );
}

function HomeScreen({
  playlists,
  playlistIndex,
  onPlaylistIndexChange,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onMovePlaylist,
  songs,
  songIndex,
  onSongIndexChange,
  onSwitchToSettingsScreen,
  onAddSongs,
}: {
  playlists: Playlist[];
  playlistIndex: number;
  onPlaylistIndexChange: (index: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
  onRenamePlaylist: (playlist: Playlist, newName: string) => void;
  onMovePlaylist: (playlist: Playlist, direction: "up" | "down") => void;
  songs: Song[];
  songIndex: number;
  onSongIndexChange: (index: number) => void;
  onSwitchToSettingsScreen: () => void;
  onAddSongs: (newSongs: Song[], targetPlaylist: Playlist) => void;
}) {

  const [focusedColumn, setFocusedColumn] = useState<FocusColumn>("playlists");
  const [playlistsMode, setPlaylistsMode] = useState<"idle" | "creating" | "renaming">("idle");
  const [songsMode, setSongsMode] = useState<"idle" | "creating" | "renaming">("idle");

  const [viewedPlaylistId, setViewedPlaylistId] = useState<string | null>(null);

  const viewedPlaylist = playlists.find(p => p.id === viewedPlaylistId) ?? null;

  const isTyping = playlistsMode !== "idle" || songsMode !== "idle";

  const viewedSongs: Song[] = viewedPlaylist
    ? viewedPlaylist.songIds
        .map(id => songs.find(s => s.id === id))
        .filter((s): s is Song => s !== undefined)
    : [];

  useEffect(() => {
    if (viewedPlaylistId && !playlists.some(p => p.id === viewedPlaylistId)) {
      setViewedPlaylistId(null);
    }
  }, [playlists, viewedPlaylistId]);

  function activatePlaylist(playlist: Playlist) {
    setViewedPlaylistId(playlist.id);
    onSongIndexChange(0);
    setFocusedColumn("songs");
}

  async function importSongs() {
    if (!viewedPlaylist) return;

    const selected = await open({
      multiple: true,
      filters: [{ name: 'Audio', extensions: ['mp3'] }],
    });

    if (!selected) return; // user cancelled
    const paths = Array.isArray(selected) ? selected : [selected];

    const newSongs: Song[] = [];
    for (const sourcePath of paths) {
      const id = crypto.randomUUID();
      const bragiDir = await getBragiDir();
      const destPath = await join(bragiDir, 'songs', `${id}.mp3`);
      await copyFile(sourcePath, destPath);

      const fileName = sourcePath.split(/[\\/]/).pop() ?? 'Unknown';
      newSongs.push({
        id,
        path: `${id}.mp3`,
        name: fileName.replace(/\.mp3$/i, ''),
        artist: 'Unknown Artist',
      });
    }

    onAddSongs(newSongs, viewedPlaylist);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTyping) return;

      if (event.code === "ArrowRight" && viewedPlaylist) {
        setFocusedColumn(prev => (prev === "playlists" ? "songs" : prev));
      } else if (event.code === "ArrowLeft") {
        setFocusedColumn(prev => (prev === "songs" ? "playlists" : prev));
      } else if (event.key === "s") {
        onSwitchToSettingsScreen();
      } else if (event.key === "a" && viewedPlaylist){
        importSongs();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, viewedPlaylist, onSwitchToSettingsScreen]);

  return (
    <div className="home_screen_container">
      <div className="bragi_title">Bragi</div>

      <div className="horizontal_panels">
        <div className="panel">
          <CursorList
            className="playlist_list"
            items={playlists}
            keyExtractor={(p) => p.id}
            renderItem={(p, isSelected) => <PlaylistListItem playlist={p} selected={isSelected} />}
            selectedIndex={playlistIndex}
            onSelectedIndexChange={onPlaylistIndexChange}
            onCreate={onCreatePlaylist}
            onDelete={onDeletePlaylist}
            onRename={onRenamePlaylist}
            onReorder={onMovePlaylist}
            onModeChange={setPlaylistsMode}
            onActivate={activatePlaylist}
            enabled={focusedColumn === "playlists"}
          />

          <div className="keybinds_footer">
            <div className="keybind_label">↓↑: navigate</div>
            <div className="keybind_label">←→: switch column</div>
            <div className="keybind_label">Enter: open playlist</div>
            <div className="keybind_label">Shift + ↓↑: move playlists</div>
            <div className="keybind_label">n: create playlist</div>
            <div className="keybind_label">r: rename playlist</div>
            <div className="keybind_label">x: delete playlist</div>
            <div className="keybind_label">f: open song directory</div>
            <div className="keybind_label">s: settings</div>
          </div>
        </div>

        <div className="panel">
          {!viewedPlaylist ? (
            <div className="panel_placeholder">Select a playlist and press Enter</div>
          ) : viewedSongs.length === 0 ? (
            <div className="panel_placeholder">No songs found</div>
          ) : (
            <CursorList
              className="playlist_list"
              items={viewedSongs}
              keyExtractor={(s) => s.id}
              renderItem={(s, isSelected) => <SongListItem song={s} selected={isSelected} />}
              selectedIndex={songIndex}
              onSelectedIndexChange={onSongIndexChange}
              onModeChange={setSongsMode}
              enabled={focusedColumn === "songs"}
            />
          )}


          {viewedPlaylist && (
            <div className="keybinds_footer">
              <div className="keybind_label">a: add song</div>
              <div className="keybind_label">r: rename song</div>
              <div className="keybind_label">x: delete song</div>
              <div className="keybind_label">c: add song to other playlist</div>
            </div>
          )}
        </div>

        <div className="panel main_player">

        </div>
      </div>
    </div>
  );
}

export { HomeScreen };