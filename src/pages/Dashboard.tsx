import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { aiApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  Mic, MicOff, Volume2, Globe, ArrowRight, CheckCircle2, XCircle,
  MessageSquare, Sparkles, RotateCcw,
} from 'lucide-react';

const LANGUAGES = ['Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Arabic', 'Chinese'];

interface SentenceData {
  sentence: string;
  english_translation: string;
}

interface FeedbackData {
  transcription: string;
  accuracy_score: number;
  correct: boolean;
  correct_translation: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('');
  const [sentence, setSentence] = useState<SentenceData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [recording, setRecording] = useState(false);
  const [loadingSentence, setLoadingSentence] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'speak' | 'chat'>('speak');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateSentence = async () => {
    if (!language) return;
    setLoadingSentence(true);
    setFeedback(null);
    try {
      const data = await aiApi.generateSentence(language);
      setSentence(data);
    } catch {
      setSentence({ sentence: 'Sample sentence in ' + language, english_translation: 'Sample translation' });
    } finally {
      setLoadingSentence(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        if (sentence) {
          setLoadingFeedback(true);
          try {
            const data = await aiApi.submitAudio(blob, sentence.sentence);
            setFeedback(data);
          } catch {
            setFeedback({
              transcription: 'Unable to process audio',
              accuracy_score: 0,
              correct: false,
              correct_translation: sentence.english_translation,
            });
          } finally {
            setLoadingFeedback(false);
          }
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert('Microphone access is required for speech practice.');
    }
  }, [sentence]);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const data = await aiApi.chat(msg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || data.message || JSON.stringify(data) }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, <span className="text-gradient">{user?.full_name || 'Learner'}</span>
          </h1>
          <p className="text-muted-foreground mb-8">Choose a mode to start practicing.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'speak' as const, label: 'Speaking Practice', icon: Mic },
            { key: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'speak' ? (
          <div className="max-w-2xl">
            {/* Language Selection */}
            {!language ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Select Language
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className="glass rounded-xl p-4 text-center font-medium hover:border-primary/40 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {language}
                    </span>
                    <button
                      onClick={() => { setLanguage(''); setSentence(null); setFeedback(null); }}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Change
                    </button>
                  </div>
                  <button
                    onClick={generateSentence}
                    disabled={loadingSentence}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <Sparkles className="h-4 w-4" />
                    {loadingSentence ? 'Generating...' : sentence ? 'Next Sentence' : 'Generate Sentence'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {sentence && (
                    <motion.div
                      key={sentence.sentence}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="glass rounded-2xl p-6 space-y-4"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Speak this:</p>
                        <p className="text-2xl font-semibold">{sentence.sentence}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Translation:</p>
                        <p className="text-muted-foreground">{sentence.english_translation}</p>
                      </div>

                      {/* Record button */}
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={recording ? stopRecording : startRecording}
                          disabled={loadingFeedback}
                          className={`flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all ${
                            recording
                              ? 'bg-destructive text-destructive-foreground animate-pulse'
                              : 'bg-primary text-primary-foreground glow-primary hover:opacity-90'
                          } disabled:opacity-50`}
                        >
                          {recording ? (
                            <><MicOff className="h-5 w-5" /> Stop Recording</>
                          ) : loadingFeedback ? (
                            'Analyzing...'
                          ) : (
                            <><Mic className="h-5 w-5" /> Start Speaking</>
                          )}
                        </button>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {feedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`rounded-xl p-5 border ${
                              feedback.correct
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-destructive/5 border-destructive/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              {feedback.correct ? (
                                <><CheckCircle2 className="h-6 w-6 text-primary" /> <span className="text-lg font-bold text-primary">Correct! 🎉</span></>
                              ) : (
                                <><XCircle className="h-6 w-6 text-destructive" /> <span className="text-lg font-bold text-destructive">Try Again</span></>
                              )}
                            </div>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted-foreground">You said:</span> {feedback.transcription}</p>
                              <p><span className="text-muted-foreground">Accuracy:</span> {Math.round(feedback.accuracy_score * 100)}%</p>
                              {!feedback.correct && (
                                <p><span className="text-muted-foreground">Correct:</span> {feedback.correct_translation}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          /* AI Chat */
          <div className="max-w-2xl">
            <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Start a conversation with AI...
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border p-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="rounded-lg bg-primary px-4 py-2.5 text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
