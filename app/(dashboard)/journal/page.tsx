"use client";

import React, { useState } from "react";
import { Plus, Search, Calendar as CalendarIcon, Tag, Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  mood: "Great" | "Good" | "Neutral" | "Bad" | "Terrible";
  tags: string[];
  content: string;
}

const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    title: "Weekly Review - Strong Start",
    date: "Aug 22, 2026",
    mood: "Good",
    tags: ["Review", "Discipline"],
    content: "Strong week overall. Stuck to my rules and walked away when conditions weren't favorable. The patience paid off on Thursday when the setup finally appeared.",
  },
  {
    id: "2",
    title: "Revenge Trade Analysis",
    date: "Aug 20, 2026",
    mood: "Bad",
    tags: ["Psychology", "Overtrading"],
    content: "After losing my first GBPUSD trade I immediately entered again without a setup. This was pure emotional reaction. Need to implement a 15-minute walk-away rule after a stop out.",
  },
  {
    id: "3",
    title: "Breakout Strategy Working Well",
    date: "Aug 19, 2026",
    mood: "Great",
    tags: ["Strategy", "Breakout"],
    content: "Hit my daily target by noon today. The London open breakout strategy has been extremely reliable this month. Key was waiting for the retest before entering.",
  },
  {
    id: "4",
    title: "Missed Opportunity on Gold",
    date: "Aug 15, 2026",
    mood: "Neutral",
    tags: ["FOMO", "Patience"],
    content: "Saw the XAUUSD setup forming but hesitated because of the upcoming news. Price ran to target without me. Frustrating, but preserving capital was the safer choice.",
  },
  {
    id: "5",
    title: "Daily Review - August 12",
    date: "Aug 12, 2026",
    mood: "Good",
    tags: ["Review"],
    content: "Two clean trades today. One winner, one breakeven. Executed the plan flawlessly. Feeling confident in the current market conditions.",
  },
];

export default function JournalPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "Great":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Good":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "Neutral":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "Bad":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Terrible":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary";
    }
  };

  const filteredEntries = DEMO_ENTRIES.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Document your thoughts, emotions, and trade reviews.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Entry
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>New Journal Entry</SheetTitle>
              <SheetDescription>Record your trading day, reviews, or psychological observations.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Daily Review, Missed Trade Analysis..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Aug 22, 2026
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select defaultValue="Neutral">
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Great">🤩 Great</SelectItem>
                      <SelectItem value="Good">🙂 Good</SelectItem>
                      <SelectItem value="Neutral">😐 Neutral</SelectItem>
                      <SelectItem value="Bad">🙁 Bad</SelectItem>
                      <SelectItem value="Terrible">😫 Terrible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" placeholder="Psychology, Review, Strategy..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Entry Content</Label>
                <Textarea 
                  id="content" 
                  placeholder="What's on your mind?" 
                  className="min-h-[200px] resize-y" 
                />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit" onClick={() => setIsSheetOpen(false)}>Save Entry</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">142</div>
            <p className="text-sm text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-orange-500">12🔥</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">🙂 Good</div>
            <p className="text-sm text-muted-foreground">Average Mood</p>
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
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All Moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            <SelectItem value="great">Great</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
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
                      <span className="flex items-center"><CalendarIcon className="mr-1 h-3.5 w-3.5" />{entry.date}</span>
                      <Badge variant="outline" className={getMoodColor(entry.mood)}>
                        {entry.mood}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-foreground/90 line-clamp-3">
                  {entry.content}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-3 w-3" /> {tag}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50 border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No journal entries found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              We couldn't find any entries matching your search.
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
