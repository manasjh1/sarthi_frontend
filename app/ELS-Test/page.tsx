"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Heart, Brain, TrendingUp, MessageCircle, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { SarthiOrb } from "@/components/sarthi-orb";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Question {
  id: number;
  step_number: number;
  type: string;
  question: string;
  qna_answers: any;
  weight: number;
  is_llm: boolean;
  domain_name: string;
  domain_type: string;
  reverse?: boolean;
}

interface ELTResult {
  els_score: number;
  zone: string;
  zone_message: string;
  total_score: number;
  weighted_score: number;
  completed_at: string;
  top_stress_drivers: Array<{
    domain: string;
    score: number;
  }>;
}

// Category intro data
const categoryIntros: Record<string, { title: string; intro: string; emoji: string }> = {
  "Emotional Wellbeing": {
    title: "Emotional Wellbeing",
    intro: "Let's understand your emotional landscape and how you're feeling.",
    emoji: "🌊",
  },
  "Work-Life Balance": {
    title: "Work-Life Balance",
    intro: "Exploring how work and personal life intersect for you.",
    emoji: "⚖️",
  },
  "Stress Management": {
    title: "Stress Management",
    intro: "Understanding how you handle pressure and challenging moments.",
    emoji: "🧘",
  },
  "Social Connection": {
    title: "Social Connection",
    intro: "Looking at your relationships and support systems.",
    emoji: "🤝",
  },
  "Physical Health": {
    title: "Physical Health",
    intro: "Your body tells a story. Let's listen to what it's saying.",
    emoji: "💪",
  },
  "Purpose & Growth": {
    title: "Purpose & Growth",
    intro: "Exploring meaning, values, and personal development.",
    emoji: "✨",
  },
};

