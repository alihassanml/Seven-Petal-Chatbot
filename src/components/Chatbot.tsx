import { useState, useRef, useEffect } from 'react';
import { Send, Home, MessageCircle, HelpCircle, Phone, Mail, Calendar, ChevronRight, Wrench } from 'lucide-react';

type Message = {
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
};

type Screen = 'home' | 'chat' | 'faq' | 'appointment';

const WELCOME_MESSAGE = `Hi! Welcome to Adams Heating & Cooling. How can we help you today?`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [screen, setScreen] = useState<Screen>('home');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingMessage, setTypingMessage] = useState<string | null>(null);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [botBusy, setBotBusy] = useState(false);
  const [hasLoadedWelcome, setHasLoadedWelcome] = useState(false);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [userId] = useState(() => {
    const existing = sessionStorage.getItem("adams_user_id");
    if (existing) return existing;
    const random = `user_${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem("adams_user_id", random);
    return random;
  });

  useEffect(() => {
    const savedMessages = sessionStorage.getItem(`chat_messages_${userId}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setHasLoadedWelcome(true);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (screen === 'chat' && messages.length === 0 && !hasLoadedWelcome) {
      setMessages([{
        type: 'bot',
        text: WELCOME_MESSAGE,
        timestamp: new Date()
      }]);
      setHasLoadedWelcome(true);
    }
  }, [screen, messages.length, hasLoadedWelcome]);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(`chat_messages_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  const faqData = [
    {
      question: "What services does Adams Heating & Cooling provide?",
      answer: "We provide comprehensive HVAC services including installation, repair, maintenance, and replacement for heating and air conditioning systems. We serve residential and commercial properties in Tuscaloosa and Birmingham, AL."
    },
    {
      question: "Do you offer emergency repair services?",
      answer: "Yes! We offer 24/7 emergency HVAC services for urgent heating and cooling issues. Call us immediately at (205) 462-8303 for emergency assistance."
    },
    {
      question: "How do I know if my AC or heating system needs repair?",
      answer: "Common warning signs include unusual noises, weak airflow, inconsistent temperatures, higher energy bills, frequent cycling, strange odors, or moisture around the unit. Contact us for a professional inspection if you notice any of these issues."
    },
    {
      question: "How can I schedule a service appointment?",
      answer: "You can schedule service by calling us at (205) 462-8303, using our online booking system, emailing info@adamssvcs.com, or chatting with us here. We offer flexible scheduling to accommodate your needs."
    },
    {
      question: "Do you install energy-efficient HVAC systems?",
      answer: "Absolutely! We specialize in installing modern, energy-efficient HVAC systems that can significantly reduce your energy costs while keeping you comfortable year-round. We can recommend the best options for your home or business."
    },
    {
      question: "What areas do you serve?",
      answer: "We proudly serve Tuscaloosa, Birmingham, and the surrounding metro areas in Alabama. Our main offices are located in Tuscaloosa (3415 Hargrove Road East) and Birmingham (1236 Blue Ridge Blvd, Suite 111, Hoover)."
    },
    {
      question: "How often should I have my HVAC system serviced?",
      answer: "We recommend having your HVAC system serviced at least twice a year - once before the cooling season and once before the heating season. Regular maintenance helps prevent breakdowns, improves efficiency, and extends the life of your system."
    },
    {
      question: "What is your experience and how long have you been in business?",
      answer: "Adams Heating & Cooling brings over 35 years of experience and an unwavering commitment to exceptional customer service. Our highly trained technicians and expert staff are dedicated to ensuring your comfort year-round."
    },
    {
      question: "Do you offer maintenance plans or service contracts?",
      answer: "Yes! We offer comprehensive maintenance plans that include regular inspections, priority service, discounts on repairs, and peace of mind knowing your system is running efficiently. Contact us for details on our maintenance programs."
    },
    {
      question: "What brands of HVAC equipment do you work with?",
      answer: "We work with all major HVAC brands and use only the best equipment to ensure your comfort and satisfaction. Our technicians are experienced with a wide range of systems and can recommend the best options for your specific needs."
    },
    {
      question: "Are you licensed and insured?",
      answer: "Yes, Adams Heating & Cooling is fully licensed and insured. We maintain all necessary certifications and insurance to protect you and your property while providing top-quality HVAC services."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including cash, checks, and major credit cards. We also offer financing options for larger installations and replacements. Contact us to discuss payment options that work best for you."
    }
  ];

  const quickActions = [
    
    {
      icon: MessageCircle,
      title: "Start a Chat",
      subtitle: "Get instant help from our team",
      action: () => setScreen('chat'),
      gradient: "from-gray-700 to-gray-800"
    },
   
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "info@adamssvcs.com",
      action: () => window.open('mailto:info@adamssvcs.com'),
      gradient: "from-gray-600 to-gray-700"
    }
  ];

  const handleBotResponse = async (userMessage: string) => {
    setBotBusy(true);
    setTypingMessage("Support agent is typing...");

    try {
      const response = await fetch("https://auto.robogrowthpartners.com/webhook/adam-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: userMessage })
      });

      const data = await response.json();
      const replies = (data.reply || "").split("\\k").filter((part: string) => part.trim() !== "");

      if (replies.length === 0) {
        replies.push("Thank you for contacting Adams Heating & Cooling. How can we help you today?");
      }

      for (let i = 0; i < replies.length; i++) {
        if (i > 0) {
          setTypingMessage("Support agent is typing...");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setTypingMessage(null);
        setMessages(prev => [...prev, {
          type: 'bot',
          text: replies[i].trim(),
          timestamp: new Date()
        }]);

        if (i < replies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

    } catch (error) {
      console.error('Webhook error:', error);
      setTypingMessage(null);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "I apologize for the inconvenience. Please contact us directly at (205) 462-8303 for immediate assistance.",
        timestamp: new Date()
      }]);
    }

    setBotBusy(false);
    setMessageQueue(prev => {
      const [nextMessage, ...rest] = prev;
      if (nextMessage) {
        setTimeout(() => handleBotResponse(nextMessage), 2000);
      }
      return rest;
    });
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      type: 'user',
      text: message,
      timestamp: new Date()
    }]);

    if (botBusy) {
      setMessageQueue(prev => [...prev, message]);
    } else {
      await handleBotResponse(message);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setScreen('chat');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'user',
        text: question,
        timestamp: new Date()
      }]);
      handleBotResponse(question);
    }, 300);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingMessage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Bold: **text** or __text__
    let parsed = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    parsed = parsed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links: [text](url)
    parsed = parsed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>');

    // Line breaks
    parsed = parsed.replace(/\n/g, '<br />');

    return parsed;
  };

  if (!isOpen) return null;


 


  return (
    <div className="fixed right-0 bottom-0 w-full sm:w-[450px] md:w-[450px] lg:w-[450px] shadow-2xl z-50">
      <div
        className="bg-white overflow-hidden border border-gray-200 shadow-xl"
        style={{
          height: 'min(85vh, 750px)',
          maxHeight: '85vh',
          minHeight: '500px',
          borderRadius: "25px",
          border: "none"
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Black/Gray Gradient */}
          <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 ${screen === 'home' ? 'pb-8' : ''}`} style={{ borderRadius: '25px 25px 0 0', border: "none" }}>
            {/* Animated Background Effects */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"
                style={{
                  top: '20%',
                  right: '10%',
                  animation: 'energyPulse 4s ease-in-out infinite'
                }}></div>
              <div className="absolute w-32 h-32 bg-gray-400 rounded-full blur-2xl animate-pulse"
                style={{
                  bottom: '10%',
                  left: '15%',
                  animation: 'energyPulse 5s ease-in-out infinite',
                  animationDelay: '1s'
                }}></div>
              <div className="absolute w-24 h-24 bg-gray-500 rounded-full blur-xl animate-pulse"
                style={{
                  top: '50%',
                  left: '50%',
                  animation: 'energyPulse 3s ease-in-out infinite',
                  animationDelay: '2s'
                }}></div>
            </div>

            {/* Header Content */}
            <div className={`relative z-10 text-white ${screen === 'home' ? 'p-5 sm:p-6 pb-0' : 'p-4 sm:p-5'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
                    <div className="text-xl sm:text-2xl font-bold text-slate-800">A</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl tracking-wide">Adams HVAC</h3>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm opacity-90">
                      <span className="text-gray-300">❄️ Online Now</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs sm:text-sm opacity-90 text-gray-200">
                {screen === 'home' && "👋 Expert Heating & Cooling Services in Alabama"}
                {screen === 'chat' && "💬 We typically respond within seconds"}
                {screen === 'faq' && "❓ Quick answers to common questions"}
                {screen === 'appointment' && "📅 Schedule your service appointment"}
              </div>

              {screen === 'home' && (
                <div className="mt-2 sm:mt-3">
                  <p className="text-sm sm:text-base opacity-80 leading-relaxed text-gray-200">
                    Over 35 years of experience • Licensed & Insured
                  </p>
                </div>
              )}
            </div>

            <style>{`
              @keyframes energyPulse {
                0%, 100% { 
                  transform: scale(1) translateY(0px); 
                  opacity: 0.3;
                }
                50% { 
                  transform: scale(1.2) translateY(-10px); 
                  opacity: 0.6;
                }
              }
            `}</style>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {/* HOME SCREEN */}
            {screen === 'home' && (
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                
                <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="text-center mb-3 sm:mb-4">
                    <h4 className="text-1xl sm:text-2xl font-bold text-slate-800 mb-2">
                      How Can We Help?
                    </h4>
                    <p className="text-gray-600 text-sm sm:text-base">Professional HVAC services at your fingertips</p>
                  </div>
<br />
                  <div className="space-y-2 sm:space-y-3 ">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={action.action}
                          className="w-full p-3 sm:p-4 bg-white hover:bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 text-left group hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800 text-base sm:text-lg">{action.title}</h5>
                                <p className="text-sm sm:text-base text-gray-600 mt-0.5">{action.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-700 transition-all duration-300 group-hover:translate-x-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300">
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Wrench className="w-5 h-5 text-slate-700 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm sm:text-base mb-1">24/7 Emergency Service Available</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          HVAC emergencies? We're here to help anytime. Call us immediately at (205) 462-8303
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT SCREEN */}
            {screen === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[80%]`}>
                        <div className={`flex items-end space-x-2 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${msg.type === 'user'
                            ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                            : 'bg-gradient-to-br from-slate-700 to-slate-900'
                            }`}>
                            <span className="text-white text-xs font-bold">
                              {msg.type === 'user' ? 'U' : 'A'}
                            </span>
                          </div>
                          <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md ${msg.type === 'user'
                            ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 rounded-bl-sm border border-gray-200'
                            }`}>
                            <div
                              className="text-sm sm:text-base leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                            />
                          </div>
                        </div>
                        <p className={`text-xs sm:text-sm text-gray-500 mt-1 px-8 sm:px-10 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {typingMessage && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <div className="bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-sm shadow-md border border-gray-200">
                          <div className="flex space-x-1.5">
                            <div className="w-2 h-2 bg-slate-700 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-2 h-2 bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-white">
                  <div className="flex space-x-2 sm:space-x-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3.5 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-50 shadow-sm text-sm sm:text-base"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || botBusy}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ SCREEN */}
            {screen === 'faq' && (
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent p-3 sm:p-4 bg-gray-50">
                <div className="space-y-2 sm:space-y-3">
                  {faqData.map((faq, index) => (
                    <details key={index} className="group">
                      <summary className="flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 hover:border-gray-400">
                        <h5 className="font-semibold text-slate-800 text-sm sm:text-base pr-3 sm:pr-4">{faq.question}</h5>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-open:rotate-90 transition-transform duration-300 flex-shrink-0" />
                      </summary>
                      <div className="p-3 sm:p-4 pt-2 sm:pt-3 bg-white border-x border-b border-gray-200 rounded-b-xl mt-0.5">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                        <button
                          onClick={() => handleQuickQuestion(faq.question)}
                          className="mt-2 sm:mt-3 text-sm text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 sm:w-4 sm:h-4" />
                          <span>Ask this in chat →</span>
                        </button>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* APPOINTMENT SCREEN */}
           

          </div>

          {/* Footer Navigation */}
          <div className="border-t-2 border-gray-200 bg-white">
            <div className="flex">
              {[
                { icon: Home, label: 'Home', screen: 'home' as Screen },
                { icon: MessageCircle, label: 'Chat', screen: 'chat' as Screen },
                { icon: HelpCircle, label: 'FAQ', screen: 'faq' as Screen }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = screen === item.screen;

                return (
                  <button
                    key={item.screen}
                    onClick={() => setScreen(item.screen)}
                    className={`flex-1 p-3 sm:p-4 flex flex-col items-center space-y-1 transition-all duration-300 relative ${isActive
                      ? 'text-slate-800 bg-gray-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isActive ? 'text-slate-800 scale-110' : 'text-gray-500'
                      }`} />
                    <span className={`text-xs sm:text-sm font-semibold transition-colors ${isActive ? 'text-slate-800' : 'text-gray-500'
                      }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 sm:w-12 h-1 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;