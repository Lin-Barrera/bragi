import { useEffect, useState } from "react";
import './SettingsScreen.css';
import { CursorList } from "../CursorList";
import { PaletteColorPicker } from "../PaletteColorPicker";
import { getCssVariable } from "../../types_and_functions";

const ACCENT_PALETTE = [
    "#ff0000", "#fc7100", "#ffbb00", "#07d300", "#00ff9d", "#00e6d2", "#1640ff", "#ad009f", "#ff10eb", "#d8d8d8",
    "#ff4848", "#ff9f50", "#ffd45f", "#64ff5f", "#67ffc5", "#78fff4", "#5c7aff", "#8d3b86", "#ff79f4", "#353535",
];

type ThemeSetting = {
    label: string;
    variable: string;     // the CSS variable this row controls
    palette: string[];
};

const THEME_SETTINGS: ThemeSetting[] = [
    { label: "Title color", variable: "--title-accent-color", palette: ACCENT_PALETTE },
    { label: "Playlists panel color", variable: "--playlist-accent-color", palette: ACCENT_PALETTE },
    { label: "Songs panel color", variable: "--songs-accent-color", palette: ACCENT_PALETTE },
    { label: "Song name color", variable: "--song-name-accent-color", palette: ACCENT_PALETTE },
    { label: "Progress bar color", variable: "--progress-accent-color", palette: ACCENT_PALETTE },
    { label: "Player buttons color", variable: "--buttons-accent-color", palette: ACCENT_PALETTE },
    { label: "Visualizer color", variable: "--visualizer-accent-color", palette: ACCENT_PALETTE },
    { label: "Settings side panel color", variable: "--settings-side-accent-color", palette: ACCENT_PALETTE },
    {
        label: "Primary background color", variable: "--primary-bg-color",
        palette: ["#25252B", "#393949", "#525269", "#cacaca", "#d0d0ee", "#e6d7c3", "#cfcfcf"],
    },
    {
        label: "Secondary background color", variable: "--secondary-bg-color",
        palette: ["#1c1c20", "#31313b", "#434355", "#a8a8a8", "#bebee7", "#dcc8ac", "#bfbfbf"],
    },
    {
        label: "Tertiary background color", variable: "--tertiary-bg-color",
        palette: ["#141418", "#272731", "#3a3a4d", "#969696", "#acacdd", "#dcc8ac", "#bfbfbf"],
    },
    { label: "Text color", variable: "--text-color", palette: ["#0f0f0f", "#ffffff"] },
];

function SettingsScreen({onswitchToHomeScreen}: {onswitchToHomeScreen: ()=>void}){

    const categories = ["Theme"];
    const [categoryIndex, setCategoryIndex] = useState(0);

    // current value of every setting, keyed by CSS variable name
    const [colors, setColors] = useState<Record<string, string>>(() =>
        Object.fromEntries(THEME_SETTINGS.map(s => [s.variable, getCssVariable(s.variable)]))
    );

    function changeColor(variable: string, hex: string) {
        setColors(prev => ({ ...prev, [variable]: hex }));
        document.documentElement.style.setProperty(variable, hex);
    }

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
        <div className="settings_screen_container">
            <div className="side_panel">
                <CursorList
                    className="category_list"
                    items={categories}
                    keyExtractor={(category) => category}
                    renderItem={(category, isSelected) => (
                        <div className="setting_category_item" style={{ color: isSelected ? "var(--settings-side-accent-color)" : "var(--text-color)" }}>
                            {category}
                        </div>
                    )}
                    selectedIndex={categoryIndex}
                    onSelectedIndexChange={setCategoryIndex}
                />
            </div>

            <div className="main_settings_panel">
                {categoryIndex===0 && (
                    <div className="theme_settings_container">
                        {THEME_SETTINGS.map((setting) => (
                            <div className="setting" key={setting.variable}>
                                <div className="setting_label">{setting.label}</div>
                                <div className="setting_filler" />
                                <div className="setting_control">
                                    <PaletteColorPicker
                                        color={colors[setting.variable]}
                                        onChangeComplete={(color) => changeColor(setting.variable, color.hex)}
                                        palette={setting.palette}
                                    />
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}

export {SettingsScreen};