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
import type { Player } from '../../usePlayer';
import { ProgressBar } from "../ProgressBar";
import { Visualizer } from "../Visualizer";

type FocusColumn = "playlists" | "songs" | "player";

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

function PlayerButton({ label, onClick, active = false }: {
    label: string;
    onClick: () => void;
    active?: boolean;
  }) {
    return (
      <button
        className="app_button"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        style={{ color: active ? "var(--primary-accent-color)" : "var(--text-color)" }}
      >
        {label}
      </button>
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
  onRenameSong,
  onRemoveSong,
  onMoveSong,
  onCopySong,
  player,
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
  onRenameSong: (song: Song, newName: string) => void;
  onRemoveSong: (song: Song, playlist: Playlist) => void;
  onMoveSong: (song: Song, playlist: Playlist, direction: "up" | "down") => void;
  onCopySong: (song: Song, targetPlaylist: Playlist) => void;
  player: Player;
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
  const [copyingSong, setCopyingSong] = useState<Song | null>(null);
  const [copyTargetIndex, setCopyTargetIndex] = useState(0);
  const selectedSong: Song | undefined = viewedSongs[songIndex];
  const otherPlaylists = playlists.filter(p => p.id !== viewedPlaylistId);

  useEffect(() => {
    if (viewedPlaylistId && !playlists.some(p => p.id === viewedPlaylistId)) {
      setViewedPlaylistId(null);
    }
  }, [playlists, viewedPlaylistId]);

  useEffect(() => {
    if (songIndex > 0 && songIndex >= viewedSongs.length) {
      onSongIndexChange(Math.max(0, viewedSongs.length - 1));
    }
  }, [viewedSongs.length]);

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
      if (copyingSong) {
        if (event.key === "Escape") setCopyingSong(null);
        return;
      }
      if (isTyping) return;

      if (event.code === "ArrowRight" && viewedPlaylist) {
        setFocusedColumn(prev => (prev === "playlists" ? "songs" : prev === "songs" ? "player" : prev));
      } else if (event.code === "ArrowLeft") {
        setFocusedColumn(prev => (prev === "player" ? "songs" : prev === "songs" ? "playlists" : prev));
      } else if (event.key === "s") {
        onSwitchToSettingsScreen();
      } else if (event.key === "a" && viewedPlaylist){
        importSongs();
      } else if (event.key === "c" && focusedColumn === "songs" && selectedSong && otherPlaylists.length > 0) {
        setCopyTargetIndex(0);
        setCopyingSong(selectedSong);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTyping, viewedPlaylist, onSwitchToSettingsScreen, copyingSong, focusedColumn, selectedSong, otherPlaylists.length]);

  return (
    <div className="home_screen_container">
      <div className="bragi_title">Bragi</div>

      <div className="horizontal_panels">
        <div className="panel" style={{borderTop: focusedColumn==="playlists" ? "0.2rem solid var(--primary-accent-color)" : "0.2rem solid transparent"}}>
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

        {viewedPlaylistId && (<div className="panel song_panel" style={{borderTop: focusedColumn==="songs" ? "0.2rem solid var(--primary-accent-color)" : "0.2rem solid transparent"}}>
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
              enabled={focusedColumn === "songs" && !copyingSong}
              onRename={onRenameSong}
              onDelete={(song) => onRemoveSong(song, viewedPlaylist)}
              onReorder={(song, direction) => onMoveSong(song, viewedPlaylist, direction)}
              onActivate={(song) => player.playSong(song, viewedPlaylist)}
            />
          )}


          {viewedPlaylist && (
            <div className="keybinds_footer">
              <div className="keybind_label">a: add song</div>
              <div className="keybind_label">r: rename song</div>
              <div className="keybind_label">x: delete song</div>
              <div className="keybind_label">c: add song to other playlist</div>
              <div className="keybind_label">Shift + ↓↑: move songs</div>
            </div>
          )}
        </div>)}

        <div className="panel main_player" style={{borderTop: focusedColumn==="player" ? "0.2rem solid var(--primary-accent-color)" : "0.2rem solid transparent"}}>
          <Visualizer />
          
          <div>
            <div className="now_playing">
              {player.currentSong ? (
                <>
                  <div className="player_song_name">{player.currentSong.name}</div>
                  <div className="player_artist_name">{player.currentSong.artist}</div>
                </>
              ) : (
                <div style={{ color: "grey" }}>Nothing playing</div>
              )}
            </div>

            <ProgressBar/>

            <div className="player_controls">
              <PlayerButton label="Prev" onClick={player.previous} />
              <PlayerButton label="-10s" onClick={() => player.seekBy(-10)} />
              <PlayerButton label={player.isPlaying ? "Pause" : "Play"} onClick={player.togglePlay} />
              <PlayerButton label="+10s" onClick={() => player.seekBy(10)} />
              <PlayerButton label="Next" onClick={player.next} />
              <PlayerButton label="Loop" active={player.loop} onClick={player.toggleLoop} />
              <PlayerButton label="Shuffle" active={player.shuffle} onClick={player.toggleShuffle} />
            </div>
          </div>

          

          <div className="keybinds_footer" style={{ marginTop: "auto" }}>
            <div className="keybind_label">Space: play / pause</div>
            <div className="keybind_label">j / l: back / forward 10s</div>
            <div className="keybind_label">Shift + N / P: next / previous</div>
            <div className="keybind_label">o: loop song</div>
            <div className="keybind_label">z: shuffle</div>
          </div>
        </div>
      </div>

      {copyingSong && (
        <div className="copy_picker_overlay">
          <div className="copy_picker">
            <div className="copy_picker_title">Add {copyingSong.name} to:</div>
            <CursorList
              className="playlist_list"
              items={otherPlaylists}
              keyExtractor={(p) => p.id}
              renderItem={(p, isSelected) => <PlaylistListItem playlist={p} selected={isSelected} />}
              selectedIndex={copyTargetIndex}
              onSelectedIndexChange={setCopyTargetIndex}
              onActivate={(target) => {
                onCopySong(copyingSong, target);
                setCopyingSong(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { HomeScreen };