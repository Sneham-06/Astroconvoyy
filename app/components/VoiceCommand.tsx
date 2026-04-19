'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoiceCommand() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setSupported(true);
        }
    }, []);

    const startListening = () => {
        if (!supported) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('Listening...');
        };

        recognition.onresult = (event: any) => {
            const speechToText = event.results[0][0].transcript.toLowerCase();
            setTranscript(speechToText);
            handleCommand(speechToText);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setTranscript('Error listening');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleCommand = (command: string) => {
        console.log('Command received:', command);
        
        if (command.includes('dashboard') || command.includes('monitor')) {
            router.push('/dashboard');
        } else if (command.includes('create') || command.includes('new mission')) {
            router.push('/create');
        } else if (command.includes('threat') || command.includes('risk')) {
            router.push('/threats');
        } else if (command.includes('emergency') || command.includes('sos')) {
            router.push('/emergencies');
        } else if (command.includes('home') || command.includes('back')) {
            router.push('/');
        } else if (command.includes('priority')) {
            router.push('/priority');
        } else if (command.includes('conflict')) {
            router.push('/conflicts');
        } else if (command.includes('twin') || command.includes('simulation')) {
            router.push('/digital-twin');
        } else {
            setTranscript(`Unknown command: "${command}"`);
        }
    };

    return (
        <div className="card glow-border hud-scan">
            <div className="card-header">
                <h3 style={{ fontSize: '1rem', color: 'var(--military-gold)' }}>🎙️ LIVE VOICE CONTROL</h3>
                {supported ? (
                    <span className="badge badge-minimal">READY</span>
                ) : (
                    <span className="badge badge-critical">NOT SUPPORTED</span>
                )}
            </div>
            <div className="text-center" style={{ padding: '1rem' }}>
                <button 
                    onClick={startListening}
                    disabled={!supported || isListening}
                    style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        border: isListening ? '4px solid var(--status-emergency)' : '3px solid var(--military-gold)', 
                        background: 'transparent',
                        margin: '0 auto 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: supported ? 'pointer' : 'not-allowed',
                        animation: isListening ? 'pulse-red 1s infinite' : 'none',
                        transition: 'all 0.3s ease',
                        fontSize: '2rem'
                    }}
                >
                    {isListening ? '🛑' : '🎙️'}
                </button>
                <div style={{ fontSize: '1rem', color: isListening ? '#00ff88' : '#a0a0a0', fontWeight: 'bold', minHeight: '1.5rem' }}>
                    {transcript || 'Click icon to speak command'}
                </div>
                <div className="mt-2" style={{ fontSize: '0.8rem', color: 'var(--military-green-accent)' }}>
                    COMMANDS: "Dashboard", "Create Mission", "Threat Analysis", "SOS", "Home"
                </div>
            </div>
        </div>
    );
}
