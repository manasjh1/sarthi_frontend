"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronRight, Heart, Sparkles, TrendingUp, Brain, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Contextual questions
const contextualQuestions = [
  {
    id: "age",
    question: "Which life chapter are you currently in?",
    helper: "Different stages bring different kinds of emotional patterns.",
    type: "buttons",
    options: ["18-25", "26-35", "36-45", "46+"],
    weight: 0,
  },
  {
    id: "role",
    question: "How do you contribute at work?",
    helper: "Your role shapes what kind of stress you face.",
    type: "buttons",
    options: ["Individual Contributor", "Manager", "Executive"],
    weight: 0,
  },
  {
    id: "workMode",
    question: "Where do you mostly work from?",
    helper: "Environment changes how we connect and communicate.",
    type: "buttons",
    options: ["Remote", "Hybrid", "On-site"],
    weight: 0,
  },
  {
    id: "psySafety",
    question: "How comfortable do you feel sharing your honest feelings at work?",
    helper: "Even the most confident people sometimes hold back.",
    type: "scale",
    min: 1,
    max: 5,
    weight: 0,
  },
];

// Category intros
const categoryIntros = {
  "Emotional Regulation": {
    title: "Emotional Regulation Capacity",
    intro: "Emotions rise like waves - sometimes calm, sometimes stormy. Let's see how you move with them.",
    emoji: "🌊",
  },
  "Cognitive Load": {
    title: "Cognitive Load & Job Demand",
    intro: "Our minds carry invisible to-do lists. Let's understand how heavy yours feels right now.",
    emoji: "🧠",
  },
  "Social Support": {
    title: "Social Support & Psychological Safety",
    intro: "It's easier to breathe when you feel safe. Let's explore how supported you feel.",
    emoji: "🤝",
  },
  "Communication": {
    title: "Communication Friction",
    intro: "Some things we never say. Let's see what's been staying unsaid or misunderstood.",
    emoji: "💬",
  },
  "Physical Wellbeing": {
    title: "Physiological & Behavioral Fatigue",
    intro: "Our bodies whisper long before they scream. Let's listen to what yours might be saying.",
    emoji: "💆",
  },
  "Purpose & Values": {
    title: "Purpose & Value Alignment",
    intro: "When our work aligns with our purpose, everything feels lighter. Let's explore that connection.",
    emoji: "✨",
  },
};

const assessmentQuestions = [
  { category: "Emotional Regulation", question: "I can quickly recognize when my emotions are affecting my behavior", type: "scale", weight: 0.15, reverse: false },
  { category: "Emotional Regulation", question: "When I'm upset, it takes me a long time to calm down", type: "scale", weight: 0.15, reverse: true },
  { category: "Emotional Regulation", question: "I'm able to reframe difficult situations once I cool down", type: "scale", weight: 0.15, reverse: false },
  { category: "Emotional Regulation", question: "I often dwell on negative events long after they're over", type: "scale", weight: 0.15, reverse: true },
  { category: "Cognitive Load", question: "I feel mentally exhausted by the decisions I make daily", type: "scale", weight: 0.2, reverse: true },
  { category: "Cognitive Load", question: "I have enough control over how I prioritize my work", type: "scale", weight: 0.2, reverse: false },
  { category: "Cognitive Load", question: "I'm expected to deliver results faster than I can manage", type: "scale", weight: 0.2, reverse: true },
  { category: "Cognitive Load", question: "My responsibilities are clear and well-defined", type: "scale", weight: 0.2, reverse: false },
  { category: "Social Support", question: "I feel safe expressing my opinions or concerns at work", type: "scale", weight: 0.15, reverse: false },
  { category: "Social Support", question: "If I make a mistake, I'm treated with respect and understanding", type: "scale", weight: 0.15, reverse: false },
  { category: "Social Support", question: "There is at least one colleague I can talk to when I'm emotionally drained", type: "scale", weight: 0.15, reverse: false },
  { category: "Social Support", question: "I often feel isolated even when surrounded by colleagues", type: "scale", weight: 0.15, reverse: true },
  { category: "Communication", question: "There are things I want to say at work but hold back because I fear consequences", type: "scale", weight: 0.2, reverse: true },
  { category: "Communication", question: "I often feel my tone or words are misunderstood by others", type: "scale", weight: 0.2, reverse: true },
  { category: "Communication", question: "I sometimes say things I don't mean just to avoid conflict", type: "scale", weight: 0.2, reverse: true },
  { category: "Communication", question: "When I express difficult emotions, I feel genuinely heard", type: "scale", weight: 0.2, reverse: false },
  { category: "Physical Wellbeing", question: "I often wake up feeling tired even after a full night's sleep", type: "scale", weight: 0.15, reverse: true },
  { category: "Physical Wellbeing", question: "My body shows stress signs (headaches, tension, appetite changes)", type: "scale", weight: 0.15, reverse: true },
  { category: "Physical Wellbeing", question: "I've noticed myself becoming unusually irritable or impatient", type: "scale", weight: 0.15, reverse: true },
  { category: "Physical Wellbeing", question: "I take time to rest or recharge during the day", type: "scale", weight: 0.15, reverse: false },
  { category: "Purpose & Values", question: "I feel that my work contributes to something meaningful", type: "scale", weight: 0.15, reverse: false },
  { category: "Purpose & Values", question: "The way my team operates aligns with my personal values", type: "scale", weight: 0.15, reverse: false },
  { category: "Purpose & Values", question: "I feel like a replaceable part rather than a valued contributor", type: "scale", weight: 0.15, reverse: true },
  { category: "Purpose & Values", question: "I have opportunities to grow and use my strengths at work", type: "scale", weight: 0.15, reverse: false },
];

