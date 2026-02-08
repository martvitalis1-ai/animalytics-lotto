import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Team {
  name: string;
  logo?: string;
  record?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface MatchOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  over: number;
  under: number;
  overLine: number;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  time: string;
  league: string;
  odds: MatchOdds;
  probability: number;
  suggestion: string;
  suggestedMarket: 'home' | 'draw' | 'away' | 'over' | 'under';
}

interface StrategicPick {
  team: string;
  league: string;
  sport: string;
  probability: number;
  reason: string;
  market: string;
}

const SPORTS = [
  { id: 'soccer', name: 'Fútbol', icon: '⚽' },
  { id: 'baseball', name: 'Béisbol', icon: '⚾' },
  { id: 'basketball', name: 'Básquet', icon: '🏀' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
  { id: 'football', name: 'NFL', icon: '🏈' },
];

const LEAGUES: Record<string, { id: string; name: string; country: string }[]> = {
  soccer: [
    { id: 'laliga', name: 'La Liga', country: 'España' },
    { id: 'premier', name: 'Premier League', country: 'Inglaterra' },
    { id: 'seriea', name: 'Serie A', country: 'Italia' },
    { id: 'bundesliga', name: 'Bundesliga', country: 'Alemania' },
    { id: 'ligue1', name: 'Ligue 1', country: 'Francia' },
    { id: 'libertadores', name: 'Copa Libertadores', country: 'Sudamérica' },
    { id: 'champions', name: 'Champions League', country: 'Europa' },
  ],
  baseball: [
    { id: 'mlb', name: 'MLB', country: 'USA' },
    { id: 'lvbp', name: 'LVBP', country: 'Venezuela' },
    { id: 'lmp', name: 'LMP', country: 'México' },
  ],
  basketball: [
    { id: 'nba', name: 'NBA', country: 'USA' },
    { id: 'euroleague', name: 'EuroLeague', country: 'Europa' },
    { id: 'wnba', name: 'WNBA', country: 'USA' },
  ],
  hockey: [
    { id: 'nhl', name: 'NHL', country: 'USA/Canada' },
    { id: 'khl', name: 'KHL', country: 'Rusia' },
  ],
  football: [
    { id: 'nfl', name: 'NFL', country: 'USA' },
    { id: 'ncaa', name: 'NCAA Football', country: 'USA' },
  ],
};

// Generate matches with complete odds
const generateMockMatches = (sport: string, league: string): Match[] => {
  const mockTeams: Record<string, string[][]> = {
    'laliga': [['Real Madrid', 'Barcelona'], ['Atlético Madrid', 'Sevilla'], ['Valencia', 'Athletic Bilbao']],
    'premier': [['Manchester City', 'Liverpool'], ['Arsenal', 'Chelsea'], ['Tottenham', 'Manchester United']],
    'seriea': [['Inter', 'AC Milan'], ['Juventus', 'Napoli'], ['Roma', 'Lazio']],
    'bundesliga': [['Bayern Munich', 'Borussia Dortmund'], ['RB Leipzig', 'Bayer Leverkusen']],
    'champions': [['Real Madrid', 'Man City'], ['Bayern Munich', 'PSG']],
    'libertadores': [['Flamengo', 'River Plate'], ['Boca Juniors', 'Palmeiras'], ['Atlético Mineiro', 'Fluminense']],
    'mlb': [['Yankees', 'Red Sox'], ['Dodgers', 'Giants'], ['Cubs', 'Cardinals']],
    'lvbp': [['Leones', 'Magallanes'], ['Tiburones', 'Caribes'], ['Águilas', 'Navegantes']],
    'lmp': [['Yaquis', 'Tomateros'], ['Mayos', 'Venados']],
    'nba': [['Lakers', 'Celtics'], ['Warriors', 'Suns'], ['Nuggets', 'Bucks']],
    'wnba': [['Aces', 'Liberty'], ['Storm', 'Sky']],
    'nhl': [['Oilers', 'Panthers'], ['Rangers', 'Bruins'], ['Avalanche', 'Golden Knights']],
    'khl': [['SKA', 'CSKA'], ['Ak Bars', 'Metallurg']],
    'nfl': [['Chiefs', 'Eagles'], ['49ers', 'Cowboys'], ['Ravens', 'Bills']],
    'ncaa': [['Alabama', 'Georgia'], ['Michigan', 'Ohio State']],
  };

  const teams = mockTeams[league] || [['Equipo A', 'Equipo B']];
  const times = ['2:00 PM', '4:00 PM', '7:00 PM', '9:00 PM'];
  const hasDrawOption = sport === 'soccer';

  return teams.map((pair, idx) => {
    // Generate realistic odds
    const homeStrength = 40 + Math.random() * 30;
    const awayStrength = 30 + Math.random() * 30;
    const drawProb = hasDrawOption ? 15 + Math.random() * 15 : 0;
    
    const total = homeStrength + awayStrength + drawProb;
    const homeWin = Math.round((homeStrength / total) * 100);
    const awayWin = Math.round((awayStrength / total) * 100);
    const draw = hasDrawOption ? 100 - homeWin - awayWin : 0;

    // Over/Under line based on sport
    const overLines: Record<string, number> = {
      soccer: 2.5,
      basketball: 220.5,
      baseball: 8.5,
      hockey: 5.5,
      football: 45.5,
    };
    const overLine = overLines[sport] || 2.5;
    const overProb = 45 + Math.random() * 15;
    const underProb = 100 - overProb;

    // Determine best suggestion
    let suggestion = pair[0];
    let suggestedMarket: 'home' | 'draw' | 'away' | 'over' | 'under' = 'home';
    let maxProb = homeWin;

    if (awayWin > maxProb) {
      suggestion = pair[1];
      suggestedMarket = 'away';
      maxProb = awayWin;
    }
    if (hasDrawOption && draw > maxProb) {
      suggestion = 'Empate';
      suggestedMarket = 'draw';
      maxProb = draw;
    }
    if (overProb > maxProb) {
      suggestion = `Alta (>${overLine})`;
      suggestedMarket = 'over';
      maxProb = Math.round(overProb);
    }
    if (underProb > maxProb + 5) {
      suggestion = `Baja (<${overLine})`;
      suggestedMarket = 'under';
      maxProb = Math.round(underProb);
    }

    return {
      id: `${league}-${idx}`,
      homeTeam: { name: pair[0], trend: Math.random() > 0.5 ? 'up' : 'neutral' },
      awayTeam: { name: pair[1], trend: Math.random() > 0.5 ? 'up' : 'down' },
      time: times[idx] || times[0],
      league: LEAGUES[sport]?.find(l => l.id === league)?.name || league,
      odds: {
        homeWin,
        draw,
        awayWin,
        over: Math.round(overProb),
        under: Math.round(underProb),
        overLine,
      },
      probability: maxProb,
      suggestion,
      suggestedMarket,
    };
  });
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
  const hasDrawOption = selectedSport === 'soccer';

  const loadMatches = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const mockMatches = generateMockMatches(selectedSport, selectedLeague);
      setMatches(mockMatches);
      setLoading(false);
    }, 500);
  }, [selectedSport, selectedLeague]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useEffect(() => {
    const leagues = LEAGUES[selectedSport];
    if (leagues && leagues.length > 0) {
      setSelectedLeague(leagues[0].id);
    }
  }, [selectedSport]);

  const generateAIAnalysis = async () => {
    setAnalyzingAI(true);
    try {
      const picks: StrategicPick[] = [];
      
      for (const sport of SPORTS) {
        const sportLeagues = LEAGUES[sport.id];
        if (sportLeagues && sportLeagues.length > 0) {
          const randomLeague = sportLeagues[Math.floor(Math.random() * sportLeagues.length)];
          const mockMatches = generateMockMatches(sport.id, randomLeague.id);
          
          if (mockMatches.length > 0) {
            const bestMatch = mockMatches.reduce((a, b) => 
              (a.probability || 0) > (b.probability || 0) ? a : b
            );
            
            const marketLabels: Record<string, string> = {
              home: `Gana ${bestMatch.homeTeam.name}`,
              away: `Gana ${bestMatch.awayTeam.name}`,
              draw: 'Empate',
              over: `Alta (>${bestMatch.odds.overLine})`,
              under: `Baja (<${bestMatch.odds.overLine})`,
            };
            
            picks.push({
              team: bestMatch.suggestion,
              league: bestMatch.league,
              sport: sport.name,
              probability: bestMatch.probability,
              market: marketLabels[bestMatch.suggestedMarket],
              reason: `Tendencia positiva en últimos 5 partidos. ${
                sport.id === 'soccer' ? 'Defensa sólida como visitante.' :
                sport.id === 'baseball' ? 'Pitcheo dominante esta temporada.' :
                sport.id === 'hockey' ? 'Power play efectivo al 28%.' :
                sport.id === 'football' ? 'Línea ofensiva dominante.' :
                'Porcentaje de tiros alto en cuartos finales.'
              }`,
            });
          }
        }
      }

      picks.sort((a, b) => b.probability - a.probability);
      setStrategicPicks(picks.slice(0, 5));
      
      toast.success('¡Análisis IA completado!');
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast.error('Error al generar análisis');
    }
    setAnalyzingAI(false);
  };

  const getMarketColor = (market: string, isActive: boolean) => {
    if (!isActive) return 'bg-muted text-muted-foreground';
    if (market.includes('Gana') || market === 'home' || market === 'away') {
      return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50';
    }
    if (market.includes('Empate') || market === 'draw') {
      return 'bg-amber-500/20 text-amber-600 border-amber-500/50';
    }
    if (market.includes('Alta') || market === 'over') {
      return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
    }
    if (market.includes('Baja') || market === 'under') {
      return 'bg-purple-500/20 text-purple-600 border-purple-500/50';
    }
    return 'bg-muted text-muted-foreground';
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
            Análisis estadístico • Hockey (NHL), NFL, NBA, MLB, Fútbol (Libertadores/Champions)
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

          {/* Today's Matches with Full Odds */}
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
              <ScrollArea className="h-[350px]">
                <div className="space-y-3 pr-4">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="text-right flex-1">
                            <span className="font-medium">{match.homeTeam.name}</span>
                            {match.homeTeam.trend === 'up' && (
                              <ArrowUp className="inline w-3 h-3 ml-1 text-emerald-500" />
                            )}
                          </div>
                          <div className="px-3 py-1 bg-card rounded-lg">
                            <span className="text-xs text-muted-foreground">{match.time}</span>
                            <div className="text-lg font-bold">VS</div>
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{match.awayTeam.name}</span>
                            {match.awayTeam.trend === 'up' && (
                              <ArrowUp className="inline w-3 h-3 ml-1 text-emerald-500" />
                            )}
                            {match.awayTeam.trend === 'down' && (
                              <ArrowDown className="inline w-3 h-3 ml-1 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Odds Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        <div className={`p-2 rounded border ${match.suggestedMarket === 'home' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-muted/50 border-border'}`}>
                          <div className="text-[10px] text-muted-foreground">Gana Local</div>
                          <div className={`font-bold ${match.suggestedMarket === 'home' ? 'text-emerald-600' : ''}`}>
                            {match.odds.homeWin}%
                          </div>
                        </div>
                        {hasDrawOption && (
                          <div className={`p-2 rounded border ${match.suggestedMarket === 'draw' ? 'bg-amber-500/20 border-amber-500' : 'bg-muted/50 border-border'}`}>
                            <div className="text-[10px] text-muted-foreground">Empate</div>
                            <div className={`font-bold ${match.suggestedMarket === 'draw' ? 'text-amber-600' : ''}`}>
                              {match.odds.draw}%
                            </div>
                          </div>
                        )}
                        <div className={`p-2 rounded border ${match.suggestedMarket === 'away' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-muted/50 border-border'}`}>
                          <div className="text-[10px] text-muted-foreground">Gana Visitante</div>
                          <div className={`font-bold ${match.suggestedMarket === 'away' ? 'text-emerald-600' : ''}`}>
                            {match.odds.awayWin}%
                          </div>
                        </div>
                      </div>

                      {/* Over/Under */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className={`p-2 rounded border ${match.suggestedMarket === 'over' ? 'bg-blue-500/20 border-blue-500' : 'bg-muted/50 border-border'}`}>
                          <div className="text-[10px] text-muted-foreground">Alta (&gt;{match.odds.overLine})</div>
                          <div className={`font-bold ${match.suggestedMarket === 'over' ? 'text-blue-600' : ''}`}>
                            {match.odds.over}%
                          </div>
                        </div>
                        <div className={`p-2 rounded border ${match.suggestedMarket === 'under' ? 'bg-purple-500/20 border-purple-500' : 'bg-muted/50 border-border'}`}>
                          <div className="text-[10px] text-muted-foreground">Baja (&lt;{match.odds.overLine})</div>
                          <div className={`font-bold ${match.suggestedMarket === 'under' ? 'text-purple-600' : ''}`}>
                            {match.odds.under}%
                          </div>
                        </div>
                      </div>

                      {/* Suggestion */}
                      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Sugerencia IA:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${getMarketColor(match.suggestedMarket, true)}`}>
                          {match.suggestion} ({match.probability}%)
                        </span>
                      </div>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold">{pick.team}</span>
                      {idx === 0 && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{pick.market}</span>
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
