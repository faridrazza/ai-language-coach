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
  is_correct: string;
  expected_sentence: string;
  english_translation: string;
  feedback: string;
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
            const data = await aiApi.submitAudio(blob, sentence.sentence, sentence.english_translation, language);
            setFeedback(data);
          } catch (err: any) {
            console.error('Audio submission error:', err);
            setFeedback({
              transcription: err.message || 'Unable to process audio',
              accuracy_score: 0,
              is_correct: 'incorrect',
              expected_sentence: sentence.sentence,
              english_translation: sentence.english_translation,
              feedback: 'Unable to process audio. Please try again.',
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
      <div className="container mx-auto px-4 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, <span className="text-gradient">{user?.full_name || 'Learner'}</span>
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">Choose a mode to start practicing.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          {[
            { key: 'speak' as const, label: 'Speaking Practice', icon: Mic },
            { key: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'speak' ? (
          <div className="max-w-2xl mx-auto">
            {/* Language Selection */}
            {!language ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold mb-3 text-center">
                  Select Language
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className="glass rounded-lg p-3 text-center text-sm font-medium hover:border-primary/40 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {language}
                    </span>
                    <button
                      onClick={() => { setLanguage(''); setSentence(null); setFeedback(null); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </button>
                  </div>
                  <button
                    onClick={generateSentence}
                    disabled={loadingSentence}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
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
                      className="glass rounded-xl p-4 space-y-3"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Speak this:</p>
                        <p className="text-xl font-semibold">{sentence.sentence}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Translation:</p>
                        <p className="text-sm text-muted-foreground">{sentence.english_translation}</p>
                      </div>

                      {/* Record button */}
                      <div className="flex justify-center pt-1">
                        <button
                          onClick={recording ? stopRecording : startRecording}
                          disabled={loadingFeedback}
                          className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                            recording
                              ? 'bg-destructive text-destructive-foreground animate-pulse'
                              : 'bg-primary text-primary-foreground glow-primary hover:opacity-90'
                          } disabled:opacity-50`}
                        >
                          {recording ? (
                            'Stop Recording'
                          ) : loadingFeedback ? (
                            'Analyzing...'
                          ) : (
                            'Start Speaking'
                          )}
                        </button>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {feedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`rounded-lg p-4 border ${
                              feedback.is_correct === 'correct'
                                ? 'bg-primary/5 border-primary/30'
                                : 'bg-destructive/5 border-destructive/30'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {feedback.is_correct === 'correct' ? (
                                <><CheckCircle2 className="h-5 w-5 text-primary" /> <span className="text-base font-bold text-primary">Correct! 🎉</span></>
                              ) : (
                                <><XCircle className="h-5 w-5 text-destructive" /> <span className="text-base font-bold text-destructive">Try Again</span></>
                              )}
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="bg-background/50 rounded-lg p-2 border border-border">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">What you said:</p>
                                <p className="text-sm font-semibold">{feedback.transcription}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Accuracy Score:</span>
                                <span className="text-base font-bold">{Math.round(feedback.accuracy_score)}%</span>
                              </div>
                              {feedback.is_correct !== 'correct' && (
                                <div className="bg-background/50 rounded-lg p-2 border border-border">
                                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Expected:</p>
                                  <p className="text-sm font-semibold">{feedback.expected_sentence}</p>
                                </div>
                              )}
                              <p className="text-muted-foreground italic pt-1">{feedback.feedback}</p>
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
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
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
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
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
                    <div className="bg-secondary rounded-xl px-3 py-2 text-xs text-muted-foreground">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-border p-2 flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity text-xs"
                >
                  Send
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
