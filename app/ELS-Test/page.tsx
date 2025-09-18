"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SarthiButton } from "@/components/ui/sarthi-button";
import { SarthiInput } from "@/components/ui/sarthi-input";
import { SarthiOrb } from "@/components/sarthi-orb";
import { SarthiThinking } from "@/components/sarthi-thinking";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Step {
  type: "text" | "buttons" | "scale" | "dropdown" | "multi-select" | "radio";
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  scores?: Record<string, number>;
}

const steps: Step[] = [
  { type: "text", question: "Welcome 👋 How are you feeling today?" },
  {
    type: "buttons",
    question: "How often do you feel stressed?",
    options: ["Rarely", "Sometimes", "Often", "Almost daily"],
    scores: { Rarely: 1, Sometimes: 3, Often: 5, "Almost daily": 7 },
  },
  {
    type: "scale",
    question: "On a scale of 1–10, how would you rate your energy today?",
    min: 1,
    max: 10,
  },
  {
    type: "dropdown",
    question: "Pick your current mood:",
    options: ["Happy", "Sad", "Excited", "Tired", "Stressed"],
    scores: { Happy: 1, Excited: 2, Tired: 4, Sad: 5, Stressed: 6 },
  },
  {
    type: "multi-select",
    question: "What activities help you relax? (Select multiple)",
    options: ["Music", "Exercise", "Meditation", "Talking to friends", "Reading"],
    scores: { Music: -1, Exercise: -2, Meditation: -2, "Talking to friends": -1, Reading: -1 },
  },
  {
    type: "radio",
    question: "Do you usually sleep well?",
    options: ["Yes", "No", "Sometimes"],
    scores: { Yes: 0, Sometimes: 2, No: 4 },
  },
];

export default function DummyChatFormPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [scaleValue, setScaleValue] = useState(5);
  const [dropdownValue, setDropdownValue] = useState("");
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false); // 🔹 new state for modal
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (step < steps.length) {
      showAssistantMessage(steps[step].question);
    } else if (step === steps.length) {
      // instead of chat bubble → trigger modal
      setTimeout(() => setShowResult(true), 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const addMessage = (content: string, role: "user" | "assistant") => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content, role },
    ]);
  };

  const showAssistantMessage = async (text: string) => {
    setIsThinking(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsThinking(false);

    let current = "";
    const id = Date.now().toString();
    setMessages((prev) => [...prev, { id, content: "", role: "assistant" }]);

    let i = 0;
    const interval = setInterval(() => {
      current += text[i];
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: current } : m))
      );
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20);
  };

  const handleUserResponse = (response: string) => {
    addMessage(response, "user");

    const current = steps[step];
    if (current?.scores) {
      if (current.type === "multi-select") {
        const items = response.split(", ").map((s) => s.trim());
        const sum = items.reduce(
          (acc, val) => acc + (current.scores?.[val] || 0),
          0
        );
        setTotalScore((prev) => prev + sum);
      } else {
        setTotalScore((prev) => prev + (current.scores?.[response] || 0));
      }
    }

    setInput("");
    setStep((prev) => prev + 1);
  };

  const toggleMultiSelect = (opt: string) => {
    if (multiSelect.includes(opt)) {
      setMultiSelect(multiSelect.filter((o) => o !== opt));
    } else {
      setMultiSelect([...multiSelect, opt]);
    }
  };

  const currentStep = steps[step];

  // compute result interpretation
  let resultText = "";
  if (totalScore <= 5) {
    resultText = "You seem quite relaxed 😌.";
  } else if (totalScore <= 12) {
    resultText = "You have a moderate emotional load ⚖️.";
  } else {
    resultText = "You might be experiencing high stress 🚨.";
  }

  return (
    <div className="h-screen bg-[#121212] flex flex-col relative">
      {/* Top Bar */}
      <div className="border-b border-white/10 p-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white/60" />
        </button>
        <div className="flex items-center gap-2">
          <SarthiOrb size="sm" />
          <div>
            <h1 className="text-white font-medium text-lg sm:text-xl">
              Emotional Load Test
            </h1>
            {step < steps.length && (
              <p className="text-white/60 text-xs">
                Step {step + 1} of {steps.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-full sm:max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "items-start gap-4"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="mt-1">
                  <SarthiOrb size="sm" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-3xl shadow-md transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-[#1e1e1e] border border-[#2a2a2a] text-white animate-slideInRight"
                    : "bg-[#2a2a2a] border border-[#3a3a3a] text-white animate-slideInLeft"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <SarthiOrb size="sm" />
              </div>
              <SarthiThinking />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {step < steps.length && !isThinking && (
        <div className="border-t border-white/10 p-4">
          <div className="max-w-3xl mx-auto">
            {currentStep.type === "text" && (
              <div className="flex gap-3">
                <SarthiInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim()) handleUserResponse(input);
                    }
                  }}
                />
                <SarthiButton
                  onClick={() => input.trim() && handleUserResponse(input)}
                  disabled={!input.trim()}
                >
                  Send
                </SarthiButton>
              </div>
            )}

            {currentStep.type === "buttons" && (
              <div className="flex flex-wrap gap-2">
                {currentStep.options?.map((opt, idx) => (
                  <SarthiButton
                    key={idx}
                    onClick={() => handleUserResponse(opt)}
                    className="flex-1 min-w-0"
                  >
                    {opt}
                  </SarthiButton>
                ))}
              </div>
            )}

            {currentStep.type === "scale" && (
              <div className="flex flex-col items-center gap-2">
                <input
                  type="range"
                  min={currentStep.min}
                  max={currentStep.max}
                  value={scaleValue}
                  onChange={(e) => setScaleValue(Number(e.target.value))}
                  className="w-full"
                />
                <SarthiButton onClick={() => handleUserResponse(`${scaleValue}`)}>
                  Submit ({scaleValue})
                </SarthiButton>
              </div>
            )}

            {currentStep.type === "dropdown" && (
              <div className="flex gap-3">
                <select
                  className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] text-white rounded-lg p-2"
                  value={dropdownValue}
                  onChange={(e) => setDropdownValue(e.target.value)}
                >
                  <option value="">Select...</option>
                  {currentStep.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <SarthiButton
                  onClick={() => dropdownValue && handleUserResponse(dropdownValue)}
                  disabled={!dropdownValue}
                >
                  Submit
                </SarthiButton>
              </div>
            )}

            {currentStep.type === "multi-select" && (
              <div className="flex flex-col gap-2">
                {currentStep.options?.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={multiSelect.includes(opt)}
                      onChange={() => toggleMultiSelect(opt)}
                    />
                    <span className="text-white">{opt}</span>
                  </label>
                ))}
                <SarthiButton
                  onClick={() =>
                    multiSelect.length > 0 &&
                    handleUserResponse(multiSelect.join(", "))
                  }
                  disabled={multiSelect.length === 0}
                >
                  Submit
                </SarthiButton>
              </div>
            )}

            {currentStep.type === "radio" && (
              <div className="flex flex-col gap-2">
                {currentStep.options?.map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="radio-question"
                      value={opt}
                      onChange={() => handleUserResponse(opt)}
                    />
                    <span className="text-white">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Score Modal */}
      {showResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="w-64 h-64 bg-white rounded-full flex flex-col items-center justify-center text-center p-6 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-black">Your Score</h2>
            <p className="text-4xl font-extrabold text-black-600 mt-4">{totalScore}</p>
            <p className="text-black mt-4">{resultText}</p>
            <SarthiButton
              className="mt-6"
              onClick={() => router.push("/")}
            >
              Close
            </SarthiButton>
          </div>
        </div>
      )}
    </div>
  );
}
