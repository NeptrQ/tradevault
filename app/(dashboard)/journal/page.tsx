"use client";

import React, { useState } from "react";
import { Plus, Search, Calendar as CalendarIcon, Tag, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTradeStore } from "@/lib/store";
import { toast } from "sonner";

export default function JournalPage() {
  const { journalEntries, addJournalEntry, deleteJournalEntry, isLoaded } = useTradeStore();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"great" | "good" | "neutral" | "bad" | "terrible">("good");
  const [tagsInput, setTagsInput] = useState("");

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and content");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    addJournalEntry({
      title,
      content,
      mood,
      tags,
      entry_date: new Date().toISOString().slice(0, 10),
    });

    setIsSheetOpen(false);
    setTitle("");
    setContent("");
    setTagsInput("");
    toast.success("Journal entry saved!");
  };

  const getMoodColor = (m: string) => {
    switch (m.toLowerCase()) {
      case "great":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "good":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "neutral":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "bad":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "terrible":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary";
    }
  };

  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesMood = moodFilter === "all" || (entry.mood && entry.mood.toLowerCase() === moodFilter.toLowerCase());

    return matchesSearch && matchesMood;
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground animate-pulse">Loading journal...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Document your thoughts, emotions, and trade reviews.</p>
        </div>
        
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Button>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="sm:max-w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Journal Entry</SheetTitle>
              <SheetDescription>Record your trading day, reviews, or psychological observations.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSaveEntry} className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Daily Review, Missed Trade Analysis..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={(val) => setMood(val as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">🤩 Great</SelectItem>
                    <SelectItem value="good">🙂 Good</SelectItem>
                    <SelectItem value="neutral">😐 Neutral</SelectItem>
                    <SelectItem value="bad">🙁 Bad</SelectItem>
                    <SelectItem value="terrible">😫 Terrible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" 
                  placeholder="Psychology, Review, Strategy..." 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Entry Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="What's on your mind? What lessons did you learn today?" 
                  className="min-h-[200px] resize-y" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <SheetFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button type="submit">Save Entry</Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{journalEntries.length}</div>
            <p className="text-sm text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-orange-500">{journalEntries.length > 0 ? `${journalEntries.length}🔥` : "0"}</div>
            <p className="text-sm text-muted-foreground">Entries Logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">🙂 Active</div>
            <p className="text-sm text-muted-foreground">Journal Status</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search entries, tags, or content..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={moodFilter} onValueChange={setMoodFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            <SelectItem value="great">Great</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
            <SelectItem value="terrible">Terrible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 pb-10">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{entry.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center"><CalendarIcon className="mr-1 h-3.5 w-3.5" />{entry.entry_date}</span>
                      {entry.mood && (
                        <Badge variant="outline" className={getMoodColor(entry.mood)}>
                          {entry.mood.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      deleteJournalEntry(entry.id);
                      toast.success(`Entry "${entry.title}" deleted`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-foreground/90 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </CardContent>
              {entry.tags && entry.tags.length > 0 && (
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  {entry.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </CardFooter>
              )}
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50 border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No journal entries found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              We couldn&apos;t find any entries matching your search.
            </p>
            <Button onClick={() => setIsSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create your first entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
