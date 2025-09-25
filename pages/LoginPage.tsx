import React, { useState, FormEvent, useEffect, useRef } from 'react';
// FIX: Use named imports for react-router-dom to fix resolution errors.
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Heart, Padlock } from '../components/Icons';

const LoginPage: React.FC = () => {
  const [pin, setPin] = useState<string[]>(['', '', '']);
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const { login, isAuthenticated } = useAuth();
  // FIX: Replaced ReactRouterDOM.useNavigate with useNavigate from named import.
  const navigate = useNavigate();
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
    setIsAnimating(true);
  };

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    inputRefs[0].current?.focus();
  },[]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || isUnlocked) return; 

    const newPin = [...pin];
    newPin[index] = value.slice(-1); 
    setPin(newPin);

    if (value && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
    
    if (newPin.every(digit => digit !== '')) {
      checkPin(newPin.join(''));
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const checkPin = (fullPin: string) => {
    const success = login(fullPin);
    if (success) {
      setIsUnlocked(true);
      // Wait a moment after unlock animation before starting to fade
      setTimeout(() => {
        setIsFadingOut(true);
      }, 1000); 
      // Total time = padlock pause (1000ms) + fade out animation (1200ms)
      setTimeout(() => {
        navigate('/');
      }, 2200);
    } else {
      setIsShaking(true);
      setTimeout(() => {
        setPin(['', '', '']);
        setIsShaking(false);
        inputRefs[0].current?.focus();
      }, 820);
    }
  };


  return (
    <div className={`flex items-center justify-center min-h-screen bg-background ${isFadingOut ? 'animate-fadeOut' : 'animate-slideInUp'}`}>
      <Card className="w-full max-w-sm mx-4 text-center border-none">
        <CardHeader>
           <div className="flex justify-center items-center mb-4">
            <button onClick={handleHeartClick} onAnimationEnd={() => setIsAnimating(false)}>
                <Heart 
                    isFilled={isHeartFilled} 
                    className={`h-10 w-10 text-accent transition-colors duration-300 ${isAnimating ? 'animate-heartbeat' : ''}`}
                />
            </button>
          </div>
          <CardTitle>Nuestro Diario</CardTitle>
          <CardDescription>Un lugar secreto para nuestros recuerdos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-6">
            
            {isUnlocked ? (
              <div className="flex flex-col items-center justify-center h-24 transition-opacity duration-300">
                  <Padlock isUnlocked={isUnlocked} className="w-16 h-16 text-green-500"/>
                  <p className="text-green-600 font-medium mt-2">Acceso Concedido</p>
              </div>
            ) : (
                 <div className="h-24 flex flex-col items-center">
                    <p className="font-medium text-foreground/80 mb-4">Introduce el PIN</p>
                    <div
                        className={`flex items-center space-x-3 ${isShaking ? 'animate-shake' : ''}`}
                    >
                        {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePinChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-300
                            ${isShaking ? 'border-red-500' : 'border-input focus:border-accent focus:ring-2 focus:ring-ring'} 
                            bg-secondary`}
                            disabled={isShaking || isUnlocked}
                        />
                        ))}
                    </div>
                </div>
            )}
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;