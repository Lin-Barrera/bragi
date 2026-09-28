import "./HomeScreen.css";
import { useEffect, useState } from "react";
import { PlaylistListItem } from "../Playlist_List_Item";
import { CursorList } from "../CursorList";
import type { Playlist } from '../../types_and_functions';

function HomeScreen({
  playlists,
  playlistIndex,
  onPlaylistIndexChange,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onMovePlaylist,
  onSwitchToPlayerScreen,
  onSwitchToSettingsScreen,
}: {
  playlists: Playlist[];
  playlistIndex: number;
  onPlaylistIndexChange: (index: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
  onRenamePlaylist: (playlist: Playlist, newName: string) => void;
  onMovePlaylist: (playlist: Playlist, direction: "up" | "down") => void;
  onSwitchToPlayerScreen: (playlist: Playlist) => void;
  onSwitchToSettingsScreen: () => void;
}) {

  const [listMode, setListMode] = useState<"idle" | "creating" | "renaming">("idle");

  function activatePlaylist() {
    onSwitchToPlayerScreen(playlists[playlistIndex]);
  }

  // screen-level shortcut: not part of CursorList's own navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (listMode !== "idle") return; // don't fire while typing a playlist name
      if (event.key === "s") {
        onSwitchToSettingsScreen();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [listMode, onSwitchToSettingsScreen]);

  return (
    <div className="home_screen_container">
      <div className="bragi_title">Bragi</div>

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
        onModeChange={setListMode}
        onActivate={activatePlaylist}
      />

      <div className="keybinds_footer">
        <div className="keybind_label">↓↑: navigate</div>
        <div className="keybind_label">Shift + ↓↑: move playlists</div>
        <div className="keybind_label">n: create playlist</div>
        <div className="keybind_label">r: rename playlist</div>
        <div className="keybind_label">x: delete playlist</div>
        <div className="keybind_label">f: open song directory</div>
        <div className="keybind_label">s: settings</div>
      </div>
    </div>
  );
}

export { HomeScreen };