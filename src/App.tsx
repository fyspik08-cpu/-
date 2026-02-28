/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Coins, 
  Dices, 
  Gamepad2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  ChevronRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Sounds ---
const SOUNDS = {
  win: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  spin: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  vault: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'
};

const playSound = (key: keyof typeof SOUNDS) => {
  const audio = new Audio(SOUNDS[key]);
  audio.volume = 0.4;
  audio.play().catch(() => {}); // Ignore autoplay blocks
};

// --- Types ---
type GameType = 'slots' | 'coin' | 'dice';

interface GameState {
  wins: number;
  balance: number;
  showVault: boolean;
  currentGame: GameType;
  isSpinning: boolean;
  lastResult: string | null;
  history: { game: string; result: 'win' | 'loss' }[];
}

// --- Components ---

const SlotMachine = ({ onWin, isSpinning, setIsSpinning }: { onWin: () => void; isSpinning: boolean; setIsSpinning: (s: boolean) => void }) => {
  const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀'];
  const [reels, setReels] = useState(['💎', '💎', '💎']);

  const spin = () => {
    if (isSpinning) return;
    playSound('spin');
    setIsSpinning(true);
    
    let iterations = 0;
    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      iterations++;
      if (iterations > 20) {
        clearInterval(interval);
        setIsSpinning(false);
        
        const finalReels = [
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
        ];
        
        // Cheat a bit to make it easier to reach 3 wins (60% chance of auto-win)
        if (Math.random() > 0.4) {
          const winSym = symbols[Math.floor(Math.random() * symbols.length)];
          setReels([winSym, winSym, winSym]);
          onWin();
        } else {
          setReels(finalReels);
          if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            onWin();
          }
        }
      }
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        {reels.map((symbol, i) => (
          <motion.div
            key={i}
            animate={isSpinning ? { y: [0, -20, 20, 0] } : {}}
            transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.1 }}
            className="w-24 h-32 bg-zinc-900 border-2 border-zinc-800 rounded-xl flex items-center justify-center text-5xl shadow-inner"
          >
            {symbol}
          </motion.div>
        ))}
      </div>
      <button
        onClick={spin}
        disabled={isSpinning}
        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
      >
        <RefreshCw className={isSpinning ? 'animate-spin' : ''} />
        {isSpinning ? 'SPINNING...' : 'SPIN REELS'}
      </button>
    </div>
  );
};

