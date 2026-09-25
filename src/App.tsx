import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { HomeScreen } from './Components/Screens/HomeScreen';
import { PlayerScreen } from "./Components/Screens/PlayerScreen";

export type Playlist = {
  id: string,
  name: string
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"HomeScreen" | "PlayerScreen" | "SettingsScreen">("HomeScreen");
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist>();

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          setUpdateAvailable(true);
          // for now, auto-install; later you might show a prompt first
          await update.downloadAndInstall();
          await relaunch();
        }
      } catch (err) {
        console.error('Update check failed:', err);
      }
    }

    checkForUpdates();
  }, []); // empty dependency array = runs once, on mount
  
  function switchToHomeScreen(){
    setCurrentScreen("HomeScreen");
  }

  function switchToPlayerScreen(playlist: Playlist){
    setCurrentPlaylist(playlist);
    setCurrentScreen("PlayerScreen");
  }

  function onSwitchToSettingsScreen(){
    console.log("settings");
  }

  return (
    <div className="AppContainer">
      {currentScreen=="HomeScreen" && <HomeScreen onSwitchToPlayerScreen={switchToPlayerScreen} onSwitchToSettingsScreen={onSwitchToSettingsScreen}/>}
      {currentScreen=="PlayerScreen" && currentPlaylist && <PlayerScreen onswitchToHomeScreen={switchToHomeScreen} playlist={currentPlaylist}/>}
    </div>
  );        
  
}

export default App;
