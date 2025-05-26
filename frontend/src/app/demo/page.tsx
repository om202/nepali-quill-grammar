"use client";

import React, { useState } from "react";
import { NepaliTextEditor } from "@/components/NepaliTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Languages, Keyboard, BookOpen, Lightbulb } from "lucide-react";

export default function DemoPage() {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const examples = [
    {
      id: "greeting",
      title: "Greeting",
      english: "namaste",
      nepali: "नमस्ते",
      description: "Traditional Nepali greeting"
    },
    {
      id: "thanks",
      title: "Thank You",
      english: "dhanyawaad",
      nepali: "धन्यवाद",
      description: "Expressing gratitude"
    },
    {
      id: "country",
      title: "Country",
      english: "nepal",
      nepali: "नेपाल",
      description: "The beautiful country"
    },
    {
      id: "mountain",
      title: "Mountain",
      english: "sagarmatha",
      nepali: "सगरमाथा",
      description: "Mount Everest in Nepali"
    },
    {
      id: "constitution",
      title: "Constitution",
      english: "sambidhan",
      nepali: "संविधान",
      description: "The supreme law"
    },
    {
      id: "independence",
      title: "Independence",
      english: "swatantrata",
      nepali: "स्वतन्त्रता",
      description: "Freedom and liberty"
    }
  ];

  const instructions = [
    {
      step: 1,
      title: "Type in English",
      description: "Type English words using romanized spelling (e.g., 'namaste')"
    },
    {
      step: 2,
      title: "Press Space",
      description: "Press the spacebar to convert the word to Nepali script"
    },
    {
      step: 3,
      title: "Choose Layout",
      description: "Switch between 'Romanized' and 'Traditional' keyboard layouts"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Languages className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Nepali Typing Demo</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience seamless Nepali typing with our advanced text editor. 
            Type in English and watch it convert to beautiful Devanagari script instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Text Editor - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5 text-blue-600" />
                  <span>Nepali Text Editor</span>
                </CardTitle>
                <CardDescription>
                  Try typing in the editor below. Type English words followed by space to convert to Nepali.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] p-0">
                <NepaliTextEditor />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Instructions and Examples */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>How to Use</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructions.map((instruction) => (
                  <div key={instruction.step} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {instruction.step}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{instruction.title}</h4>
                      <p className="text-sm text-gray-600">{instruction.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Try These Examples</span>
                </CardTitle>
                <CardDescription>
                  Click on any example to see the conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examples.map((example) => (
                  <div
                    key={example.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedExample === example.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedExample(
                      selectedExample === example.id ? null : example.id
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{example.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        Example
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Type:</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {example.english}
                        </code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Gets:</span>
                        <span className="text-lg nepali-text font-medium text-blue-600">
                          {example.nepali}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{example.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Real-time conversion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Romanized & Traditional layouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Beautiful Devanagari fonts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Easy toggle between languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Grammar checking support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Powered by{" "}
            <a 
              href="https://github.com/suvash/nepalify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Nepalify
            </a>{" "}
            - A JavaScript library for Nepali Unicode input
          </p>
        </div>
      </div>
    </div>
  );
} 