import "./HomeScreen.css";
import { useState, useEffect, useRef } from 'react';
import { Playlist } from "../../App";
import { PlaylistListItem } from "../Playlist_List_Item";
import { CursorList } from "../CursorList";

function HomeScreen(
  { onSwitchToPlayerScreen,
    onSwitchToSettingsScreen
  }: {onSwitchToPlayerScreen: (playlist: Playlist)=>void,
      onSwitchToSettingsScreen: () => void
  }
) {

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  function createPlaylist(name: string) {
    const newPlaylist: Playlist = { id: crypto.randomUUID(), name };
    setPlaylists(prevList => [...prevList, newPlaylist]);
  }

  function deletePlaylist(playlistToRemove: Playlist) {
    setPlaylists(prev => prev.filter(item => item.id !== playlistToRemove.id));
  }

  function renamePlaylist(playlistToRename: Playlist, newName: string) {
    setPlaylists(prev =>
      prev.map(item =>
        item.id === playlistToRename.id ? { ...item, name: newName } : item
      )
    );
  }

  function activatePlaylist(){
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
        onSelectedIndexChange={setPlaylistIndex}
        onCreate={createPlaylist}
        onDelete={deletePlaylist}
        onRename={renamePlaylist}
        onActivate={activatePlaylist}
        enabled={true}
      />
    </div>
  );
}

export { HomeScreen };