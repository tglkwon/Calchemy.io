import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioContext } from './AudioContext';
import { useGame } from './GameContext';

const BGM_MAPPING = {
    '/': '1장 전투.mp3', // Default Battle
    '/map': 'BGM_Stage_251108.wav',
    '/shop': '니어오토마타스타일.mp3',
    '/reward': '서정적 스토리.mp3',
    '/event': 'RANDOM',
    'BATTLE_ELITE': '보스전.mp3',
    'BATTLE_BOSS': '1장 에픽몬스터 전투.mp3',
    'DEFAULT': 'BGM_Main_251108.wav'
};

const EVENT_MUSIC_OPTIONS = [
    '서정적 스토리.mp3',
    '긴박한 스토리, 전투는 모르겠음.mp3',
    '니어오토마타스타일.mp3'
];

export const AudioProvider = ({ children }) => {
    const location = useLocation();
    const { gameState } = useGame();
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);

    const audioRef = useRef(new Audio());
    const fadeIntervalRef = useRef(null);

    // Initial setup
    useEffect(() => {
        audioRef.current.loop = true;
        return () => {
            audioRef.current.pause();
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, []);

    const playTrack = useCallback((trackName) => {
        if (!trackName) return;

        // Use relative path for assets
        // If import.meta.env.BASE_URL is needed, use it, but usually /assets works in dev/prod
        const filePath = `${import.meta.env.BASE_URL}assets/audio/${trackName}`;
        if (currentTrack === trackName) return;

        console.log(`[AudioProvider] Switching to: ${trackName}`);

        const fadeOut = () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

            let currentVol = audioRef.current.volume;
            fadeIntervalRef.current = setInterval(() => {
                currentVol -= 0.05;
                if (currentVol <= 0) {
                    clearInterval(fadeIntervalRef.current);
                    audioRef.current.pause();
                    startNewTrack();
                } else {
                    audioRef.current.volume = Math.max(0, currentVol);
                }
            }, 50);
        };

        const startNewTrack = () => {
            audioRef.current.src = filePath;
            audioRef.current.volume = 0;
            audioRef.current.play().catch(e => console.log('Audio play blocked by browser policy:', e));

            let targetVol = isMuted ? 0 : volume;
            let currentVol = 0;

            fadeIntervalRef.current = setInterval(() => {
                currentVol += 0.05;
                if (currentVol >= targetVol) {
                    clearInterval(fadeIntervalRef.current);
                    audioRef.current.volume = targetVol;
                } else {
                    audioRef.current.volume = currentVol;
                }
            }, 50);

            setCurrentTrack(trackName);
        };

        if (audioRef.current.src && !audioRef.current.paused) {
            fadeOut();
        } else {
            startNewTrack();
        }
    }, [currentTrack, isMuted, volume]);

    // Determine target track based on location and game state
    useEffect(() => {
        let track = BGM_MAPPING[location.pathname] || BGM_MAPPING['DEFAULT'];

        if (location.pathname === '/') {
            // Battle page: Check node type
            const { mapData, currentNodeId } = gameState;
            if (mapData && currentNodeId) {
                const node = mapData.nodes.find(n => n.id === currentNodeId);
                if (node) {
                    if (node.roomType === 'BOSS') track = BGM_MAPPING['BATTLE_BOSS'];
                    else if (node.roomType === 'ELITE') track = BGM_MAPPING['BATTLE_ELITE'];
                }
            }
        } else if (track === 'RANDOM') {
            const randomIndex = Math.floor(Math.random() * EVENT_MUSIC_OPTIONS.length);
            track = EVENT_MUSIC_OPTIONS[randomIndex];
        }

        playTrack(track);
    }, [location.pathname, gameState.currentNodeId, playTrack, gameState.mapData]);

    // Sync volume/mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    return (
        <AudioContext.Provider value={{
            volume,
            setVolume,
            isMuted,
            setIsMuted,
            playTrack
        }}>
            {children}
        </AudioContext.Provider>
    );
};
