import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, AlertTriangle, Terminal, Skull } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

// Fixed credentials
const VALID_USERNAME = "zero kyber";
const VALID_PASSWORD = "183923";
const MAX_ATTEMPTS = 3;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Morse code stage
  const [loginStage, setLoginStage] = useState<'morse' | 'credentials'>('morse');
  const [morseInput, setMorseInput] = useState<string[]>([]);
  const [morseError, setMorseError] = useState('');
  const CORRECT_MORSE = ['--', '----', '--', '---'];

  // Login stage
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');

  // Check for existing session and lockout status on mount
  useEffect(() => {
    const session = localStorage.getItem('sherlySession');
    const lockedStatus = localStorage.getItem('sherlyLocked');
    const morseUnlocked = sessionStorage.getItem('morseUnlocked');

    if (lockedStatus === 'true') {
      setIsLocked(true);
    } else if (session) {
      // Auto-login if session exists
      const sessionData = JSON.parse(session);
      onLogin(sessionData.username);
    } else if (morseUnlocked === 'true') {
      // Skip morse if already unlocked in this session
      setLoginStage('credentials');
    }
  }, [onLogin]);

  const addMorseSymbol = (symbol: '-' | '.') => {
    const newInput = [...morseInput];
    if (newInput.length === 0 || newInput[newInput.length - 1].includes(' ')) {
      newInput.push(symbol);
    } else {
      newInput[newInput.length - 1] += symbol;
    }
    setMorseInput(newInput);
    setMorseError('');
  };

  const addSpace = () => {
    if (morseInput.length > 0 && !morseInput[morseInput.length - 1].includes(' ')) {
      setMorseInput([...morseInput, ' ']);
    }
  };

  const clearMorse = () => {
    setMorseInput([]);
    setMorseError('');
  };

  const validateMorse = () => {
    const cleanInput = morseInput.filter(item => item !== ' ');

    if (cleanInput.join(',') === CORRECT_MORSE.join(',')) {
      // Success!
      sessionStorage.setItem('morseUnlocked', 'true');
      setLoginStage('credentials');
      setMorseError('');
    } else {
      setMorseError('INVALID MORSE CODE SEQUENCE');
      setTimeout(() => {
        setMorseInput([]);
        setMorseError('');
      }, 2000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if locked
    if (isLocked) {
      return;
    }

    // Validate credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // Success - save session
      localStorage.setItem('sherlySession', JSON.stringify({
        username,
        timestamp: Date.now()
      }));
      localStorage.removeItem('sherlyLocked');
      onLogin(username);
    } else {
      // Failed attempt
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock the system
        setIsLocked(true);
        localStorage.setItem('sherlyLocked', 'true');
        setError('');
      } else {
        setError(`ACCESS DENIED. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }

      setPassword('');
    }
  };

  // Locked screen
  if (isLocked) {
    return (
      <div className="min-h-screen w-full bg-black text-red-500 font-mono flex flex-col items-center justify-center p-4 overflow-hidden relative">
        {/* Glitch effect background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDAsMCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 animate-pulse"></div>

        <div className="relative z-10 text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-red-900/20 border-4 border-red-500 animate-pulse">
              <Skull size={80} className="text-red-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-red-500 tracking-wider animate-pulse">
              SYSTEM LOCKED
            </h1>

            <div className="bg-black/60 border-2 border-red-900 p-6 rounded-lg space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertTriangle size={24} className="animate-bounce" />
                <p className="text-xl font-bold">SECURITY BREACH DETECTED</p>
                <AlertTriangle size={24} className="animate-bounce" />
              </div>

              <p className="text-gray-400 text-lg">
                Maximum authentication attempts exceeded
              </p>

              <div className="text-red-600 text-sm mt-4 space-y-1">
                <p>• System access permanently revoked</p>
                <p>• All connections terminated</p>
                <p>• Incident logged to security database</p>
              </div>
            </div>

            <div className="mt-8 text-xs text-gray-600 space-y-1">
              <p>ERROR CODE: 0x8000FFFF</p>
              <p>TIMESTAMP: {new Date().toISOString()}</p>
              <p className="text-red-800 mt-4">
                To unlock, clear browser localStorage and refresh the page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Morse code screen
  if (loginStage === 'morse') {
    return (
      <div className="min-h-screen w-full bg-black text-green-500 font-mono flex items-center justify-center p-4">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

        <div className="w-full max-w-2xl space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="p-4 rounded-lg bg-black border-2 border-green-500 shadow-[0_0_30px_rgba(0,255,65,0.3)]">
                  <Terminal size={48} className="text-green-500" />
                </div>
                <div className="absolute -inset-1 bg-green-500/20 blur-xl group-hover:bg-green-500/30 transition-all -z-10"></div>
              </div>
            </div>

            <h1 className="text-4xl font-orbitron font-bold text-white tracking-wider">
              MORSE AUTHENTICATION
            </h1>
            <p className="text-green-600 text-sm tracking-[0.3em] font-bold">
              ENTER ACCESS CODE
            </p>
          </div>

          {/* Morse Display */}
          <div className="bg-black border-2 border-green-900 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
            <div className="text-3xl text-green-400 font-bold tracking-widest">
              {morseInput.length === 0 ? (
                <span className="text-green-900 text-xl">_ _ _ _</span>
              ) : (
                morseInput.map((symbol, i) => (
                  <span key={i} className="mx-1">
                    {symbol === ' ' ? '  ' : symbol}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Error */}
          {morseError && (
            <div className="bg-red-900/20 border border-red-500 rounded p-3 flex items-center gap-2 animate-pulse">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-red-400 text-sm font-bold">{morseError}</p>
            </div>
          )}

          {/* Morse Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => addMorseSymbol('.')}
              className="bg-green-900/20 hover:bg-green-900/40 border-2 border-green-500 text-green-400 font-bold py-8 rounded transition-all text-4xl hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            >
              . DOT
            </button>
            <button
              onClick={() => addMorseSymbol('-')}
              className="bg-green-900/20 hover:bg-green-900/40 border-2 border-green-500 text-green-400 font-bold py-8 rounded transition-all text-4xl hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
            >
              - DASH
            </button>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={addSpace}
              className="bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 text-gray-400 font-bold py-3 rounded transition-all hover:border-gray-500"
            >
              SPACE
            </button>
            <button
              onClick={validateMorse}
              disabled={morseInput.length === 0}
              className="bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUBMIT
            </button>
            <button
              onClick={clearMorse}
              className="bg-red-900/20 hover:bg-red-900/40 border-2 border-red-800 text-red-400 font-bold py-3 rounded transition-all hover:border-red-600"
            >
              CLEAR
            </button>
          </div>

          {/* Hint */}
          <div className="text-center text-xs text-gray-700 space-y-1">
            <p>MORSE CODE REQUIRED FOR ACCESS</p>
            <p className="text-green-900">PATTERN: [--] [----] [--] [---]</p>
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="min-h-screen w-full bg-black text-green-500 font-mono flex items-center justify-center p-4">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="p-4 rounded-lg bg-black border-2 border-green-500 shadow-[0_0_30px_rgba(0,255,65,0.3)]">
                <Shield size={48} className="text-green-500" />
              </div>
              <div className="absolute -inset-1 bg-green-500/20 blur-xl group-hover:bg-green-500/30 transition-all -z-10"></div>
            </div>
          </div>

          <h1 className="text-4xl font-orbitron font-bold text-white tracking-wider">
            AI SHERLY LAB
          </h1>
          <p className="text-green-600 text-sm tracking-[0.3em] font-bold">
            SECURITY OPERATIONS CENTER
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <User size={14} />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full bg-black border-2 border-green-900 rounded px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none transition-all placeholder-green-900/50"
              autoComplete="off"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <Lock size={14} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-black border-2 border-green-900 rounded px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none transition-all placeholder-green-900/50"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-4 rounded transition-all shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:shadow-[0_0_30px_rgba(0,255,65,0.6)] hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Terminal size={20} />
            ESTABLISH CONNECTION
          </button>
        </form>

        {/* Attempts indicator */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            {[...Array(MAX_ATTEMPTS)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${i < attempts
                  ? 'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.6)]'
                  : 'bg-green-900/30'
                  }`}
              ></div>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            {attempts > 0 && (
              <span className="text-red-500">
                {attempts} failed attempt{attempts > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-700 space-y-1">
          <p>RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY</p>
          <p className="text-green-900">SESSION ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;