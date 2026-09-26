import "./App.css";
import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { HomeScreen } from './Components/Screens/HomeScreen';
import { PlayerScreen } from "./Components/Screens/PlayerScreen";
import { ensureBragiFolders, loadPlaylists, savePlaylists, loadSongs, saveSongs } from './storage';
import type { Playlist, Song } from './types';


function App() {
  const [currentScreen, setCurrentScreen] = useState<"HomeScreen" | "PlayerScreen" | "SettingsScreen">("HomeScreen");
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>();

  const [playlistIndex, setPlaylistIndex] = useState(0);

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // load once on startup
  useEffect(() => {
    async function init() {
      await ensureBragiFolders();
      const [loadedPlaylists, loadedSongs] = await Promise.all([loadPlaylists(), loadSongs()]);
      setPlaylists(loadedPlaylists);
      setSongs(loadedSongs);
      setIsLoaded(true);
    }
    init();
  }, []);

  // save playlists whenever they change (but not before the initial load finishes)
  useEffect(() => {
    if (isLoaded) {
      savePlaylists(playlists);
    }
  }, [playlists, isLoaded]);

  // save songs whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveSongs(songs);
    }
  }, [songs, isLoaded]);

  // check for app updates once on startup
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          console.log(`found update ${update.version}, downloading...`);
          await update.downloadAndInstall();
          await relaunch();
        }
      } catch (err) {
        console.error('Update check failed:', err);
      }
    }
    checkForUpdates();
  }, []);


  function switchToHomeScreen() {
    setCurrentScreen("HomeScreen");
  }

  function switchToPlayerScreen(playlist: Playlist) {
    setCurrentPlaylist(playlist);
    setCurrentScreen("PlayerScreen");
  }

  function onSwitchToSettingsScreen() {
    console.log("settings");
  }

  function createPlaylist(name: string) {
    const newPlaylist: Playlist = { id: crypto.randomUUID(), name, songIds: [] };
    setPlaylists(prevList => [newPlaylist, ...prevList]);
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

  return (
    <div className="AppContainer">
      {currentScreen == "HomeScreen" && (
        <HomeScreen
          playlists={playlists}
          playlistIndex={playlistIndex}
          onPlaylistIndexChange={setPlaylistIndex}
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={deletePlaylist}
          onRenamePlaylist={renamePlaylist}
          onSwitchToPlayerScreen={switchToPlayerScreen}
          onSwitchToSettingsScreen={onSwitchToSettingsScreen}
        />
      )}
      {currentScreen == "PlayerScreen" && currentPlaylist && (
        <PlayerScreen onswitchToHomeScreen={switchToHomeScreen} playlist={currentPlaylist} />
      )}
    </div>
  );
}

export default App;