const CoinFlip = ({ onWin, isSpinning, setIsSpinning }: { onWin: () => void; isSpinning: boolean; setIsSpinning: (s: boolean) => void }) => {
  const [side, setSide] = useState<'heads' | 'tails'>('heads');

  const flip = (userChoice: 'heads' | 'tails') => {
    if (isSpinning) return;
    playSound('spin');
    setIsSpinning(true);
    
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'heads' : 'tails';
      setSide(result);
      setIsSpinning(false);
      if (result === userChoice) {
        onWin();
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        animate={isSpinning ? { rotateY: 1800 } : { rotateY: side === 'heads' ? 0 : 180 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-40 h-40 bg-yellow-500 rounded-full border-8 border-yellow-600 flex items-center justify-center text-black font-black text-4xl shadow-[0_0_30px_rgba(234,179,8,0.3)]"
      >
        {side === 'heads' ? 'H' : 'T'}
      </motion.div>
      <div className="flex gap-4">
        <button
          onClick={() => flip('heads')}
          disabled={isSpinning}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition-colors"
        >
          HEADS
        </button>
        <button
          onClick={() => flip('tails')}
          disabled={isSpinning}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition-colors"
        >
          TAILS
        </button>
      </div>
    </div>
  );
};

const DiceRoll = ({ onWin, isSpinning, setIsSpinning }: { onWin: () => void; isSpinning: boolean; setIsSpinning: (s: boolean) => void }) => {
  const [dice, setDice] = useState(1);

  const roll = () => {
    if (isSpinning) return;
    playSound('spin');
    setIsSpinning(true);
    
    let count = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = Math.floor(Math.random() * 6) + 1;
        setDice(final);
        setIsSpinning(false);
        if (final > 3) onWin();
      }
    }, 80);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        animate={isSpinning ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
        className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center text-black text-6xl shadow-2xl"
      >
        {dice}
      </motion.div>
      <div className="text-zinc-400 font-mono text-sm">ROLL 4, 5, OR 6 TO WIN</div>
      <button
        onClick={roll}
        disabled={isSpinning}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
      >
        ROLL DICE
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<GameState>({
    wins: 0,
    balance: 0,
    showVault: false,
    currentGame: 'slots',
    isSpinning: false,
    lastResult: null,
    history: []
  });

  const handleWin = useCallback(() => {
    playSound('win');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff88', '#ffffff', '#ff0055']
    });

    const winAmount = Math.floor(Math.random() * 101) + 400; // 400-500

    setState(prev => {
      const newWins = prev.wins + 1;
      const shouldOpenVault = newWins >= 3;
      
      if (shouldOpenVault) {
        playSound('vault');
      }
      
      return {
        ...prev,
        wins: newWins,
        balance: prev.balance + winAmount,
        showVault: shouldOpenVault,
        lastResult: `+$${winAmount}!`,
        history: [{ game: prev.currentGame, result: 'win' }, ...prev.history].slice(0, 5)
      };
    });
  }, []);

  const setGame = (game: GameType) => {
    if (state.isSpinning) return;
    playSound('click');
    setState(prev => ({ ...prev, currentGame: game, lastResult: null }));
  };

  const setIsSpinning = (spinning: boolean) => {
    setState(prev => ({ ...prev, isSpinning: spinning }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <div>
            <h1 className="font-black tracking-tighter text-xl uppercase italic">Neon Vault</h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Digital Casino v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] text-zinc-500 font-mono uppercase">Total Balance</span>
            <motion.div 
              key={state.balance}
              initial={{ scale: 1.2, color: '#00ff88' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-2xl font-black italic tracking-tighter"
            >
              ${state.balance.toLocaleString()}
            </motion.div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-mono uppercase">Vault Progress</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`w-8 h-1.5 rounded-full transition-all duration-500 ${
                    state.wins >= i ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-zinc-900">
            {state.wins >= 3 ? <Unlock className="text-emerald-500" /> : <Lock className="text-zinc-600" />}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 pt-12">
        {/* Game Selection */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {(['slots', 'coin', 'dice'] as GameType[]).map(game => (
            <button
              key={game}
              onClick={() => setGame(game)}
              className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 group ${
                state.currentGame === game 
                  ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' 
                  : 'bg-zinc-900/50 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-xl transition-colors ${
                state.currentGame === game ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'
              }`}>
                {game === 'slots' && <Gamepad2 />}
                {game === 'coin' && <Coins />}
                {game === 'dice' && <Dices />}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{game}</span>
            </button>
          ))}
        </div>

        {/* Game Area */}
        <div className="relative min-h-[400px] glass rounded-3xl p-12 flex flex-center justify-center items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentGame}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              {state.currentGame === 'slots' && <SlotMachine onWin={handleWin} isSpinning={state.isSpinning} setIsSpinning={setIsSpinning} />}
              {state.currentGame === 'coin' && <CoinFlip onWin={handleWin} isSpinning={state.isSpinning} setIsSpinning={setIsSpinning} />}
              {state.currentGame === 'dice' && <DiceRoll onWin={handleWin} isSpinning={state.isSpinning} setIsSpinning={setIsSpinning} />}
            </motion.div>
          </AnimatePresence>

          {/* Result Overlay */}
          <AnimatePresence>
            {state.lastResult && !state.isSpinning && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="bg-emerald-500 text-black px-8 py-4 rounded-full font-black text-3xl shadow-[0_0_50px_rgba(16,185,129,0.8)] rotate-[-5deg]">
                  {state.lastResult}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History / Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              <Target size={12} /> Recent Activity
            </h3>
            <div className="space-y-3">
              {state.history.length === 0 && <p className="text-zinc-600 italic text-sm">No games played yet...</p>}
              {state.history.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider">{h.game}</span>
                  <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500/20 text-emerald-500">
                    {h.result.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center text-center">
            <Trophy className="text-yellow-500 mb-4" size={48} />
            <h2 className="text-2xl font-black italic uppercase">The Grand Prize</h2>
            <p className="text-zinc-400 text-sm mt-2">Unlock the vault by winning 3 times across any game.</p>
            <div className="mt-6 text-4xl font-mono font-bold text-emerald-500">
              {state.wins} <span className="text-zinc-700">/</span> 3
            </div>
          </div>
        </div>
      </main>

      {/* Vault Modal */}
      <AnimatePresence>
        {state.showVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-2xl w-full glass border-emerald-500/30 rounded-[40px] p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                <Unlock size={48} className="text-black" />
              </div>

              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Vault Unlocked</h2>
              <p className="text-zinc-400 text-lg mb-12">Congratulations, high roller. You've proven your luck. The secret window is now open.</p>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Sparkles className="text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">1,000,000</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Digital Credits</div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Trophy className="text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">VIP STATUS</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Lifetime Access</div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = 'https://maper.info/2se2M4'}
                className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3"
              >
                COLLECT <ChevronRight />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50" />
      </div>
    </div>
  );
}
