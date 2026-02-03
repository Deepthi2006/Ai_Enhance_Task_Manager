import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, ArrowLeft, CheckCircle2, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";

export default function FocusMode() {
    const { taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = useAuth();

    // State for timer
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
    const [task, setTask] = useState<any>(location.state?.task || null);
    const [fullscreen, setFullscreen] = useState(false);
    // Ambient sound state (simulated for now)
    const [soundEnabled, setSoundEnabled] = useState(false);

    // Load task if not passed via state
    useEffect(() => {
        if (taskId && !task) {
            const fetchTask = async () => {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/tasks/${taskId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setTask(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch task", err);
                }
            };
            fetchTask();
        }
    }, [taskId, task, token]);

    // Timer logic
    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play alarm sound here if implemented
            if (sessionType === "focus") {
                setSessionType("break");
                setTimeLeft(5 * 60); // 5 min break
            } else {
                setSessionType("focus");
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, sessionType]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(sessionType === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleTaskComplete = async () => {
        if (!task) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/tasks/${task._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "Done" }),
            });
            if (res.ok) {
                setTask({ ...task, status: "Done" });
                // Maybe show confetti or success message
            }
        } catch (err) {
            console.error("Failed to complete task", err);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setFullscreen(false);
            }
        }
    };

    const FocusContent = () => (
        <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-6 ${fullscreen ? 'fixed inset-0 z-50 bg-background min-h-screen max-w-none' : ''}`}>

            {/* Header / Controls */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                {!fullscreen && (
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                )}
                <div className="flex gap-4 ml-auto">
                    {/* Sound Toggle (Visual only for now) */}
                    <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? "Mute Ambient Sound" : "Enable Ambient Sound"}>
                        {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                        {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Main Focus Area */}
            <div className="flex flex-col items-center text-center space-y-12">

                {/* Timer Display */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full transform scale-150 opacity-50" />
                    <div className="text-9xl font-black tabular-nums leading-none tracking-tighter text-foreground relative z-10 transition-all duration-300">
                        {formatTime(timeLeft)}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em] mt-4">
                        {sessionType === "focus" ? "Focus Session" : "Break Time"}
                    </p>
                </div>

                {/* Task Display */}
                {task && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl w-full"
                    >
                        <div className="bg-secondary/30 backdrop-blur-sm p-8 rounded-3xl border border-border/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="text-left">
                                    <Badge className="mb-3 bg-primary/20 text-primary hover:bg-primary/30 border-0 uppercase tracking-wider text-[10px]">Current Objective</Badge>
                                    <h2 className="text-xl font-bold mb-2">{task.title}</h2>
                                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                                </div>
                                {task.status !== "Done" && (
                                    <Button
                                        size="default"
                                        onClick={handleTaskComplete}
                                        className="bg-green-500 hover:bg-green-600 text-white rounded-xl h-10 w-10 p-0 shrink-0"
                                        title="Mark Complete"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <Button
                        size="default"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-2"
                        onClick={resetTimer}
                    >
                        <Square className="w-4 h-4 fill-current" />
                    </Button>

                    <Button
                        size="lg"
                        className={`h-16 w-16 rounded-full shadow-xl transition-all duration-300 ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-primary-600'}`}
                        onClick={toggleTimer}
                    >
                        {isActive ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-1" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Footer / Quote */}
            <div className="absolute bottom-10 left-0 right-0 text-center text-muted-foreground/60 text-sm font-medium">
                {isActive ? "Stay focused. Deep work in progress." : "Ready to enter the flow state?"}
            </div>

        </div>
    );

    return fullscreen ? (
        <div className="bg-background min-h-screen text-foreground font-sans">
            <FocusContent />
        </div>
    ) : (
        <Layout>
            <FocusContent />
        </Layout>
    );
}
