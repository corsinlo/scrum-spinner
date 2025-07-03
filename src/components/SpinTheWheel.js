import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import logo from '../media/logo.png';
import wheelSoundUrl from '../media/wheel1.mp3'; // This is a URL string

const initialNames = ['Andrea', 'Dani', 'Ludo', 'Michela'];

const SOUND_QUERIES = [
    'trumpet', 'applause', 'laugh', 'cheer', 'bell', 'whistle',
    'drum', 'siren', 'clap', 'horn', 'fanfare', 'saxophone',
    'guitar', 'piano', 'flute', 'violin', 'xylophone', 'trombone',
    'synth', 'bass', 'sitar', 'ukulele', 'accordion', 'harmonica',
    'banjo', 'bagpipe', 'didgeridoo', 'marimba', 'mandolin',
    'ocarina', 'theremin', 'kalimba', 'zither', 'cello', 'bassoon',
    'sax', 'trumpet fanfare', 'tuba', 'french horn', 'piccolo',
    'clarinet', 'oboe', 'bass clarinet', 'bass trombone', 'baritone',
    'trombone fanfare', 'sousaphone', 'cornet', 'flugelhorn',
    'car', 'plane', 'train', 'boat', 'motorcycle', 'bicycle', 'bus', 'truck',
    'helicopter', 'rocket', 'spaceship', 'submarine', 'hovercraft',
    'ambulance', 'fire truck', 'police car', 'taxi', 'limo',
    'concert', 'festival', 'party', 'crowd', 'street', 'market', 'fair',
    'parade', 'circus', 'theater', 'opera', 'ballet', 'musical',
    'concert hall', 'stadium', 'arena', 'amphitheater',
    'club', 'bar', 'pub', 'lounge', 'restaurant',
    'bongo', 'conga', 'djembe', 'tabla', 'tambourine', 'triangle',
    'rain', 'thunder', 'wind', 'forest', 'ocean', 'waves', 'fire',
    'heartbeat', 'footsteps', 'boo', 'shout', 'cry', 'chant',
    'trance', 'techno', 'dubstep', 'chiptune', 'ambient', 'lofi', 'glitch'
];


const API_KEY = process.env.REACT_APP_FREESOUND_API_KEY;

async function fetchSoundsByQuery(apiKey, query) {
    const url = `https://freesound.org/apiv2/search/text/?query=${query}&fields=name,previews&token=${apiKey}&page_size=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map((result) => result.previews['preview-hq-mp3']);
    } catch (error) {
        console.error('Error fetching sound previews:', error);
        return [];
    }
}

export default function SpinTheWheel() {
    const [names, setNames] = useState(initialNames);
    const [selected, setSelected] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [angle, setAngle] = useState(0);
    const [soundQuery, setSoundQuery] = useState('');
    const [soundUrls, setSoundUrls] = useState([]);
    const [newName, setNewName] = useState('');
    const canvasRef = useRef(null);
    const wheelAudioRef = useRef(null);

    useEffect(() => {
        wheelAudioRef.current = new Audio(wheelSoundUrl);
        wheelAudioRef.current.loop = true;

        const randomQuery = SOUND_QUERIES[Math.floor(Math.random() * SOUND_QUERIES.length)];
        setSoundQuery(randomQuery);

        fetchSoundsByQuery(API_KEY, randomQuery).then((urls) => {
            setSoundUrls(urls);
        });
    }, []);

    const getColor = (index, total) => {
        const hue = (index * 360) / total;
        return `hsl(${hue}, 90%, 70%)`; // Brighter and more saturated
    };

    const drawWheel = (names) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const center = size / 2;
        const radius = center - 10;
        const arc = (2 * Math.PI) / names.length;

        ctx.clearRect(0, 0, size, size);

        names.forEach((name, i) => {
            const angle = i * arc;

            // 🌈 Radial gradient for a 3D-like slice
            const gradient = ctx.createRadialGradient(center, center, radius * 0.3, center, center, radius);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.5, getColor(i, names.length));
            gradient.addColorStop(1, getColor(i, names.length));;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, angle, angle + arc);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // 🖋️ Draw borders between slices
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // ✏️ Text
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(name, radius - 10, 5);
            ctx.restore();
        });

        // 🟠 Center circle for style
        ctx.beginPath();
        ctx.arc(center, center, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#666';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.stroke();
    };


    const spinWheel = () => {
        if (spinning || names.length === 0) return;

        const canvas = canvasRef.current;
        const arcDeg = 360 / names.length;
        const selectedIndex = Math.floor(Math.random() * names.length);
        const targetAngle = 270 - selectedIndex * arcDeg - arcDeg / 2;
        const fullRotations = 5 * 360;
        const finalAngle = fullRotations + targetAngle;

        setSpinning(true);
        setAngle(finalAngle);

        // ▶️ Play spinning sound
        if (wheelAudioRef.current) {
            wheelAudioRef.current.currentTime = 0;
            wheelAudioRef.current.play();
        }

        canvas.style.transition = 'none';
        canvas.style.transform = 'rotate(0deg)';

        setTimeout(() => {
            canvas.style.transition = 'transform 3s ease-out';
            canvas.style.transform = `rotate(${finalAngle}deg)`;
        }, 50);

        setTimeout(() => {
            setSelected(names[selectedIndex]);
            setSpinning(false);

            // ⏹ Stop spinning sound
            if (wheelAudioRef.current) {
                wheelAudioRef.current.pause();
                wheelAudioRef.current.currentTime = 0;
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
            });

            // 🔊 Play one of the fetched sounds
            if (soundUrls.length > 0) {
                const randomUrl = soundUrls[Math.floor(Math.random() * soundUrls.length)];
                const audio = new Audio(randomUrl);
                audio.play();
                setCurrentAudio(audio);
            }
        }, 3050);
    };

    const removeSelected = () => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        setNames(names.filter((n) => n !== selected));
        setSelected(null);
    };

    const restart = () => {
        setNames(initialNames);
        setSelected(null);
        setAngle(0);
        if (canvasRef.current) {
            canvasRef.current.style.transition = 'none';
            canvasRef.current.style.transform = 'rotate(0deg)';
        }
    };

    const handleAddName = () => {
        const trimmed = newName.trim();
        if (trimmed) {
            setNames([...names, trimmed]);
            setNewName('');
        }
    };

    useEffect(() => {
        drawWheel(names);
    }, [names]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-white">
            <img src={logo} alt="Logo" className="w-200 h-200" />

            <h1 className="text-2xl text-gray-600">Scrum Spinner v1.0.2</h1>
            <p className="text-lg text-gray-600">by Ludo</p>
            <p className="text-md text-gray-700 italic">
                🎵 Sound of the day: <strong>{soundQuery}</strong>
            </p>

            <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-black rotate-270"></div>
                </div>
                <canvas
                    ref={canvasRef}
                    width="300"
                    height="300"
                    className="rounded-full border-4 border-gray-300"
                ></canvas>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={spinWheel}
                    disabled={spinning || names.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Spin
                </button>
                <button
                    onClick={restart}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Restart
                </button>
                <button
                    onClick={() => setNames([])}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Clear All
                </button>
            </div>

            <div className="flex gap-2 mt-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Add name"
                    className="px-3 py-2 border border-gray-300 rounded"
                />
                <button
                    onClick={handleAddName}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    OK
                </button>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-xl text-center">
                        <p className="text-xl">Tocca a <span className="font-bold">{selected}!</span> </p>
                        <button
                            onClick={removeSelected}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
