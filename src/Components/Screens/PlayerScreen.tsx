import { useEffect, useState, useRef } from "react";
import './PlayerScreen.css';
import { Playlist } from "../../App";

function PlayerScreen({onswitchToHomeScreen, playlist}: {onswitchToHomeScreen: ()=>void,playlist: Playlist}){

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent){
            if (event.code === "Escape"){
                console.log("escape");
                onswitchToHomeScreen();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    })

    return (
        <div>Current playlist: {playlist.name}</div>
    )
}

export {PlayerScreen};