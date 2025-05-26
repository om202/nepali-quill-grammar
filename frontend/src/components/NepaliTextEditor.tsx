"use client";
import React, { useRef, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setText } from "@/store/textSlice";
import { Suggestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Languages, Keyboard, ToggleLeft, ToggleRight } from "lucide-react";
import nepalify from "nepalify";

interface NepaliTextEditorProps {
  onSelectSuggestion?: (suggestionId: string) => void;
}

export const NepaliTextEditor: React.FC<NepaliTextEditorProps> = ({
  onSelectSuggestion,
}) => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.text.value);
  const suggestions = useSelector(
    (state: RootState) => state.suggestions.items
  ) as Suggestion[];
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const nepalifyInstanceRef = useRef<{
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
  } | null>(null);
  
  // State for Nepali typing
  const [isNepaliMode, setIsNepaliMode] = useState(false);
  const [layout, setLayout] = useState<"romanized" | "traditional">("romanized");

  // Unique ID for the textarea
  const textareaId = "nepali-text-editor";

  // Test nepalify on component mount
  useEffect(() => {
    try {
      console.log("Testing nepalify conversion:");
      console.log("Available layouts:", nepalify.availableLayouts());
      console.log("namaste ->", nepalify.format("namaste", { layout: "romanized" }));
      console.log("nepal ->", nepalify.format("nepal", { layout: "romanized" }));
      console.log("dhanyawaad ->", nepalify.format("dhanyawaad", { layout: "romanized" }));
    } catch (error) {
      console.warn("Error testing nepalify:", error);
    }
  }, []);

  // Initialize Nepalify when component mounts and Nepali mode changes
  useEffect(() => {
    if (!textareaRef.current) return;

    // Clean up previous instance
    if (nepalifyInstanceRef.current) {
      try {
        nepalifyInstanceRef.current.disable();
      } catch (error) {
        console.warn("Error disabling previous nepalify instance:", error);
      }
    }

    if (isNepaliMode) {
      try {
        console.log("Initializing Nepalify with layout:", layout);
        
        // Initialize nepalify on the textarea
        const instance = nepalify.interceptElementById(textareaId, {
          layout: layout,
          enable: true,
        });
        
        nepalifyInstanceRef.current = instance;
        console.log("Nepalify instance created:", instance);
        console.log("Is enabled:", instance.isEnabled());
        
      } catch (error) {
        console.error("Error initializing Nepalify:", error);
      }
    }

    // Cleanup function
    return () => {
      if (nepalifyInstanceRef.current) {
        try {
          nepalifyInstanceRef.current.disable();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
      }
    };
  }, [isNepaliMode, layout]);

  // Handle textarea input
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    dispatch(setText(newText));
  };

  // Sync Redux text with textarea value
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== text) {
      textareaRef.current.value = text;
    }
  }, [text]);

  // Build highlighted text for overlay
  const getHighlightedHTML = useCallback(() => {
    if (!text && !suggestions.length) {
      return `<span class="text-gray-500">${isNepaliMode ? 'यहाँ नेपाली पाठ लेख्नुहोस्...' : 'Type here in English or switch to Nepali mode...'}</span>`;
    }
    if (!suggestions.length) return escapeHTML(text);
    
    let html = "";
    let lastIndex = 0;
    const sortedSuggestions: Suggestion[] = [...suggestions].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedSuggestions.forEach((s: Suggestion) => {
      if (
        s.startIndex === undefined ||
        s.endIndex === undefined ||
        s.startIndex < lastIndex ||
        s.startIndex >= s.endIndex
      ) {
        console.warn("Skipping invalid or overlapping suggestion:", s);
        return;
      }

      html += escapeHTML(text.slice(lastIndex, s.startIndex));
      html += `<span class='underline text-red-600 bg-red-100 cursor-pointer' data-suggestion-id='${s.id}'>`;
      html += escapeHTML(text.slice(s.startIndex, s.endIndex));
      html += "</span>";
      lastIndex = s.endIndex;
    });
    
    html += escapeHTML(text.slice(lastIndex));
    return html;
  }, [text, suggestions, isNepaliMode]);

  // Escape HTML to prevent XSS
  const escapeHTML = useCallback((str: string) => {
    return str.replace(/[&<>"']/g, function (tag) {
      const chars: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return chars[tag] || tag;
    });
  }, []);

  // Toggle Nepali mode
  const toggleNepaliMode = () => {
    const newMode = !isNepaliMode;
    setIsNepaliMode(newMode);
    console.log("Nepali mode toggled to:", newMode);
  };

  // Toggle layout
  const toggleLayout = () => {
    const newLayout = layout === "romanized" ? "traditional" : "romanized";
    setLayout(newLayout);
    console.log("Layout changed to:", newLayout);
  };

  // Handle click on suggestion highlight in overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.suggestionId && onSelectSuggestion) {
      onSelectSuggestion(target.dataset.suggestionId);
    }
  };

  // Update overlay content when text or suggestions change
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.innerHTML = getHighlightedHTML();
    }
  }, [getHighlightedHTML]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Nepali Typing Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {isNepaliMode ? "नेपाली" : "English"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNepaliMode}
              className="h-8 px-3"
            >
              {isNepaliMode ? (
                <ToggleRight className="w-4 h-4 text-green-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
          
          {isNepaliMode && (
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-gray-600" />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLayout}
                className="h-8 px-3 text-xs"
              >
                {layout === "romanized" ? "Romanized" : "Traditional"}
              </Button>
            </div>
          )}
        </div>
        
        {isNepaliMode && (
          <div className="text-xs text-gray-500">
            {layout === "romanized" 
              ? "Type: namaste → नमस्ते (automatic conversion)" 
              : "Traditional layout active"
            }
          </div>
        )}
      </div>

      {/* Text Editor Container */}
      <div className="flex-1 relative border-l border-r border-b border-gray-300 rounded-b-lg bg-white">
        {/* Textarea for actual input */}
        <textarea
          ref={textareaRef}
          id={textareaId}
          className="absolute inset-0 w-full h-full p-6 bg-transparent resize-none focus:outline-none text-lg text-gray-800 leading-relaxed z-10"
          value={text}
          onChange={handleTextareaChange}
          placeholder={isNepaliMode ? "यहाँ नेपाली पाठ लेख्नुहोस्..." : "Type here in English or switch to Nepali mode..."}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            fontFamily: isNepaliMode ? "'Noto Sans Devanagari', 'Mangal', sans-serif" : "inherit",
            color: suggestions.length > 0 ? "transparent" : "inherit", // Hide text when showing suggestions
          }}
        />
        
        {/* Overlay for highlighting suggestions */}
        {suggestions.length > 0 && (
          <div
            ref={overlayRef}
            className="absolute inset-0 w-full h-full p-6 pointer-events-none text-lg text-gray-800 leading-relaxed z-20 whitespace-pre-wrap"
            onClick={handleOverlayClick}
            style={{
              fontFamily: isNepaliMode ? "'Noto Sans Devanagari', 'Mangal', sans-serif" : "inherit",
              pointerEvents: "auto", // Allow clicks on suggestions
            }}
          />
        )}
      </div>
    </div>
  );
}; 