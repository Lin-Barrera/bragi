import { useEffect, useState } from "react";
import './SettingsScreen.css';
import { CursorList } from "../CursorList";
import { PaletteColorPicker } from "../PaletteColorPicker";


function SettingsScreen({onswitchToHomeScreen}: {onswitchToHomeScreen: ()=>void}){
    
    const categories = ["Theme", "Accessibility"];
    const [categoryIndex, setCategoryIndex] = useState(0);

    const [accentColor, setAccentColor] = useState(getComputedStyle(document.documentElement).getPropertyValue("--primary-accent-color"));
    const [primaryBGColor, setprimaryBGColor] = useState(getComputedStyle(document.documentElement).getPropertyValue("--primary-bg-color"));
    const [secondaryBGColor, setsecondaryBGColor] = useState(getComputedStyle(document.documentElement).getPropertyValue("--secondary-bg-color"));
    const [textColor, setTextColor] = useState(getComputedStyle(document.documentElement).getPropertyValue("--text-color"));

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

    useEffect(() => {
        document.documentElement.style.setProperty('--primary-accent-color', accentColor);
    }, [accentColor]);
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-bg-color', primaryBGColor);
    }, [primaryBGColor]);
    useEffect(() => {
        document.documentElement.style.setProperty('--secondary-bg-color', secondaryBGColor);
    }, [secondaryBGColor]);
    useEffect(() => {
        document.documentElement.style.setProperty('--text-color', textColor);
    }, [textColor]);

    return (
        <div className="settings_screen_container">
            <div className="side_panel">
                <CursorList
                    className="category_list"
                    items={categories}
                    keyExtractor={(category) => category}
                    renderItem={(category, isSelected) => (
                        <div className="setting_category_item" style={{ color: isSelected ? "var(--primary-accent-color)" : "var(--text-color)" }}>
                            {category}
                        </div>
                    )}
                    selectedIndex={categoryIndex}
                    onSelectedIndexChange={setCategoryIndex}
                />
            </div>
            
            <div className="main_settings_panel">
                <div className="setting">
                    <div className="setting_label">Primary accent color</div>
                    <PaletteColorPicker
                        color={accentColor}
                        onChangeComplete={(color) => setAccentColor(color.hex)}
                    />
                </div>

                <div className="setting">
                    <div className="setting_label">Primary background color</div>
                    <PaletteColorPicker
                        color={primaryBGColor}
                        onChangeComplete={(color) => setprimaryBGColor(color.hex)}
                        palette={[
                            "#25252B", "#2b2b38", "#303044", "#343452",
                            "#ececec", "#d0d0ee", "#e6d7c3", "#cfcfcf",
                        ]}
                    />
                </div>

                <div className="setting">
                    <div className="setting_label">Secondary background color</div>
                    <PaletteColorPicker
                        color={secondaryBGColor}
                        onChangeComplete={(color) => setsecondaryBGColor(color.hex)}
                        palette={[
                            "#17171c", "#1d1d25", "#242433", "#28283e",
                            "#c7c7c7", "#bcbce7", "#dcc8ac", "#bfbfbf",
                        ]}
                    />
                </div>

                <div className="setting">
                    <div className="setting_label">Text color</div>
                    <PaletteColorPicker
                        color={textColor}
                        onChangeComplete={(color) => setTextColor(color.hex)}
                        palette={[
                            "#0f0f0f", "#ffffff",
                        ]}
                    />
                </div>
                
            </div>
            

        </div>
    )

}

export {SettingsScreen};