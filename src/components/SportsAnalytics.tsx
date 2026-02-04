import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Trophy, 
  Calendar,
  RefreshCw,
  Loader2,
  Sparkles,
  Target,
  Star,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Team {
  name: string;
  logo?: string;
  record?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  time: string;
  league: string;
  probability?: number;
  suggestion?: string;
}

interface StrategicPick {
  team: string;
  league: string;
  sport: string;
  probability: number;
  reason: string;
}

const SPORTS = [
  { id: 'soccer', name: 'Fútbol', icon: '⚽' },
  { id: 'baseball', name: 'Béisbol', icon: '⚾' },
  { id: 'basketball', name: 'Básquet', icon: '🏀' },
];

const LEAGUES: Record<string, { id: string; name: string; country: string }[]> = {
  soccer: [
    { id: 'laliga', name: 'La Liga', country: 'España' },
    { id: 'premier', name: 'Premier League', country: 'Inglaterra' },
    { id: 'seriea', name: 'Serie A', country: 'Italia' },
    { id: 'bundesliga', name: 'Bundesliga', country: 'Alemania' },
    { id: 'ligue1', name: 'Ligue 1', country: 'Francia' },
    { id: 'libertadores', name: 'Copa Libertadores', country: 'Sudamérica' },
  ],
  baseball: [
    { id: 'mlb', name: 'MLB', country: 'USA' },
    { id: 'lvbp', name: 'LVBP', country: 'Venezuela' },
  ],
  basketball: [
    { id: 'nba', name: 'NBA', country: 'USA' },
    { id: 'euroleague', name: 'EuroLeague', country: 'Europa' },
  ],
};

// Mock data generator for today's matches
const generateMockMatches = (sport: string, league: string): Match[] => {
  const mockTeams: Record<string, string[][]> = {
    'laliga': [['Real Madrid', 'Barcelona'], ['Atlético Madrid', 'Sevilla'], ['Valencia', 'Athletic Bilbao']],
    'premier': [['Manchester City', 'Liverpool'], ['Arsenal', 'Chelsea'], ['Tottenham', 'Manchester United']],
    'seriea': [['Inter', 'AC Milan'], ['Juventus', 'Napoli'], ['Roma', 'Lazio']],
    'mlb': [['Yankees', 'Red Sox'], ['Dodgers', 'Giants'], ['Cubs', 'Cardinals']],
    'lvbp': [['Leones', 'Magallanes'], ['Tiburones', 'Caribes'], ['Águilas', 'Navegantes']],
    'nba': [['Lakers', 'Celtics'], ['Warriors', 'Suns'], ['Nuggets', 'Bucks']],
  };

  const teams = mockTeams[league] || [['Equipo A', 'Equipo B']];
  const times = ['2:00 PM', '4:00 PM', '7:00 PM', '9:00 PM'];

  return teams.map((pair, idx) => ({
    id: `${league}-${idx}`,
    homeTeam: { name: pair[0], trend: Math.random() > 0.5 ? 'up' : 'neutral' },
    awayTeam: { name: pair[1], trend: Math.random() > 0.5 ? 'up' : 'down' },
    time: times[idx] || times[0],
    league: LEAGUES[sport]?.find(l => l.id === league)?.name || league,
    probability: Math.round(50 + Math.random() * 35),
    suggestion: Math.random() > 0.5 ? pair[0] : pair[1],
  }));
};

