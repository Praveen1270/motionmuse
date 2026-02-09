
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Mic, 
  Activity, 
  Settings, 
  History, 
  Play, 
  Square, 
  User, 
  Award,
  Zap,
  LayoutDashboard,
  BrainCircuit
} from 'lucide-react';
import { 
  PerformanceType, 
  SkillLevel, 
  FeedbackMarker, 
  TechniqueIssue, 
  PerformanceAnalysis,
  SessionHistory
} from './types';
import { analyzePerformanceFrame, generateCoachReport } from './services/geminiService';
import Overlay from './components/Overlay';
import FeedbackFeed from './components/FeedbackFeed';
import Dashboard from './components/Dashboard';

const SAMPLE_HISTORY: SessionHistory[] = [
  { id: '1', date: 'Oct 20', type: PerformanceType.BALLET, score: 6.2, technique: 5.8, timing: 6.5, expression: 7.0 },
  { id: '2', date: 'Oct 22', type: PerformanceType.BALLET, score: 6.5, technique: 6.0, timing: 6.8, expression: 7.2 },
  { id: '3', date: 'Oct 25', type: PerformanceType.BALLET, score: 7.1, technique: 6.5, timing: 7.5, expression: 7.5 },
  { id: '4', date: 'Oct 28', type: PerformanceType.BALLET, score: 7.4, technique: 7.2, timing: 7.2, expression: 8.0 },
  { id: '5', date: 'Nov 02', type: PerformanceType.BALLET, score: 7.8, technique: 7.5, timing: 8.1, expression: 7.8 },
];

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [view, setView] = useState<'live' | 'dashboard' | 'report'>('live');
  const [performanceType, setPerformanceType] = useState<PerformanceType>(PerformanceType.BALLET);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [activeMarkers, setActiveMarkers] = useState<FeedbackMarker[]>([]);
  const [issues, setIssues] = useState<TechniqueIssue[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [coachReport, setCoachReport] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 },
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !isRecording) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    const result = await analyzePerformanceFrame(base64Image, performanceType, skillLevel);
    
    if (result) {
      setOverallScore(result.overall_score);
      setIssues(prev => [
        ...result.technique_issues.map(i => ({ ...i, timestamp: new Date().toLocaleTimeString() })),
        ...prev
      ].slice(0, 50));
      
      const newMarkers = result.technique_issues
        .filter(i => i.visual_marker)
        .map(i => i.visual_marker!);
      
      setActiveMarkers(newMarkers);
      // Clear markers after 2 seconds to avoid clutter
      setTimeout(() => setActiveMarkers([]), 2000);
    }
  }, [isRecording, performanceType, skillLevel]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = window.setInterval(captureAndAnalyze, 4000); // Analyze every 4 seconds
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setActiveMarkers([]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, captureAndAnalyze]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setIssues([]);
      setOverallScore(0);
    }
  };

  const handleGenerateReport = async () => {
    setView('report');
    setCoachReport('Analyzing your history...');
    const report = await generateCoachReport(SAMPLE_HISTORY);
    setCoachReport(report);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic uppercase">Artemis <span className="text-blue-500 text-sm align-top">AI</span></h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setView('live')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-400'}`}
          >
            <Activity size={18} /> Live Stage
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-400'}`}
          >
            <LayoutDashboard size={18} /> Insights
          </button>
          <button 
            onClick={handleGenerateReport}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${view === 'report' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10 text-gray-400'}`}
          >
            <BrainCircuit size={18} /> AI Coach
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">User Profile</span>
            <span className="text-sm font-bold text-blue-400">Master Soloist</span>
          </div>
          <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <User size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {view === 'live' && (
          <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
            {/* Stage Area */}
            <div className="flex-1 relative bg-neutral-900 group">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
              <Overlay markers={activeMarkers} width={window.innerWidth} height={window.innerHeight} />
              
              {/* Overlays UI */}
              <div className="absolute top-6 left-6 flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="font-mono text-sm tracking-widest font-bold">
                    {isRecording ? 'RECORDING_ACTIVE' : 'IDLE_WAITING'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                    <span className="block text-[10px] font-black text-blue-500 uppercase tracking-widest">Performance</span>
                    <select 
                      value={performanceType} 
                      onChange={(e) => setPerformanceType(e.target.value as PerformanceType)}
                      className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                    >
                      {Object.values(PerformanceType).map(t => <option key={t} value={t} className="bg-neutral-900">{t}</option>)}
                    </select>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                    <span className="block text-[10px] font-black text-violet-500 uppercase tracking-widest">Skill Level</span>
                    <select 
                      value={skillLevel} 
                      onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                      className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                    >
                      {Object.values(SkillLevel).map(l => <option key={l} value={l} className="bg-neutral-900">{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Score Indicator */}
              <div className="absolute top-6 right-6">
                <div className="bg-blue-600 shadow-2xl shadow-blue-500/40 rounded-3xl p-6 text-center border-2 border-white/20 animate-in zoom-in duration-500">
                  <span className="block text-[10px] font-black text-blue-100 uppercase tracking-tighter mb-1">Live Score</span>
                  <div className="text-5xl font-black italic">{overallScore.toFixed(1)}</div>
                  <span className="text-[10px] font-bold text-blue-200">OUT OF 10</span>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6">
                <button 
                  onClick={toggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl transform active:scale-95 ${
                    isRecording 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50' 
                    : 'bg-white hover:bg-gray-200 shadow-white/20'
                  }`}
                >
                  {isRecording ? <Square className="text-white fill-white" size={32} /> : <Play className="text-black fill-black ml-1" size={32} />}
                </button>
                
                <div className="flex gap-4">
                  <button className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10">
                    <Camera size={20} />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10">
                    <Mic size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback Panel */}
            <aside className="w-full lg:w-[400px] border-l border-white/10 flex flex-col bg-neutral-900/50">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-black italic uppercase flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" /> 
                  Real-time Feedback
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Temporal Analysis (Gemini 3)</p>
              </div>
              <FeedbackFeed issues={issues} />
            </aside>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto py-12 px-6">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Growth Metrics</h2>
                <p className="text-gray-400 mt-2 font-medium">Tracking your artistic evolution across the last 5 sessions.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Award className="text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase">Avg Score</span>
                    <div className="text-xl font-black">7.0</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <History className="text-blue-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase">Practiced</span>
                    <div className="text-xl font-black">12.5h</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Dashboard history={SAMPLE_HISTORY} />
          </div>
        )}

        {view === 'report' && (
          <div className="max-w-3xl mx-auto py-16 px-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-violet-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BrainCircuit size={40} className="text-violet-500" />
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">AI Coaching Analysis</h2>
              <p className="text-gray-400 mt-2">Deep-context coaching powered by Gemini Pro.</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 prose prose-invert max-w-none shadow-2xl">
              {coachReport.split('\n').map((line, i) => (
                <p key={i} className="mb-4 text-gray-300 leading-relaxed text-lg">
                  {line}
                </p>
              ))}
              
              {!coachReport && (
                 <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synthesizing Session Data...</span>
                 </div>
              )}
            </div>

            <button 
              onClick={() => setView('live')}
              className="mt-12 w-full py-5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl font-black uppercase italic tracking-widest text-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all transform hover:-translate-y-1"
            >
              Start Next Practice Session
            </button>
          </div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 px-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/80 backdrop-blur-sm sticky bottom-0 z-50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> System Online</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Gemini-3 Flash Connected</span>
        </div>
        <div>
          &copy; 2024 Artemis Performance Systems
        </div>
      </footer>
    </div>
  );
};

export default App;
