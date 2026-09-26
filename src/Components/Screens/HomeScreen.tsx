import "./HomeScreen.css";
import { PlaylistListItem } from "../Playlist_List_Item";
import { CursorList } from "../CursorList";
//import { ensureBragiFolders, loadPlaylists, savePlaylists, loadSongs, saveSongs } from '../../storage';
import type { Playlist } from '../../types';

function HomeScreen({
  playlists,
  playlistIndex,
  onPlaylistIndexChange,
  onCreatePlaylist,
  onDeletePlaylist,
  onRenamePlaylist,
  onSwitchToPlayerScreen,
  //onSwitchToSettingsScreen,
}: {
  playlists: Playlist[];
  playlistIndex: number;
  onPlaylistIndexChange: (index: number) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
  onRenamePlaylist: (playlist: Playlist, newName: string) => void;
  onSwitchToPlayerScreen: (playlist: Playlist) => void;
  onSwitchToSettingsScreen: () => void;
}) {

  function activatePlaylist() {
    onSwitchToPlayerScreen(playlists[playlistIndex]);
  }

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
        onActivate={activatePlaylist}
        enabled={true}
      />
    </div>
  );
}

export { HomeScreen };