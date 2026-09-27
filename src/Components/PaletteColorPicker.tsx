import { useState, useEffect } from 'react';
import './PaletteColorPicker.css';


const PALETTE = [
    "#ff0000", "#fc7100", "#ffbb00", "#07d300", "#00ff9d", "#1640ff", "#ad009f", "#ff10eb", "#bdbdbd",
];

function isValidHex(value: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

function PaletteColorPicker({
    color,
    onChangeComplete,
    palette=["#ff0000", "#fc7100", "#ffbb00", "#07d300", "#00ff9d", "#1640ff", "#ad009f", "#ff10eb", "#bdbdbd"]
}: {
    color: string;
    onChangeComplete: (color: { hex: string }) => void;
    palette?: string[]
}) {
    const [hexInput, setHexInput] = useState(color);

    // keep the text field in sync if the color changes from outside (e.g. a swatch click)
    useEffect(() => {
        setHexInput(color);
    }, [color]);

    function handleSwatchClick(swatchColor: string) {
        onChangeComplete({ hex: swatchColor });
    }

    function handleHexSubmit() {
        if (isValidHex(hexInput)) {
            onChangeComplete({ hex: hexInput });
        } else {
            // invalid input — revert the field back to the last known good color
            setHexInput(color);
        }
    }

    return (
        <div className="palette_picker">
            <div className="palette_swatch_grid">
                {palette.map((swatchColor) => (
                    <button
                        key={swatchColor}
                        type="button"
                        className={`palette_swatch ${swatchColor.toLowerCase() === color.toLowerCase() ? "palette_swatch_selected" : ""}`}
                        style={{ backgroundColor: swatchColor }}
                        onClick={() => handleSwatchClick(swatchColor)}
                        aria-label={swatchColor}
                    />
                ))}
            </div>

            <div className="palette_hex_row">
                <span className="palette_hex_label">#</span>
                <input
                    className="palette_hex_input"
                    type="text"
                    value={hexInput.replace('#', '')}
                    onChange={(e) => setHexInput('#' + e.target.value)}
                    onBlur={handleHexSubmit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleHexSubmit();
                    }}
                />
            </div>
        </div>
    );
}

export { PaletteColorPicker };