import { Playlist } from "../App";
import "./Playlist_List_Item.css";

function PlaylistListItem( {playlist, selected}: {playlist: Playlist, selected: boolean} ){
    return(
        <div 
        className="playlist_list_item"
        style={{color: selected ? "var(--primary-accent-color)" : "white"}}
        >
            {playlist.name}
        </div>
    )
}

export { PlaylistListItem };