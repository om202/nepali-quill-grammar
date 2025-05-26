"use client";
import React, { useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setText } from "@/store/textSlice";
import { Suggestion } from "@/lib/api";

interface HighlightedTextEditorProps {
  onSelectSuggestion?: (suggestionId: string) => void;
}

export const HighlightedTextEditor: React.FC<HighlightedTextEditorProps> = ({
  onSelectSuggestion,
}) => {
  const dispatch = useDispatch();
  const text = useSelector((state: RootState) => state.text.value);
  const suggestions = useSelector(
    (state: RootState) => state.suggestions.items
  ) as Suggestion[];
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

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

  // Build HTML with underlines for mistake ranges
  const getHighlightedHTML = useCallback(() => {
    if (!text && !suggestions.length) {
      return '<span class="text-gray-500">यहाँ नेपाली पाठ लेख्नुहोस्...</span>';
    }
    if (!suggestions.length) return escapeHTML(text);
    let html = "";
    let lastIndex = 0;
    // Sort by startIndex to process in order of appearance
    const sortedSuggestions: Suggestion[] = [...suggestions].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    sortedSuggestions.forEach((s: Suggestion) => {
      // Ensure startIndex and endIndex are valid and in order
      if (
        s.startIndex === undefined ||
        s.endIndex === undefined ||
        s.startIndex < lastIndex ||
        s.startIndex >= s.endIndex
      ) {
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
  }, [text, suggestions, escapeHTML]);

  // Handle input and sync with Redux
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isUpdatingRef.current) return; // Prevent infinite loops

    const newText = e.currentTarget.innerText;
    // Clear placeholder text when user starts typing
    if (newText === "यहाँ नेपाली पाठ लेख्नुहोस्...") {
      dispatch(setText(""));
      return;
    }
    dispatch(setText(newText));
  };

  // Handle click on suggestion highlight
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.dataset.suggestionId && onSelectSuggestion) {
      onSelectSuggestion(target.dataset.suggestionId);
    }
  };

  // Handle focus to clear placeholder
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      !text &&
      e.currentTarget.innerHTML.includes("यहाँ नेपाली पाठ लेख्नुहोस्...")
    ) {
      e.currentTarget.innerHTML = "";
    }
  };

  // Keep contentEditable in sync with Redux text and highlights
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      const currentHTML = getHighlightedHTML();

      // Only update if the content has actually changed
      if (editorRef.current.innerHTML !== currentHTML) {
        // Save cursor position
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const cursorOffset = range ? range.startOffset : 0;

        editorRef.current.innerHTML = currentHTML;

        // Restore cursor position if possible
        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange();
            const textNode = editorRef.current.firstChild;
            const maxOffset = textNode.textContent?.length || 0;
            newRange.setStart(textNode, Math.min(cursorOffset, maxOffset));
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          } catch (error) {
            // Ignore cursor restoration errors
            console.warn("Could not restore cursor position:", error);
          }
        }
      }

      isUpdatingRef.current = false;
    }
  }, [getHighlightedHTML]);

  return (
    <div
      ref={editorRef}
      className="w-full h-full p-6 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-lg text-gray-800 leading-relaxed overflow-y-auto resize-none text-editor-scroll transition-all duration-200"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onInput={handleInput}
      onClick={handleClick}
      onFocus={handleFocus}
      aria-label="Nepali text editor"
      style={{ whiteSpace: "pre-wrap", outline: "none", minHeight: "200px" }}
    />
  );
};
