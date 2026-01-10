import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useAIProfile } from '@/hooks/useAIProfile';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  MessageCircle,
  FileText,
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Check,
  X,
  Loader2,
  Zap,
  Moon,
  Heart,
  Dumbbell,
  BarChart3,
} from 'lucide-react';

const AIInsights = () => {
  const { insights, stats, isLoading, isGenerating, generateInsights } = useAIInsights();
  const { profile, analysis, isAnalyzing, runDeepAnalysis, answerQuestion, updateSuggestion } = useAIProfile();
  
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const handleRunAnalysis = async () => {
    try {
      await runDeepAnalysis();
      toast.success('Deep analysis complete!');
    } catch {
      toast.error('Failed to run analysis');
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!questionAnswer.trim()) return;
    
    try {
      setSubmittingAnswer(true);
      await answerQuestion(questionId, questionAnswer);
      setActiveQuestion(null);
      setQuestionAnswer('');
      toast.success('Answer saved! AI will use this to personalize your insights.');
    } catch {
      toast.error('Failed to save answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'exercise': return <Dumbbell className="w-4 h-4" />;
      case 'productivity': return <Target className="w-4 h-4" />;
      case 'habits': return <Check className="w-4 h-4" />;
      case 'wellness': return <Heart className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">AI Insights</h1>
              <p className="text-xs text-muted-foreground">Your personalized analysis</p>
            </div>
          </div>
          
          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="gap-2"
            size="sm"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Deep Analysis'}
          </Button>
        </motion.div>

        {/* Quick Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          >
            <div className="glass rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.avgEnergy?.toFixed(1) || 0}</p>
              <p className="text-[10px] text-muted-foreground">Avg Energy</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <Heart className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.avgMood?.toFixed(1) || 0}</p>
              <p className="text-[10px] text-muted-foreground">Avg Mood</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <Target className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.taskCompletionRate || 0}%</p>
              <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <BarChart3 className="w-4 h-4 text-info mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.currentStreak || 0}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="glass border border-border/20 p-1 w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="summary" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-1 text-xs py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {/* Daily Insights */}
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      insight.insight_type === 'daily_summary' ? 'bg-primary/20' :
                      insight.insight_type === 'pattern' ? 'bg-info/20' :
                      insight.insight_type === 'prediction' ? 'bg-warning/20' :
                      'bg-success/20'
                    }`}>
                      {insight.insight_type === 'daily_summary' && <Sparkles className="w-4 h-4 text-primary" />}
                      {insight.insight_type === 'pattern' && <TrendingUp className="w-4 h-4 text-info" />}
                      {insight.insight_type === 'prediction' && <Target className="w-4 h-4 text-warning" />}
                      {insight.insight_type === 'recommendation' && <Lightbulb className="w-4 h-4 text-success" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground capitalize mb-0.5">{insight.insight_type.replace('_', ' ')}</p>
                      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{insight.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {insights.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-xl p-6 text-center"
                >
                  <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">No insights yet</h3>
                  <p className="text-xs text-muted-foreground mb-4">Generate AI insights based on your data</p>
                  <Button onClick={() => generateInsights()} disabled={isGenerating} size="sm">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Generate Insights
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Detailed Report */}
            {profile?.detailed_report && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Detailed Report</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{profile.detailed_report.executive_summary}</p>
                
                <div className="space-y-2">
                  {profile.detailed_report.key_insights?.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      <p className="text-xs text-foreground">{insight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            {/* Personality Insights */}
            {profile?.personality_traits && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3">Your Personality Profile</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium">
                    {profile.personality_traits.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{profile.personality_traits.productivity_style}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Strengths</p>
                    <div className="space-y-1">
                      {profile.personality_traits.strengths?.map((s, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-success">
                          <Check className="w-3 h-3" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Growth Areas</p>
                    <div className="space-y-1">
                      {profile.personality_traits.growth_areas?.map((a, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-warning">
                          <Target className="w-3 h-3" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Correlations */}
            {profile?.detailed_report?.correlations && profile.detailed_report.correlations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3">Discovered Correlations</h3>
                <div className="space-y-3">
                  {profile.detailed_report.correlations.map((corr, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground capitalize">{corr.factor1}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground capitalize">{corr.factor2}</span>
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${
                          corr.correlation === 'positive' ? 'bg-success/20 text-success' :
                          corr.correlation === 'negative' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {corr.correlation}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{corr.insight}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Patterns from history */}
            {profile?.discovered_patterns && profile.discovered_patterns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3">Historical Patterns</h3>
                <div className="space-y-2">
                  {profile.discovered_patterns.slice(0, 5).map((pattern: any, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                      <TrendingUp className="w-3 h-3 text-info mt-0.5" />
                      <div>
                        <p className="text-xs text-foreground">{pattern.pattern}</p>
                        <p className="text-[10px] text-muted-foreground">{pattern.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {!profile?.personality_traits && (
              <div className="glass rounded-xl p-6 text-center">
                <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">No patterns detected yet</h3>
                <p className="text-xs text-muted-foreground mb-4">Run a deep analysis to discover your patterns</p>
                <Button onClick={handleRunAnalysis} disabled={isAnalyzing} size="sm">
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Run Analysis
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Help AI Understand You</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Answer these questions to get more personalized insights
              </p>

              <div className="space-y-3">
                {profile?.ai_questions_asked?.length ? (
                  profile.ai_questions_asked.map((q) => (
                    <motion.div
                      key={q.id}
                      layout
                      className="p-3 rounded-xl bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary capitalize">
                          {q.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{q.question}</p>
                      <p className="text-[10px] text-muted-foreground mb-3">{q.purpose}</p>

                      <AnimatePresence>
                        {activeQuestion === q.id ? (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            <Textarea
                              placeholder="Your answer..."
                              value={questionAnswer}
                              onChange={(e) => setQuestionAnswer(e.target.value)}
                              className="min-h-[80px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitAnswer(q.id)}
                                disabled={submittingAnswer || !questionAnswer.trim()}
                              >
                                {submittingAnswer ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                Submit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setActiveQuestion(null);
                                  setQuestionAnswer('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveQuestion(q.id)}
                            className="w-full"
                          >
                            Answer Question
                          </Button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Run a deep analysis to generate personalized questions
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
              </div>

              <div className="space-y-3">
                {Array.isArray(profile?.suggestions) && profile.suggestions.filter(s => !s.dismissed).length ? (
                  profile.suggestions.filter(s => !s.dismissed).map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      layout
                      className={`p-3 rounded-xl border ${
                        suggestion.implemented ? 'bg-success/10 border-success/30' : 'bg-secondary/50 border-border/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(suggestion.category)}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {!suggestion.implemented && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => updateSuggestion(suggestion.id, { implemented: true })}
                              >
                                <Check className="w-3 h-3 text-success" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => updateSuggestion(suggestion.id, { dismissed: true })}
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{suggestion.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                      <p className="text-[10px] text-success">Expected: {suggestion.expected_impact}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Run a deep analysis to get personalized suggestions
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AIInsights;
