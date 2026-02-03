import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Clock, BrainCircuit } from "lucide-react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  parentId?: string | null;
  projectId?: string | null;
  parentTaskName?: string | null;
  taskToEdit?: {
    _id: string;
    title: string;
    description?: string;
    priority?: "Low" | "Medium" | "High";
  } | null;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  parentId = null,
  projectId = null,
  parentTaskName = null,
  taskToEdit = null,
}: CreateTaskDialogProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || "",
    description: taskToEdit?.description || "",
    priority: taskToEdit?.priority || "Medium",
  });
  const [error, setError] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<{ minutes: number; source: string; reasoning: string } | null>(null);
  const [estimating, setEstimating] = useState(false);

  // Team & Assignment State
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("personal");
  const [members, setMembers] = useState<any[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Fetch teams on open
      fetch(`${import.meta.env.VITE_API_URL || ""}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTeams(data);
        })
        .catch(err => console.error("Failed to fetch teams", err));
    }
  }, [open, token]);

  useEffect(() => {
    if (selectedTeamId && selectedTeamId !== "personal") {
      const team = teams.find(t => t._id === selectedTeamId);
      if (team) {
        // Map members for the dropdown
        const teamMembers = team.members.map((m: any) => ({
          id: m.userId._id,
          name: m.userId.name
        }));
        setMembers(teamMembers);
        // Default to self if not already set, or keep existing
        if (!selectedAssigneeId) {
          // We might want to default to current user, but for now let's leave blank or select first
        }
      }
    } else {
      setMembers([]);
      setSelectedAssigneeId("");
    }
  }, [selectedTeamId, teams]);

  const fetchEstimate = async () => {
    if (!formData.title) return;
    setEstimating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/ai/estimate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: formData.title, description: formData.description }),
      });
      if (res.ok) {
        const data = await res.json();
        setEstimatedDuration(data);
      }
    } catch (err) {
      console.error("Estimate failed", err);
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);

    try {
      const url = taskToEdit
        ? (import.meta.env.VITE_API_URL || "") + `/api/tasks/${taskToEdit._id}`
        : (import.meta.env.VITE_API_URL || "") + "/api/tasks";

      const method = taskToEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          parentId,
          projectId,
          teamId: selectedTeamId === "personal" ? null : selectedTeamId,
          assignedTo: selectedAssigneeId || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create task");
      }

      setFormData({ title: "", description: "", priority: "Medium" });
      onOpenChange(false);
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update task details." : "Add a new task to your list. AI will automatically analyze and prioritize it."}
          </DialogDescription>
          {parentTaskName && (
            <div className="mt-2 p-2 bg-primary/5 border border-primary/10 rounded text-xs font-medium text-primary">
              subtask is created for ::: {parentTaskName}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Review pull requests"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={loading}
              className="bg-white"
            />
          </div>

          {!estimatedDuration ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchEstimate}
              disabled={!formData.title || estimating}
              className="text-xs text-primary hover:bg-primary/5 h-8 w-full justify-start pl-0 gap-2"
            >
              {estimating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {estimating ? "Calculating estimate..." : "Get AI Time Estimate"}
            </Button>
          ) : (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-start gap-3">
              <div className="bg-white p-2 rounded-md shadow-sm">
                {estimatedDuration.source === 'history' ? <Clock className="w-4 h-4 text-blue-500" /> : <BrainCircuit className="w-4 h-4 text-purple-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{estimatedDuration.minutes} minutes</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">{estimatedDuration.source}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{estimatedDuration.reasoning}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details about this task..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
              className="bg-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Team (Optional)</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal (No Team)</SelectItem>
                  {teams.map((t: any) => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Assignee</Label>
              <Select
                value={selectedAssigneeId}
                onValueChange={setSelectedAssigneeId}
                disabled={selectedTeamId === 'personal'}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={selectedTeamId === 'personal' ? "Me" : "Select Member"} />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                taskToEdit ? "Save Changes" : "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