export default function EmotionalLoadTest() {
  const [stage, setStage] = useState(0); // 0: Landing, 1: Context, 2: Assessment, 3: Results
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [scaleValue, setScaleValue] = useState(3);
  const [contextData, setContextData] = useState<Record<string, any>>({});
  const [assessmentData, setAssessmentData] = useState<number[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [showCategoryIntro, setShowCategoryIntro] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Auto-proceed for category intros
  useEffect(() => {
    if (stage === 2 && showCategoryIntro) {
      const currentQ = assessmentQuestions[currentQuestionIndex];
      const timer = setTimeout(() => {
        setShowCategoryIntro(false);
        setMessages([]);
        setTimeout(() => {
          showAssistantMessage(currentQ.question);
        }, 500);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [stage, showCategoryIntro, currentQuestionIndex]);

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
      if (i >= text.length) clearInterval(interval);
    }, 15);
  };

  const handleContextResponse = (response: string) => {
    addMessage(response, "user");
    const currentQ = contextualQuestions[currentQuestionIndex];
    setContextData((prev) => ({ ...prev, [currentQ.id]: response }));

    if (currentQuestionIndex < contextualQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeout(() => {
        const nextQ = contextualQuestions[currentQuestionIndex + 1];
        showAssistantMessage(nextQ.question);
      }, 800);
    } else {
      setTimeout(() => {
        showAssistantMessage("Beautiful. Now let's explore how you're feeling lately.");
        setTimeout(() => {
          setStage(2);
          setCurrentQuestionIndex(0);
          setMessages([]);
          setShowCategoryIntro(true);
        }, 2000);
      }, 800);
    }
  };

  const calculateScore = (value: number, question: any) => {
    let normalizedValue = question.reverse ? (6 - value) : value;
    return ((normalizedValue - 1) / 4) * 100 * question.weight;
  };

  const handleAssessmentResponse = (value: number) => {
    addMessage(`${value}`, "user");
    
    const currentQ = assessmentQuestions[currentQuestionIndex];
    const score = calculateScore(value, currentQ);
    
    setCategoryScores((prev) => ({
      ...prev,
      [currentQ.category]: (prev[currentQ.category] || 0) + score,
    }));
    
    setAssessmentData((prev) => [...prev, value]);
    setTotalScore((prev) => prev + score);

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      const nextQ = assessmentQuestions[currentQuestionIndex + 1];
      const needsCategoryIntro = currentQ.category !== nextQ.category;
      
      setCurrentQuestionIndex((prev) => prev + 1);
      
      if (needsCategoryIntro) {
        setShowCategoryIntro(true);
        // Auto-proceed after 3 seconds
        setTimeout(() => {
          setShowCategoryIntro(false);
          setMessages([]);
          setTimeout(() => {
            showAssistantMessage(nextQ.question);
          }, 500);
        }, 3000);
      } else {
        setTimeout(() => {
          showAssistantMessage(nextQ.question);
        }, 800);
      }
    } else {
      setTimeout(() => {
        showAssistantMessage("That's it! You just gave your emotions the attention they deserve. Let's see what they're trying to tell you.");
        setTimeout(() => {
          setStage(3);
        }, 2500);
      }, 800);
    }
  };

  const getZone = (score: number) => {
    if (score <= 25) return { 
      name: "Green", 
      color: "from-green-500 to-emerald-500", 
      bgColor: "bg-green-500",
      desc: "Low emotional load",
      message: "You're carrying your emotional load well. That invisible weight? You're managing it beautifully."
    };
    if (score <= 50) return { 
      name: "Yellow", 
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500",
      desc: "Moderate emotional load",
      message: "You're carrying a moderate emotional load. Some things might feel heavy, but you're not alone in this."
    };
    if (score <= 75) return { 
      name: "Red", 
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500",
      desc: "High emotional load",
      message: "You're carrying a high emotional load - mostly from communication friction and mental overload. That doesn't mean something is wrong with you."
    };
    return { 
      name: "Red+", 
      color: "from-red-700 to-red-900",
      bgColor: "bg-red-700",
      desc: "Critical emotional load",
      message: "You're in a critical state. Please prioritize your wellbeing - you deserve support, and it's available."
    };
  };

  // Stage 0: Landing Page (Sarthi Theme)
  if (stage === 0) {
    return (
      <div className="min-h-screen bg-[#121212] relative overflow-hidden">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Sarthi Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-normal text-white leading-tight">
              Understand your<br />
              <span className="text-white/70">Emotional Load</span>
            </h1>

            {/* Subheadline */}
            <div className="max-w-2xl mx-auto space-y-4 text-lg text-[#cbd5e1] leading-relaxed">
              <p>
                Everyone carries an invisible weight - unspoken feelings, misunderstood moments.
              </p>
              <p className="text-white/90">
                We call this <span className="text-white">Emotional Load</span>.
              </p>
            </div>

            {/* Value Props */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                <Brain className="w-8 h-8 text-white/80 mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-2">5-Minute Test</h3>
                <p className="text-[#cbd5e1] text-sm">Quick assessment</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                <TrendingUp className="w-8 h-8 text-white/80 mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-2">Personal Score</h3>
                <p className="text-[#cbd5e1] text-sm">Understand your state</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/5">
                <MessageCircle className="w-8 h-8 text-white/80 mb-3 mx-auto" />
                <h3 className="text-white font-normal mb-2">Guided Relief</h3>
                <p className="text-[#cbd5e1] text-sm">Express what's hard</p>
              </div>
            </div>

            {/* CTA - Sarthi Button Style */}
            <div className="pt-8">
              <button
                onClick={() => {
                  setStage(1);
                  setMessages([]);
                  setTimeout(() => {
                    showAssistantMessage("Before we begin, let's understand a little about your world - so we can interpret your emotional load in the right light.");
                    setTimeout(() => {
                      showAssistantMessage(contextualQuestions[0].question);
                    }, 2500);
                  }, 500);
                }}
                className="px-10 py-4 bg-white text-black text-lg font-normal rounded-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                Take the Test
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stage 1: Context Section (Sarthi Theme)
  if (stage === 1) {
    const currentQ = contextualQuestions[currentQuestionIndex];
    
    return (
      <div className="h-screen bg-[#121212] flex flex-col">
        <div className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">💭</span>
            </div>
            <div className="flex-1">
              <h1 className="text-white font-normal text-xl">Getting to Know You</h1>
              <p className="text-white/60 text-sm">Context for compassion</p>
            </div>
            <div className="text-white/40 text-sm">
              {currentQuestionIndex + 1} / {contextualQuestions.length}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">💭</span>
                  </div>
                )}
                <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${
                  msg.role === "user"
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
                  <span className="text-sm">💭</span>
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

        {!isThinking && currentQ && (
          <div className="border-t border-white/5 p-4 backdrop-blur-sm bg-black/20">
            <div className="max-w-3xl mx-auto">
              {currentQ.helper && (
                <p className="text-white/50 text-sm mb-3 text-center">{currentQ.helper}</p>
              )}
              
              {currentQ.type === "buttons" && (
                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleContextResponse(opt)}
                      className="px-6 py-3 bg-white text-black rounded-xl font-normal transition-all transform hover:scale-105"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              
              {currentQ.type === "scale" && (
                <div className="space-y-4">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Not comfortable</span>
                    <span>Very comfortable</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={scaleValue}
                    onChange={(e) => setScaleValue(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-normal ${
                        scaleValue === num ? "bg-white text-black scale-125" : "bg-white/10 text-white/40"
                      } transition-all`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleContextResponse(`${scaleValue}`)}
                    className="w-full px-6 py-3 bg-white text-black rounded-xl font-normal transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stage 2: Assessment Section (Sarthi Theme)
  if (stage === 2) {
    const currentQ = assessmentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    const categoryInfo = categoryIntros[currentQ?.category as keyof typeof categoryIntros];

    // Show category intro screen (auto-proceed after 3 seconds)
    if (showCategoryIntro && categoryInfo) {
      return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center space-y-6">
            <div className="text-6xl mb-4">{categoryInfo.emoji}</div>
            <h2 className="text-3xl font-normal text-white">{categoryInfo.title}</h2>
            <p className="text-xl text-[#cbd5e1] leading-relaxed italic">
              "{categoryInfo.intro}"
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-[#121212] flex flex-col">
        <div className="border-b border-white/5 p-4 backdrop-blur-sm bg-black/20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-2xl">{categoryInfo?.emoji}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-white font-normal text-xl">Emotional Load Assessment</h1>
                <p className="text-white/60 text-sm">{currentQ?.category || "Assessment"}</p>
              </div>
              <div className="text-white/40 text-sm">
                {currentQuestionIndex + 1} / {assessmentQuestions.length}
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

        <div className="flex-1 overflow-y-auto p-4">
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
                    <span className="text-sm">💭</span>
                  </div>
                )}
                <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${
                  msg.role === "user"
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
                  <span className="text-sm">💭</span>
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

        {!isThinking && currentQ && (
          <div className="border-t border-white/5 p-4 backdrop-blur-sm bg-black/20">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex justify-between text-white/60 text-sm px-2">
                <span className="flex items-center gap-1">😌 Strongly Disagree</span>
                <span className="flex items-center gap-1">Strongly Agree 😫</span>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleAssessmentResponse(num)}
                      className="w-16 h-16 rounded-full flex items-center justify-center font-normal text-lg bg-white/10 hover:bg-white hover:text-black text-white border-2 border-white/5 hover:border-white transition-all transform hover:scale-110 active:scale-95"
                    >
                      {num}
                    </button>
                    <span className="text-2xl">
                      {num === 1 && "😌"}
                      {num === 2 && "🙂"}
                      {num === 3 && "😐"}
                      {num === 4 && "😟"}
                      {num === 5 && "😫"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Stage 3: Results Section (Sarthi Theme)
  if (stage === 3) {
    const zone = getZone(totalScore);
    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-3xl w-full space-y-6">
          {/* Score Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 p-8">
            <h2 className="text-2xl font-normal text-white text-center mb-8">
              Here's what your emotions are saying right now.
            </h2>
            
            <div className="text-center mb-8">
              <div className={`w-56 h-56 mx-auto rounded-full bg-gradient-to-br ${zone.color} flex items-center justify-center mb-6 relative`}>
                <div className="relative">
                  <div className="text-6xl font-normal text-white">{Math.round(totalScore)}</div>
                  <div className="text-white/90 text-base mt-2 font-normal">Your Emotional Load</div>
                </div>
              </div>
              <div className={`inline-block px-6 py-2 rounded-full ${zone.bgColor} text-white font-normal text-lg mb-3`}>
                {zone.name} Zone
              </div>
              <p className="text-white/70 text-lg">{zone.desc}</p>
            </div>

            {/* What this means */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6">
              <h3 className="text-white font-normal text-lg mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/60" />
                What this means
              </h3>
              <p className="text-[#cbd5e1] leading-relaxed">
                {zone.message}
              </p>
              {totalScore > 50 && (
                <p className="text-[#cbd5e1] leading-relaxed mt-3">
                  It means you've been feeling deeply and managing a lot - maybe without enough space to express it.
                </p>
              )}
            </div>

            {/* Top stress drivers */}
            {topCategories.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/5 mb-6">
                <h3 className="text-white font-normal text-lg mb-4">Your Emotional Landscape</h3>
                <div className="space-y-3">
                  {topCategories.map(([category, score], idx) => {
                    const categoryInfo = categoryIntros[category as keyof typeof categoryIntros];
                    const percentage = (score / totalScore) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/90 text-sm flex items-center gap-2">
                            <span>{categoryInfo?.emoji}</span>
                            {category}
                            {idx === 0 && <span className="text-xs text-yellow-400">(Highest)</span>}
                          </span>
                          <span className="text-white/60 text-sm">{Math.round(score)}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${
                              idx === 0 ? 'from-red-500 to-orange-500' : 'from-yellow-500 to-amber-500'
                            } transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {topCategories[0] && (
                  <p className="text-[#cbd5e1] text-sm mt-4 italic">
                    {topCategories[0][0]} seems highest - that's where relief will bring the biggest change.
                  </p>
                )}
              </div>
            )}

            {/* Sarthi CTA */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
              <h3 className="text-white font-normal text-lg mb-3">That's where Sarthi can help</h3>
              <p className="text-[#cbd5e1] mb-4 leading-relaxed">
                Sarthi is tuned to lighten this exact kind of weight. Let's express what feels unsaid - safely, clearly, and in your own way.
              </p>
              <button className="w-full px-6 py-4 bg-white text-black rounded-xl font-normal transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                Talk to Sarthi
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Additional options */}
          <div className="grid md:grid-cols-2 gap-4">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-normal transition-all border border-white/5">
              Save my results
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-normal transition-all border border-white/5"
            >
              Retake Test
            </button>
          </div>

          {/* Safety note */}
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