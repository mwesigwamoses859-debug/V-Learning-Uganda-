import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Flame, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  Check, 
  XCircle, 
  Gamepad2, 
  Users, 
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';
import { KAHOOT_SAMPLE_QUESTIONS } from '../data/mockData';
import { sound } from '../utils/sound';

interface KahootQuizModalProps {
  questions?: QuizQuestion[];
  quizTitle?: string;
  onClose: () => void;
}

export const KahootQuizModal: React.FC<KahootQuizModalProps> = ({
  questions = KAHOOT_SAMPLE_QUESTIONS,
  quizTitle = 'Uganda Kahoot Revision Challenge',
  onClose,
}) => {
  const [gameMode, setGameMode] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [pinInput, setPinInput] = useState('');
  const [playerName, setPlayerName] = useState('Learner Moses');

  // Quiz progression states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Timer: 30 seconds per question
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = questions[currentIndex] || questions[0];

  // Start timer on new question
  useEffect(() => {
    if (gameMode !== 'playing' || isAnswerRevealed) return;

    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        if (prev <= 6) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, gameMode, isAnswerRevealed]);

  const handleTimeUp = () => {
    setIsAnswerRevealed(true);
    setSelectedOption(-1); // Timed out
    setStreak(0);
    sound.playWrong();
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(idx);
    setIsAnswerRevealed(true);

    const isCorrect = idx === currentQ.correctAnswerIndex;

    if (isCorrect) {
      sound.playCorrect();
      const speedBonus = Math.round((timeLeft / 30) * 500);
      const streakBonus = streak * 100;
      const questionPoints = 500 + speedBonus + streakBonus;

      setScore((prev) => prev + questionPoints);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setCorrectCount((prev) => prev + 1);
    } else {
      sound.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      // Game finished!
      setGameMode('gameover');
      sound.playFanfare();
      // Launch confetti celebration
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setGameMode('playing');
  };

  const toggleSound = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  };

  // Kahoot 4 Shape Options Config
  const kahootOptions = [
    {
      colorBg: 'bg-red-600 hover:bg-red-700',
      colorRing: 'ring-red-400',
      shape: '▲',
      label: 'Triangle',
    },
    {
      colorBg: 'bg-blue-600 hover:bg-blue-700',
      colorRing: 'ring-blue-400',
      shape: '◆',
      label: 'Diamond',
    },
    {
      colorBg: 'bg-amber-500 hover:bg-amber-600',
      colorRing: 'ring-amber-400',
      shape: '●',
      label: 'Circle',
    },
    {
      colorBg: 'bg-emerald-600 hover:bg-emerald-700',
      colorRing: 'ring-emerald-400',
      shape: '■',
      label: 'Square',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-purple-800/50 flex flex-col min-h-[580px] max-h-[92vh]">
        
        {/* Top Game Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-purple-950/80 border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-800 text-pink-300 flex items-center justify-center font-black">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white">
                  Kahoot Arena
                </span>
                <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Uganda
                </span>
              </div>
              <p className="text-xs text-purple-300 max-w-[200px] sm:max-w-md truncate">
                {quizTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white transition-colors"
              title="Exit Arena"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. LOBBY SCREEN */}
        {gameMode === 'lobby' && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center flex-1 text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-4xl font-black text-white">
                Ready for the Challenge?
              </h3>
              <p className="text-purple-200 text-sm sm:text-base mt-2 max-w-lg">
                Answer {questions.length} rapid-fire questions. Faster answers earn more points and build your streak bonus!
              </p>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              {/* Solo Practice */}
              <div 
                onClick={() => setGameMode('playing')}
                className="bg-purple-900/40 hover:bg-purple-900/80 border border-purple-700/60 p-5 rounded-2xl text-left cursor-pointer transition-all hover:scale-105 group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold mb-3">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  Solo Revision
                </h4>
                <p className="text-xs text-purple-300 mt-1">
                  Revise at your own pace with instant answers & detailed explanations.
                </p>
                <div className="mt-3 text-xs font-bold text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Start Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Live Tournament PIN */}
              <div className="bg-purple-900/40 border border-purple-700/60 p-5 rounded-2xl text-left flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-white text-base">
                    Live Seminar PIN
                  </h4>
                  <p className="text-xs text-purple-300 mt-1">
                    Joining a live quiz competition hosted by Tr. Ojok?
                  </p>
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN (e.g. 748291)"
                    className="w-full bg-slate-950 border border-purple-700 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-hidden"
                  />
                  <button
                    onClick={() => {
                      if (pinInput.trim()) setGameMode('playing');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setGameMode('playing')}
              className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-purple-600/30 transform hover:scale-105 transition-all"
            >
              Start Playing Now!
            </button>
          </div>
        )}

        {/* 2. PLAYING SCREEN */}
        {gameMode === 'playing' && (
          <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
            
            {/* HUD Status Bar */}
            <div className="flex items-center justify-between bg-purple-950/60 px-4 py-2.5 rounded-2xl border border-purple-800/40 text-xs sm:text-sm">
              <span className="font-bold text-purple-200">
                Question {currentIndex + 1} of {questions.length}
              </span>

              {/* Streak */}
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                <span className="font-extrabold text-amber-300">
                  {streak > 0 ? `${streak} Streak!` : 'No Streak'}
                </span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-pink-400" />
                <span className="font-black text-white text-base">
                  {score.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Question Card & Timer */}
            <div className="bg-slate-900 border border-purple-800/60 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xl">
              {/* Timer Progress Bar */}
              <div className="w-full bg-purple-950/80 h-2 rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    timeLeft > 10 ? 'bg-emerald-400' : timeLeft > 5 ? 'bg-amber-400' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center mb-2">
                <div className={`w-12 h-12 rounded-full font-black text-lg flex items-center justify-center border-2 ${
                  timeLeft <= 5 ? 'border-red-500 text-red-400 animate-ping' : 'border-purple-600 text-purple-200'
                }`}>
                  {timeLeft}s
                </div>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-white leading-snug max-w-3xl mx-auto">
                {currentQ.question}
              </h3>
            </div>

            {/* 4 Iconic Kahoot Answer Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((opt, idx) => {
                const config = kahootOptions[idx];
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctAnswerIndex;

                let stateClasses = config.colorBg;
                if (isAnswerRevealed) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-600 ring-4 ring-emerald-300 scale-102';
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-900 opacity-60';
                  } else {
                    stateClasses = 'bg-slate-800 opacity-40';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(idx)}
                    className={`${stateClasses} text-white p-4 sm:p-5 rounded-2xl font-bold text-left transition-all duration-200 flex items-center gap-3.5 shadow-md disabled:cursor-default`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 font-black">
                      {config.shape}
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1">
                      {opt}
                    </span>
                    {isAnswerRevealed && isCorrect && (
                      <Check className="w-6 h-6 text-white shrink-0 animate-bounce" />
                    )}
                    {isAnswerRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Explanation Drawer */}
            {isAnswerRevealed && (
              <div className="bg-purple-950/90 border border-purple-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div>
                  <div className="flex items-center gap-2">
                    {selectedOption === currentQ.correctAnswerIndex ? (
                      <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Correct! +500 pts
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {selectedOption === -1 ? 'Time Expired!' : 'Incorrect!'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100 mt-1.5">
                    <strong>Explanation:</strong> {currentQ.explanation}
                  </p>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="bg-white hover:bg-purple-100 text-purple-950 font-black text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* 3. GAME OVER PODIUM SCREEN */}
        {gameMode === 'gameover' && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center flex-1 text-center space-y-6">
            
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-2xl shadow-yellow-500/30">
              <Trophy className="w-12 h-12" />
            </div>

            <div>
              <span className="bg-purple-800 text-pink-300 text-xs font-black px-3 py-1 rounded-full uppercase">
                Challenge Complete
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-2">
                Great Job, {playerName}!
              </h3>
              <p className="text-purple-200 text-sm sm:text-base mt-1">
                You scored <strong className="text-white text-lg">{score.toLocaleString()} points</strong> with {correctCount} of {questions.length} correct.
              </p>
            </div>

            {/* Kahoot 3-Step Podium */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md items-end pt-4">
              
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-300">Okello B.</span>
                <span className="text-[10px] text-purple-300">Gulu City</span>
                <div className="w-full bg-slate-700/80 h-24 rounded-t-2xl flex flex-col items-center justify-center mt-2 border-t-4 border-slate-400">
                  <span className="font-black text-2xl text-slate-300">2</span>
                  <span className="text-[10px] text-slate-400 font-bold">2,150 pts</span>
                </div>
              </div>

              {/* 1st place (User) */}
              <div className="flex flex-col items-center">
                <Award className="w-6 h-6 text-amber-400 animate-bounce" />
                <span className="text-xs font-extrabold text-amber-300">{playerName} (You)</span>
                <span className="text-[10px] text-yellow-300 font-bold">{correctCount}/{questions.length} Correct</span>
                <div className="w-full bg-gradient-to-t from-amber-600 to-yellow-500 text-slate-950 h-36 rounded-t-2xl flex flex-col items-center justify-center mt-2 border-t-4 border-yellow-300 shadow-xl shadow-yellow-500/20">
                  <span className="font-black text-3xl">1</span>
                  <span className="text-xs font-black">{score.toLocaleString()} pts</span>
                </div>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-amber-500">Namatovu E.</span>
                <span className="text-[10px] text-purple-300">Kampala</span>
                <div className="w-full bg-amber-900/60 h-18 rounded-t-2xl flex flex-col items-center justify-center mt-2 border-t-4 border-amber-600">
                  <span className="font-black text-xl text-amber-400">3</span>
                  <span className="text-[10px] text-amber-300 font-bold">1,820 pts</span>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="bg-white hover:bg-purple-100 text-slate-950 font-black text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                onClick={onClose}
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Return to Lessons
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
