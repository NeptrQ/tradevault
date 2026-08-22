"use client";

import React, { useState } from "react";
import { Plus, Edit2, Check, Trash2, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GoalStatus = "on track" | "at risk" | "behind" | "completed";

interface Goal {
  id: string;
  title: string;
  type: string;
  period: string;
  progress: number;
  target: number;
  progressText: string;
  percentage: number;
  daysRemaining: number | "ongoing";
  status: GoalStatus;
}

const DEMO_GOALS: Goal[] = [
  {
    id: "1",
    title: "Monthly Profit Goal",
    type: "Profit",
    period: "Monthly",
    progress: 1520,
    target: 2000,
    progressText: "$1,520 / $2,000",
    percentage: 76,
    daysRemaining: 12,
    status: "on track",
  },
  {
    id: "2",
    title: "Max Drawdown",
    type: "Drawdown",
    period: "Ongoing",
    progress: 2.1,
    target: 5,
    progressText: "2.1% / 5% limit",
    percentage: 42,
    daysRemaining: "ongoing",
    status: "on track",
  },
  {
    id: "3",
    title: "Win Rate Target",
    type: "Risk",
    period: "Monthly",
    progress: 58,
    target: 60,
    progressText: "58% / 60% target",
    percentage: 97,
    daysRemaining: 12,
    status: "at risk",
  },
  {
    id: "4",
    title: "Journal Every Trade",
    type: "Journaling",
    period: "Weekly",
    progress: 18,
    target: 20,
    progressText: "18 / 20 trades",
    percentage: 90,
    daysRemaining: 3,
    status: "on track",
  },
  {
    id: "5",
    title: "Max Risk Per Trade",
    type: "Risk",
    period: "Ongoing",
    progress: 1.2,
    target: 2,
    progressText: "1.2% / 2% limit",
    percentage: 60,
    daysRemaining: "ongoing",
    status: "on track",
  },
];

export default function GoalsPage() {
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const activeGoals = DEMO_GOALS.length;
  const completedThisMonth = 2;
  const successRate = 85;

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case "on track":
        return "text-green-500 bg-green-500/10";
      case "at risk":
        return "text-yellow-500 bg-yellow-500/10";
      case "behind":
        return "text-red-500 bg-red-500/10";
      case "completed":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Track and manage your trading objectives.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new objective for your trading journey.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" placeholder="e.g. Monthly Profit" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profit">Profit</SelectItem>
                    <SelectItem value="drawdown">Drawdown</SelectItem>
                    <SelectItem value="risk">Risk</SelectItem>
                    <SelectItem value="journaling">Journaling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Period
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target" className="text-right">
                  Target
                </Label>
                <Input id="target" type="number" placeholder="0.00" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>Save Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed (This Month)</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {DEMO_GOALS.map((goal) => (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{goal.type}</Badge>
                        <Badge variant="outline">{goal.period}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{goal.progressText}</span>
                      <span className="font-medium">{goal.percentage}%</span>
                    </div>
                    <Progress value={goal.percentage} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {goal.daysRemaining === "ongoing" ? "Ongoing" : `${goal.daysRemaining} days left`}
                    </div>
                    <Badge variant="secondary" className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-green-500">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