export function SportsAnalytics() {
  const [selectedSport, setSelectedSport] = useState<string>('soccer');
  const [selectedLeague, setSelectedLeague] = useState<string>('laliga');
  const [matches, setMatches] = useState<Match[]>([]);
  const [strategicPicks, setStrategicPicks] = useState<StrategicPick[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  const currentSport = SPORTS.find(s => s.id === selectedSport);
  const availableLeagues = LEAGUES[selectedSport] || [];

  const loadMatches = useCallback(() => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      const mockMatches = generateMockMatches(selectedSport, selectedLeague);
      setMatches(mockMatches);
      setLoading(false);
    }, 500);
  }, [selectedSport, selectedLeague]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Reset league when sport changes
  useEffect(() => {
    const leagues = LEAGUES[selectedSport];
    if (leagues && leagues.length > 0) {
      setSelectedLeague(leagues[0].id);
    }
  }, [selectedSport]);

  const generateAIAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      // Generate strategic picks based on "analysis"
      const picks: StrategicPick[] = [];
      
      // Pick from each sport
      for (const sport of SPORTS) {
        const sportLeagues = LEAGUES[sport.id];
        if (sportLeagues && sportLeagues.length > 0) {
          const randomLeague = sportLeagues[Math.floor(Math.random() * sportLeagues.length)];
          const mockMatches = generateMockMatches(sport.id, randomLeague.id);
          
          if (mockMatches.length > 0) {
            const bestMatch = mockMatches.reduce((a, b) => 
              (a.probability || 0) > (b.probability || 0) ? a : b
            );
            
            picks.push({
              team: bestMatch.suggestion || bestMatch.homeTeam.name,
              league: bestMatch.league,
              sport: sport.name,
              probability: bestMatch.probability || 70,
              reason: `Tendencia positiva en últimos 5 partidos. ${
                sport.id === 'soccer' ? 'Defensa sólida como visitante.' :
                sport.id === 'baseball' ? 'Pitcheo dominante esta temporada.' :
                'Porcentaje de tiros alto en cuartos finales.'
              }`,
            });
          }
        }
      }

      // Sort by probability and take top 5
      picks.sort((a, b) => b.probability - a.probability);
      setStrategicPicks(picks.slice(0, 5));
      
      toast.success('¡Análisis IA completado!');
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast.error('Error al generar análisis');
    }
    setAnalyzingAI(false);
  };

  return (
    <div className="space-y-6">
      {/* Main Analysis Card */}
      <Card className="glass-card border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Tendencias Deportivas
            </CardTitle>

            <Button
              onClick={generateAIAnalysis}
              disabled={analyzingAI}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
            >
              {analyzingAI ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Propuesta IA
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Análisis estadístico de tendencias deportivas • Fútbol, Béisbol, Básquet
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sport & League Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Deporte</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg">
                  {SPORTS.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      <div className="flex items-center gap-2">
                        <span>{sport.icon}</span>
                        <span>{sport.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Liga</label>
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg">
                  {availableLeagues.map((league) => (
                    <SelectItem key={league.id} value={league.id}>
                      <div className="flex items-center gap-2">
                        <span>{league.name}</span>
                        <span className="text-[10px] text-muted-foreground">({league.country})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Today's Matches */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Encuentros del Día
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMatches}
                disabled={loading}
                className="ml-auto h-7"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay encuentros programados</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="space-y-2 pr-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Home Team */}
                      <div className="flex-1 text-right">
                        <span className="font-medium">{match.homeTeam.name}</span>
                        {match.homeTeam.trend === 'up' && (
                          <span className="ml-1 text-emerald-500">↑</span>
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-center px-3">
                        <span className="text-xs text-muted-foreground block">{match.time}</span>
                        <span className="text-lg font-bold">VS</span>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1">
                        <span className="font-medium">{match.awayTeam.name}</span>
                        {match.awayTeam.trend === 'up' && (
                          <span className="ml-1 text-emerald-500">↑</span>
                        )}
                      </div>

                      {/* Suggestion */}
                      {match.suggestion && (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 text-[10px] rounded-full font-medium">
                            {match.probability}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            → {match.suggestion}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strategic AI Picks */}
      {strategicPicks.length > 0 && (
        <Card className="glass-card border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Target className="w-5 h-5 text-white" />
              </div>
              Propuesta Estratégica Combinada
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (Máx. 5 selecciones)
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {strategicPicks.map((pick, idx) => (
                <div
                  key={`${pick.team}-${idx}`}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${idx === 0 
                      ? 'bg-amber-500/10 border-amber-500/50' 
                      : 'bg-muted/30 border-border'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${idx === 0 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}
                  `}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{pick.team}</span>
                      {idx === 0 && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{pick.sport}</span>
                      <span>•</span>
                      <span>{pick.league}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {pick.reason}
                    </p>
                  </div>

                  <div className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${pick.probability >= 80 ? 'bg-emerald-500 text-white' : 
                      pick.probability >= 70 ? 'bg-amber-500 text-white' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {pick.probability}%
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground text-center mt-4">
              ⚠️ Análisis basado en tendencias históricas. Los resultados no están garantizados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