export default function EmotionalLoadTest() {
  const [stage, setStage] = useState(0); // 0: Landing, 1: Test, 2: CategoryIntro, 3: Results
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [questionReady, setQuestionReady] = useState(false);
  const [scaleValue, setScaleValue] = useState(3);
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(13);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [eltResult, setEltResult] = useState<ELTResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastDomainName, setLastDomainName] = useState<string>("");
  const [showCategoryIntro, setShowCategoryIntro] = useState(false);
  const [categoryIntroData, setCategoryIntroData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

// Auto-proceed from category intro
useEffect(() => {
  if (stage === 2 && showCategoryIntro) {
    const timer = setTimeout(() => {
      setShowCategoryIntro(false);
      setStage(1);
      setMessages([]);
      setTimeout(() => {
        // REMOVED: setQuestionReady(true); - Let showAssistantMessage handle this
        if (currentQuestion) {
          showAssistantMessage(currentQuestion.question);
        }
      }, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [stage, showCategoryIntro, currentQuestion]);

  const addMessage = (content: string, role: "user" | "assistant") => {
    setMessages((prev) => [...prev, { id: Date.now().toString(), content, role }]);
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
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: current } : m)));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // Add extra scroll after typing completes
        setTimeout(() => {
          setQuestionReady(true);
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 200);
      }
    }, 15);
  };

  const initializeTest = async () => {
    if (hasInitialized) return;

    setIsLoading(true);
    setError(null);
    setHasInitialized(true);

    try {
      const response = await authFetch('/api/emotional-test/process', {
        method: 'POST',
        body: JSON.stringify({ initialize: true })
      });

      const data = await response.json();

      console.log(data);
      if (!data.success) {
        setError(data.message || "Failed to initialize test");
        setIsLoading(false);
        return;
      }

      if (data.completed && data.elt_result) {
        setEltResult(data.elt_result);
        setStage(3);
      } else if (data.question) {
        setCurrentQuestion(data.question);
        setCurrentStep(data.current_step);
        setTotalSteps(data.total_steps);
        setProgressPercentage(data.progress_percentage);
        setLastDomainName(data.question.domain_name);
        setStage(1);

        // Wait for state to settle before showing question
        setTimeout(() => {

          showAssistantMessage(data.question.question);
        }, 300);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answer: any) => {
    if (!currentQuestion) return;

    setQuestionReady(false);
    setError(null);

    const answerText = Array.isArray(answer) ? answer.join(", ") : String(answer);
    addMessage(answerText, "user");

    setIsLoading(true);

    try {
      const response = await authFetch('/api/emotional-test/process', {
        method: 'POST',
        body: JSON.stringify({
          initialize: false,
          answer: answer,
          question_id: currentQuestion.id,
          step: currentQuestion.step_number
        })
      });

      const data = await response.json();
      console.log(data);

      if (!data.success) {
        setError(data.message || "Failed to submit answer");
        setIsLoading(false);
        setQuestionReady(true);
        return;
      }

      if (data.completed && data.success) {
        setQuestionReady(false);
        setTimeout(() => {
          showAssistantMessage("That's it! You just gave your emotions the attention they deserve. Let's see what they're trying to tell you.");
          setTimeout(() => {
            setEltResult(data.elt_result);
            setStage(3);
          }, 5000);
        }, 600);
      } else if (data.question) {
        // Check if domain changed
        const domainChanged = lastDomainName && lastDomainName !== data.question.domain_name;

        setCurrentQuestion(data.question);
        setCurrentStep(data.current_step);
        setProgressPercentage(data.progress_percentage);

        // Reset input values
        setScaleValue(3);
        setMultiSelectValues([]);
        setTextValue("");

        if (domainChanged) {
          // Show category intro after a brief pause
          setLastDomainName(data.question.domain_name);
          const introData = categoryIntros[data.question.domain_name] || {
            title: data.question.domain_name,
            intro: "Let's explore this area together.",
            emoji: ""
          };
          setCategoryIntroData(introData);

          setTimeout(() => {
            setShowCategoryIntro(true);
            setStage(2);
          }, 600);
        } else {
          // Same domain, show next question
          setLastDomainName(data.question.domain_name);
          setTimeout(() => {
            showAssistantMessage(data.question.question);
          }, 600);
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
      setQuestionReady(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!currentQuestion || isLoading) return;

    let answer: any;

    switch (currentQuestion.type) {
      case "scale":
      case "rating":
        answer = scaleValue;
        break;
      case "multi-select":
        if (multiSelectValues.length === 0) {
          setError("Please select at least one option");
          return;
        }
        answer = multiSelectValues;
        break;
      case "text":
        if (!textValue.trim()) {
          setError("Please enter your response");
          return;
        }
        answer = textValue;
        break;
      case "number":
        answer = parseFloat(textValue);
        break;
      default:
        return;
    }

    submitAnswer(answer);
  };

  const handleOptionClick = (value: string) => {
    if (isLoading) return;
    submitAnswer(value);
  };

  const handleMultiSelectToggle = (value: string) => {
    setMultiSelectValues(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case "Green": return "from-green-500 to-emerald-500";
      case "Yellow": return "from-yellow-500 to-orange-500";
      case "Red": return "from-red-500 to-rose-500";
      case "Red+": return "from-red-700 to-red-900";
      default: return "from-gray-500 to-gray-700";
    }
  };

  const getZoneBgColor = (zone: string) => {
    switch (zone) {
      case "Green": return "bg-green-500";
      case "Yellow": return "bg-yellow-500";
      case "Red": return "bg-red-500";
      case "Red+": return "bg-red-700";
      default: return "bg-gray-500";
    }
  };


  useEffect(() => {
    if (questionReady && messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [questionReady]);

  useEffect(() => {
    (async () => {
      try {
        const response = await authFetch('/api/emotional-test/process', {
          method: 'POST',
          body: JSON.stringify({ initialize: true })
        });

        const data = await response.json();
        console.log(data);
        if (data.completed && data.elt_result) {
          setEltResult(data.elt_result);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);



  if (stage === 0) {
    return (
      <div className="min-h-screen bg-[#121212] relative overflow-hidden">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 md:py-12">
          <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-8">
            {/* Icon - smaller on mobile */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
            </div>

            {/* Title - responsive text size */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-tight">
              Understand your<br />
              <span className="text-white/70">Emotional Load</span>
            </h1>

            {/* Description - responsive text */}
            <div className="max-w-2xl mx-auto space-y-3 md:space-y-4 text-sm md:text-base lg:text-lg text-[#cbd5e1] leading-relaxed px-2">
              <p>
                Everyone carries an invisible weight - unspoken feelings, misunderstood moments.
              </p>
              <p className="text-white/90">
                We call this <span className="text-white">Emotional Load</span>.
              </p>
            </div>

            {/* Feature cards - stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto mt-8 md:mt-12 px-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/5">
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-white/80 mb-2 md:mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-1 md:mb-2 text-sm md:text-base">5-Minute Test</h3>
                <p className="text-[#cbd5e1] text-xs md:text-sm">Quick assessment</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/5">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white/80 mb-2 md:mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-1 md:mb-2 text-sm md:text-base">Personal Score</h3>
                <p className="text-[#cbd5e1] text-xs md:text-sm">Understand your state</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/5">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white/80 mb-2 md:mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-1 md:mb-2 text-sm md:text-base">Guided Relief</h3>
                <p className="text-[#cbd5e1] text-xs md:text-sm">Express what's hard</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 text-red-400 text-sm md:text-base mx-2">
                {error}
              </div>
            )}


            {/* CTA Button - responsive sizing */}
            <div className="pt-6 md:pt-8 px-2 pb-8">
              <button
                onClick={() => {
                  if (eltResult) {
                    setStage(3);
                  } else {
                    initializeTest();
                  }
                }}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 md:px-10 py-3 md:py-4 bg-white text-black text-base md:text-lg font-normal rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 md:gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Loading...
                  </>
                ) : eltResult ? (
                  <>
                    See Your Score
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </>
                ) : (
                  <>
                    Take the Test
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Stage 2: Category Intro (Auto-proceed after 3 seconds)
  if (stage === 2 && showCategoryIntro && categoryIntroData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center space-y-6 animate-fade-in">
          <div className="text-6xl mb-4">{categoryIntroData.emoji}</div>
          <h2 className="text-3xl font-normal text-white">{categoryIntroData.title}</h2>
          <p className="text-xl text-[#cbd5e1] leading-relaxed italic">
            "{categoryIntroData.intro}"
          </p>

        </div>
      </div>
    );
  }

  // Stage 1: Test Section
  if (stage === 1 && currentQuestion) {
    const progress = progressPercentage;

    return (
      <div className="h-screen bg-[#121212] flex flex-col">
        <div className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <SarthiOrb />
              </div>
              <div className="flex-1">
                <h1 className="text-white font-normal text-xl">Emotional Load Assessment</h1>
                <p className="text-white/60 text-sm">{currentQuestion.domain_name}</p>
              </div>
              <div className="text-white/40 text-sm">
                {currentStep} / {totalSteps}
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="text-center mb-8">
              <p className="text-[#cbd5e1] italic text-lg">
                "Every question here is a mirror, not a test. Take a breath, answer honestly."
              </p>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <SarthiOrb />
                  </div>
                )}
                <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.role === "user"
                  ? "bg-white text-black"
                  : "bg-white/5 text-white border border-white/5"
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <SarthiOrb />
                </div>
                <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Only show options when question is ready and not thinking */}
        {!isThinking && questionReady && currentQuestion && (
          <div className="border-t border-white/5 p-4 backdrop-blur-sm bg-black/20 sticky bottom-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Dropdown/Radio/Toggle/Buttons */}
              {(currentQuestion.type === "dropdown" ||
                currentQuestion.type === "radio" ||
                currentQuestion.type === "toggle" ||
                currentQuestion.type === "buttons") && (
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.qna_answers.options?.map((opt: any) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionClick(opt.text)}
                        disabled={isLoading}
                        className="px-6 py-3 bg-white text-black rounded-xl font-normal transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}

              {/* Scale */}
              {(currentQuestion.type === "scale" || currentQuestion.type === "rating") && (
                <div className="space-y-4">
                  <div className="flex justify-between text-white/60 text-sm px-2">
                    <span className="flex items-center gap-1">
                      {currentQuestion.reverse ? "😫 Strongly Disagree" : "😌 Strongly Disagree"}
                    </span>
                    <span className="flex items-center gap-1">
                      {currentQuestion.reverse ? "Strongly Agree 😌" : "Strongly Agree 😫"}
                    </span>
                  </div>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((num) => {
                      // Reverse emoji mapping if reverse is true
                      const emojiMap = currentQuestion.reverse
                        ? { 1: "😫", 2: "😟", 3: "😐", 4: "🙂", 5: "😌" }
                        : { 1: "😌", 2: "🙂", 3: "😐", 4: "😟", 5: "😫" };

                      return (
                        <div key={num} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => {
                              setScaleValue(num);
                              submitAnswer(num);
                            }}
                            disabled={isLoading}
                            className="w-16 h-16 rounded-full flex items-center justify-center font-normal text-lg bg-white/10 hover:bg-white hover:text-black text-white border-2 border-white/5 hover:border-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {num}
                          </button>
                          <span className="text-2xl">{emojiMap[num as keyof typeof emojiMap]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Select */}
              {currentQuestion.type === "multi-select" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.qna_answers.options?.map((opt: any) => (
                      <button
                        key={opt.value}
                        onClick={() => handleMultiSelectToggle(opt.text)}
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-xl font-normal transition-all ${multiSelectValues.includes(opt.text)
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || multiSelectValues.length === 0}
                    className="w-full px-6 py-3 bg-white text-black rounded-xl font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Submitting..." : "Continue"}
                  </button>
                </div>
              )}

              {/* Text/Number */}
              {(currentQuestion.type === "text" || currentQuestion.type === "number") && (
                <div className="space-y-4">
                  {currentQuestion.type === "text" ? (
                    <textarea
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder={currentQuestion.qna_answers.placeholder || "Your response..."}
                      maxLength={currentQuestion.qna_answers.max_length}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/5 focus:border-white/20 outline-none resize-none disabled:opacity-50"
                      rows={4}
                    />
                  ) : (
                    <input
                      type="number"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      min={currentQuestion.qna_answers.min}
                      max={currentQuestion.qna_answers.max}
                      step={currentQuestion.qna_answers.step || 1}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl border border-white/5 focus:border-white/20 outline-none disabled:opacity-50"
                    />
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !textValue.trim()}
                    className="w-full px-6 py-3 bg-white text-black rounded-xl font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Submitting..." : "Continue"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stage 3: Results Section
  if (stage === 3 && eltResult) {
    const zone = eltResult.zone;
    const zoneColor = getZoneColor(zone);
    const zoneBgColor = getZoneBgColor(zone);

    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-8">
            <h2 className="text-2xl font-normal text-white text-center mb-8">
              Here's what your emotions are saying right now.
            </h2>

            <div className="text-center mb-8">
              <div className={`w-56 h-56 mx-auto rounded-full bg-gradient-to-br ${zoneColor} flex items-center justify-center mb-6 relative`}>
                <div className="relative">
                  <div className="text-6xl font-normal text-white">{Math.round(eltResult.els_score)}</div>
                  <div className="text-white/90 text-base mt-2 font-normal">Your Emotional Load</div>
                </div>
              </div>
              <div className={`inline-block px-6 py-2 rounded-full ${zoneBgColor} text-white font-normal text-lg mb-3`}>
                {zone} Zone
              </div>
              <p className="text-white/70 text-lg">{eltResult.zone_message}</p>
            </div>



            {eltResult.top_stress_drivers && eltResult.top_stress_drivers.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6">
                <h3 className="text-white font-normal text-lg mb-4">Your Emotional Landscape</h3>
                <div className="space-y-3">
                  {eltResult.top_stress_drivers.slice(0, 2).map((driver, idx) => {
                    const percentage = (driver.score / eltResult.weighted_score) * 100;
                    return (
                      <div key={driver.domain}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/90 text-sm flex items-center gap-2">
                            {driver.domain}
                            {idx === 0 && <span className="text-xs text-yellow-400">(Highest)</span>}
                          </span>
                          <span className="text-white/60 text-sm">{Math.round(driver.score)}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-red-500 to-orange-500' : 'from-yellow-500 to-amber-500'
                              } transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
              <h3 className="text-white font-normal text-lg mb-3">That's where Sarthi can help</h3>
              <p className="text-[#cbd5e1] mb-4 leading-relaxed">
                Sarthi is tuned to lighten this exact kind of weight. Let's express what feels unsaid - safely, clearly, and in your own way.
              </p>
              <button
                onClick={() => router.push('/chat')}
                className="w-full px-6 py-4 bg-white text-black rounded-xl font-normal transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Talk to Sarthi
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>



          <div className="text-center text-white/50 text-sm">
            <p className="flex items-center justify-center gap-2">
              💛 If you ever feel emotionally overwhelmed, you are not alone.
            </p>
            <p className="mt-1">Safe, confidential helplines are always available.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

//for this this has been told : Take test btn is not visible, of possible can you do relative position according to screensize so that it can be visible in first page.total scrore, weighted score, els score, all doesnt make any sense to me. either tell me how much stressed i am or tell me what is the meaning of each one
