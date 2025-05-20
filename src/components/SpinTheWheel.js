import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import logo from '../media/logo.png';
const initialNames = ['Alessandra', 'Andrea', 'Ilio', 'Dani', 'Ludo', 'Michela'];
const trumpetSound = new Audio(require('../media/trumpet.mp3'));

export default function SpinTheWheel() {
    const [names, setNames] = useState(initialNames);
    const [selected, setSelected] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [angle, setAngle] = useState(0);
    const [newName, setNewName] = useState('');
    const canvasRef = useRef(null);

    const getColor = (index, total) => {
        const hue = (index * 360) / total;
        return `hsl(${hue}, 80%, 60%)`;
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
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, angle, angle + arc);
            ctx.fillStyle = getColor(i, names.length);
            ctx.fill();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(name, radius - 10, 5);
            ctx.restore();
        });
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

        canvas.style.transition = 'none';
        canvas.style.transform = 'rotate(0deg)';

        setTimeout(() => {
            canvas.style.transition = 'transform 3s ease-out';
            canvas.style.transform = `rotate(${finalAngle}deg)`;
        }, 50);

        setTimeout(() => {
            setSelected(names[selectedIndex]);
            setSpinning(false);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
            });
            trumpetSound.play();
        }, 3050);
    };

    const removeSelected = () => {
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
            <img src={logo} alt="Logo" className="w-200 h-200 mb-2" />

            {/* Title */}
            <h1 className="text-3xl">Scrum Spinner v1.0.0</h1>
            <p className="text-lg text-gray-600">by Ludo</p>

            {/* Wheel */}
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

            {/* Buttons */}
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

            {/* Add Name Input */}
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

            {/* Winner Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-xl text-center">
                        <p className="text-xl font-bold">{selected} is up!</p>
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
