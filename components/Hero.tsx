'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Zap, Shield, Users, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-background -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10" />
      
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>
      
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Your productivity partner</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Organize Your Life,{' '}
                <span className="text-primary">One Do</span> at a Time
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Stay on top of your tasks with our intuitive to-do list. 
                Boost productivity, meet deadlines, and achieve your goals effortlessly.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto hover:cursor-pointer">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Smart Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Categorize and prioritize with ease
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Quick task creation and updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            {/* Floating Cards */}
            <div className="relative w-full max-w-lg">
              {/* Main Card */}
              <div className="bg-card border rounded-2xl shadow-2xl p-6 space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Today's Tasks</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>5/8 completed</span>
                  </div>
                </div>

                {/* Task Items */}
                <div className="space-y-3">
                  {[
                    { title: 'Review project', completed: true, priority: 'high' },
                    { title: 'Team standup meeting', completed: true, priority: 'medium' },
                    { title: 'Update documentation', completed: false, priority: 'low' },
                    { title: 'Code review for final submit', completed: false, priority: 'high' },
                  ].map((task, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.completed ? 'bg-muted/50' : 'bg-background'
                      } transition-all hover:shadow-md`}
                    >
                      <div
                        className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                          task.completed
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -top-8 -right-4 bg-card border rounded-xl shadow-xl p-4 w-48 z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">125</p>
                    <p className="text-xs text-muted-foreground">Tasks completed</p>
                  </div>
                </div>
              </div>

              {/* Floating Progress Card */}
              <div className="absolute -bottom-8 -left-4 bg-card border rounded-xl shadow-xl p-4 w-56 z-20 animate-float-delayed">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Weekly Progress</span>
                    <span className="text-primary font-semibold">75%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Great job! Keep up the momentum
                  </p>
                </div>
              </div>

              {/* Background Blur Circles */}
              <div className="absolute top-1/4 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-1/4 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
          background-size: 4rem 4rem;
        }
      `}</style>
    </div>
  );
}