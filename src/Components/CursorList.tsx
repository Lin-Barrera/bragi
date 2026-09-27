import "./CursorList.css";
import { useState, useEffect, useRef } from 'react';

interface CursorListProps<T>{
    className?: string;
    items: T[];
    keyExtractor: (item: T) => string;
    renderItem: (item: T, isSelected: boolean) => React.ReactNode;
    selectedIndex: number;
    onSelectedIndexChange: (index: number) => void;
    onActivate?: (item: T) => void;
    onCreate?: (name: string) => void;
    onDelete?: (item: T) => void;
    onRename?: (item: T, newName: string) => void;
    onReorder?: (item: T, direction: "up" | "down") => void;
    onModeChange?: (mode: "idle" | "creating" | "renaming") => void;
}

function CursorList<T>({
    className,
    items,
    keyExtractor,
    renderItem,
    selectedIndex,
    onSelectedIndexChange,
    onActivate,
    onCreate,
    onDelete,
    onRename,
    onReorder,
    onModeChange,
}: CursorListProps<T>){
    const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [cursorTop, setCursorTop] = useState(0);
    const [mode, setMode] = useState<"idle" | "creating" | "renaming">("idle");
    const [textInput, setTextInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const selectedRow = rowRefs.current[selectedIndex];
        if (selectedRow) {
            setCursorTop(selectedRow.offsetTop);
        }
    }, [selectedIndex, items, mode]);

    useEffect(() => {
        if (mode != "idle") inputRef.current?.focus();
        onModeChange?.(mode);
    }, [mode]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (mode !== "idle") {
                if (event.key === "Enter") {
                    const trimmed = textInput.trim();
                    if (trimmed.length > 0) {
                        if (mode === "creating") onCreate?.(trimmed);
                        if (mode === "renaming") onRename?.(items[selectedIndex], trimmed);
                    }
                    setMode("idle");
                } else if (event.key === "Escape") {
                    setMode("idle");
                }
                return;
            }

            // shift+arrow reorder — checked before plain arrow navigation
            if (event.shiftKey && event.code === "ArrowUp" && onReorder && selectedIndex > 0) {
                event.preventDefault();
                onReorder(items[selectedIndex], "up");
                onSelectedIndexChange(selectedIndex - 1);
            } else if (event.shiftKey && event.code === "ArrowDown" && onReorder && selectedIndex < items.length - 1) {
                event.preventDefault();
                onReorder(items[selectedIndex], "down");
                onSelectedIndexChange(selectedIndex + 1);
            } else if (event.code === "ArrowUp" && items.length > 0) {
                onSelectedIndexChange(selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1);
            } else if (event.code === "ArrowDown" && items.length > 0) {
                onSelectedIndexChange(selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1);
            } else if (event.key === "n" && onCreate) {
                event.preventDefault();
                setTextInput("");
                setMode("creating");
            } else if (event.key === "r" && onRename && items.length > 0) {
                event.preventDefault();
                setTextInput("");
                setMode("renaming");
            } else if (event.key === "x" && onDelete && items.length > 0) {
                onDelete(items[selectedIndex]);
            } else if (event.key === "Enter" && onActivate && items.length > 0) {
                onActivate(items[selectedIndex]);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mode, items, selectedIndex, textInput, onSelectedIndexChange, onActivate, onRename, onDelete, onCreate, onReorder]);


    return(
        <div className={`${className} cursor_list_wrapper`}>
            {(onCreate || onRename) && (<div style={{opacity: mode !== "idle" ? '100%' : '0%'}} className="new_label rendered_item">New name:
                <input
                className="new_label_input app_input"
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                />
            </div>)}

            <div className="cursor_list_inner">
                <div
                    className="cursor"
                    style={{ transform: `translateY(${cursorTop}px)`, opacity: `${items.length>0?'100%':'0%'}` }}
                >{'>'}</div>

                <div className="cursor_list">
                    {items.map((item, index) => (
                        <div 
                        className="rendered_item"
                        ref={(el) => { rowRefs.current[index] = el; }} 
                        key={keyExtractor(item)}>
                            {renderItem(item, index === selectedIndex)}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export { CursorList };