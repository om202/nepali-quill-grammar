"use client";
import React, { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setText } from "@/store/textSlice";
import { Suggestion } from "@/lib/api";

interface HighlightedTextEditorProps {
  onSelectSuggestion?: (suggestionId: string) => void;
}

export const HighlightedTextEditor: React.FC<HighlightedTextEditorProps> = ({ onSelectSuggestion }) => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.text.value);
  const suggestions = useSelector((state: RootState) => state.suggestions.items) as Suggestion[];
  const editorRef = useRef<HTMLDivElement>(null);

  // Build HTML with underlines for mistake ranges
  const getHighlightedHTML = () => {
    if (!suggestions.length) return text;
    let html = "";
    let lastIndex = 0;
    // Sort by startIndex to process in order of appearance
    const sortedSuggestions: Suggestion[] = [...suggestions].sort((a, b) => a.startIndex - b.startIndex);

    sortedSuggestions.forEach((s: Suggestion) => {
      // Ensure startIndex and endIndex are valid and in order
      if (s.startIndex === undefined || s.endIndex === undefined || s.startIndex < lastIndex || s.startIndex >= s.endIndex) {
        console.warn("Skipping invalid or overlapping suggestion:", s);
        return; // Skip this suggestion
      }

      // Add text before the current suggestion
      html += escapeHTML(text.slice(lastIndex, s.startIndex));
      
      // Add the highlighted suggestion
      html += `<span class='underline text-red-600 bg-red-100 cursor-pointer' data-suggestion-id='${s.id}'>`;
      html += escapeHTML(text.slice(s.startIndex, s.endIndex));
      html += "</span>";
      
      lastIndex = s.endIndex;
    });
    // Add any remaining text after the last suggestion
    html += escapeHTML(text.slice(lastIndex));
    return html;
  };

  // Escape HTML to prevent XSS
  function escapeHTML(str: string) {
    return str.replace(/[&<>"']/g, function (tag) {
      const chars: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return chars[tag] || tag;
    });
  }

  // Handle input and sync with Redux
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    dispatch(setText(e.currentTarget.innerText));
  };

  // Handle click on suggestion highlight
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.suggestionId && onSelectSuggestion) {
      onSelectSuggestion(target.dataset.suggestionId);
    }
  };

  // Keep contentEditable in sync with Redux text and highlights
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = getHighlightedHTML();
    }
    // eslint-disable-next-line
  }, [text, suggestions]);

  return (
    <div
      ref={editorRef}
      className="w-full min-h-[200px] p-3 border rounded bg-white focus:outline-none text-lg"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={handleInput}
      onClick={handleClick}
      aria-label="Nepali text editor"
      style={{ whiteSpace: "pre-wrap", outline: "none" }}
    />
  );
}; 