import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const fullTranscriptRef = useRef(''); // To hold the full accumulated text if continuous

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            // Continuous = true means it won't auto-stop when the user pauses
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                fullTranscriptRef.current = '';
                setTranscript('');
            };

            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPiece;
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }

                // Append final sentences to ref
                if (finalTranscript) {
                    fullTranscriptRef.current += finalTranscript + ' ';
                }

                // Display everything spoken so far in this session
                setTranscript((fullTranscriptRef.current + interimTranscript).trim());
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error !== 'no-speech') {
                    setError(event.error);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            setError("Speech Recognition not supported.");
        }
    }, []);

    const speak = useCallback((text, onEndCallback) => {
        if (!window.speechSynthesis) {
            console.warn("Speech Synthesis API not supported.");
            if (onEndCallback) onEndCallback();
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Workaround to ensure voices are loaded (Chrome sometimes delays this)
        let voices = window.speechSynthesis.getVoices();

        const setVoiceAndSpeak = () => {
            const preferredVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Samantha')))
                || voices.find(v => v.lang.startsWith('en'));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                if (onEndCallback) onEndCallback();
            };
            utterance.onerror = (e) => {
                console.error("Speech synthesis error", e);
                setIsSpeaking(false);
                if (onEndCallback) onEndCallback();
            };

            window.speechSynthesis.speak(utterance);
        };

        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                voices = window.speechSynthesis.getVoices();
                setVoiceAndSpeak();
                window.speechSynthesis.onvoiceschanged = null; // Unbind
            };
        } else {
            setVoiceAndSpeak();
        }
    }, []);

    const startListening = useCallback(() => {
        setError(null);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.log("Recognition already started");
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return {
        speak,
        startListening,
        stopListening,
        isSpeaking,
        isListening,
        transcript,
        error
    };
};

export default useSpeech;
