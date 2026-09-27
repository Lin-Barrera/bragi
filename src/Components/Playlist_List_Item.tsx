import { Playlist } from "../types_and_functions";
import "./Playlist_List_Item.css";

function PlaylistListItem( {playlist, selected}: {playlist: Playlist, selected: boolean} ){
    return(
        <div 
        className="playlist_list_item"
        style={{color: selected ? "var(--primary-accent-color)" : "var(--text-color)"}}
        >
            {playlist.name}
        </div>
    )
}

export { PlaylistListItem };