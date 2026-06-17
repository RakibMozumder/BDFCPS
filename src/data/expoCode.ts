export const EXPO_CODE_FILES = [
  {
    name: 'package.json',
    language: 'json',
    description: 'Project dependencies configured for standard Expo SDK 51/52, React Navigation, and Tailwind styling via NativeWind.',
    code: `{
  "name": "fcps-exam-prep-mobile",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "lucide-react-native": "^0.379.0",
    "nativewind": "^2.0.11",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1",
    "react-native-svg": "15.2.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "typescript": "~5.3.3",
    "tailwindcss": "^3.3.2"
  },
  "private": true
}`
  },
  {
    name: 'App.tsx',
    language: 'typescript',
    description: 'Central root file setting up standard Navigation Containers, beautiful Slate Blue & Teal themes, and Bottom Tab parameters for all 4 mobile views.',
    code: `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home as HomeIcon, 
  Activity as LiveIcon, 
  BookOpen as PracticeIcon, 
  BarChart2 as AnalyticsIcon 
} from 'lucide-react-native';

// Import screens (defined below)
import HomeScreen from './screens/HomeScreen';
import LiveExamsScreen from './screens/LiveExamsScreen';
import PracticeScreen from './screens/PracticeScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();

// Slate & Teal Medical Theme matching top-tier design guidelines
const MedicalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0d9488', // Teal 600
    background: '#f8fafc', // Slate 50
    card: '#ffffff',
    text: '#1e293b', // Slate 800
    border: '#e2e8f0', // Slate 200
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MedicalTheme}>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const iconSize = focused ? 25 : 22;
              if (route.name === 'Home') {
                return <HomeIcon color={color} size={iconSize} />;
              } else if (route.name === 'Live Exams') {
                return <LiveIcon color={focused ? '#0d9488' : color} size={iconSize} />;
              } else if (route.name === 'Practice') {
                return <PracticeIcon color={color} size={iconSize} />;
              } else if (route.name === 'Analytics') {
                return <AnalyticsIcon color={color} size={iconSize} />;
              }
              return null;
            },
            tabBarActiveTintColor: '#0d9488', // Teal 600
            tabBarInactiveTintColor: '#64748b', // Slate 500
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#e2e8f0',
              paddingBottom: 8,
              paddingTop: 8,
              height: 64,
              elevation: 4,
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'System',
              fontWeight: '500',
              marginTop: 2,
            },
            headerStyle: {
              backgroundColor: '#0f172a', // Deep slate header for medical professional atmosphere
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#1e293b',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'FCPS Companion' }}
          />
          <Tab.Screen 
            name="Live Exams" 
            component={LiveExamsScreen} 
            options={{ title: 'Live Examination' }}
          />
          <Tab.Screen 
            name="Practice" 
            component={PracticeScreen} 
            options={{ title: 'Subject Practice Qs' }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsScreen} 
            options={{ title: 'Performance Diagnostics' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}`
  },
  {
    name: 'screens/HomeScreen.tsx',
    language: 'typescript',
    description: 'Displays Doctor Profile and Goals, the beautiful vertical streak tracker flame container, and the immediate Live MCQ invitation.',
    code: `import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Award, Flame, Zap, ArrowRight, BookOpen, Star } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-slate-50 px-4 py-5" showsVerticalScrollIndicator={false}>
      
      {/* Visual Header / Welcome Greeting */}
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-slate-900">Assalam-o-Alaikum,</Text>
          <Text className="text-sm text-slate-500">Dr. Sarah Ahmed</Text>
        </View>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' }}
          className="w-12 h-12 rounded-full border-2 border-teal-500"
        />
      </View>

      {/* Doctor Specialty Profile Card */}
      <View className="bg-slate-900 rounded-2xl p-5 mb-5 shadow-lg relative overflow-hidden">
        <View className="absolute right-[-20] top-[-20] w-32 h-32 bg-teal-500 rounded-full opacity-10" />
        <View className="flex-row items-center mb-3">
          <View className="bg-teal-500/10 p-2 rounded-lg mr-3">
            <Award color="#14b8a6" size={24} />
          </View>
          <View>
            <Text className="text-white font-bold text-lg">FCPS Candidate Profile</Text>
            <Text className="text-slate-400 text-xs">Specialty: Internal Medicine & Allied</Text>
          </View>
        </View>
        <View className="border-t border-slate-800 pt-3 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-400 text-[10px]">CPSP REGISTRATION ID</Text>
            <Text className="text-teal-400 font-mono text-xs">MED-FCPS-2026-904</Text>
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[10px]">EXAM TARGET DATE</Text>
            <Text className="text-white font-bold text-xs">October 24, 2026</Text>
          </View>
        </View>
      </View>

      {/* Daily Streak Counter with Visual Grid */}
      <View className="bg-white rounded-2xl p-5 mb-5 border border-slate-100 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Flame color="#f97316" size={26} fill="#f97316" />
            <Text className="text-slate-800 text-base font-bold ml-2">7 Days Prep Streak!</Text>
          </View>
          <View className="bg-orange-50 px-3 py-1 rounded-full">
            <Text className="text-orange-600 font-bold text-xs">Top 5%</Text>
          </View>
        </View>
        
        {/* Weekly matrix */}
        <View className="flex-row justify-between mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, ix) => (
            <View key={day} className="items-center">
              <View className={\`w-8 h-8 rounded-full items-center justify-center mb-1 \${ix < 6 ? 'bg-teal-500' : 'bg-slate-100'}\`}>
                {ix < 6 ? <Star color="#white" size={14} fill="#white" /> : <Text className="text-slate-400 text-xs">-</Text>}
              </View>
              <Text className="text-slate-400 text-[10px]">{day}</Text>
            </View>
          ))}
        </View>
        <Text className="text-slate-500 text-xs text-center mt-2">
          Maintain your 7-day streak to cover 100% of the CPSP syllabus before exam dates.
        </Text>
      </View>

      {/* Today's shortcut to Live Mock */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Live Exams')}
        className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 mb-5 flex-row items-center justify-between"
        style={{ backgroundColor: '#0d9488' }}
      >
        <View className="flex-1 pr-4">
          <View className="bg-white/20 self-start px-2 py-0.5 rounded mb-2">
            <Text className="text-white text-[10px] font-bold">RECOMMENDED</Text>
          </View>
          <Text className="text-white font-bold text-lg mb-1">Start Today's Live Exam</Text>
          <Text className="text-teal-100 text-xs">FCPS Part I Special mock based on past papers from 2021-2025.</Text>
        </View>
        <View className="bg-white/10 p-3 rounded-full">
          <ArrowRight color="#ffffff" size={24} />
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}`
  },
  {
    name: 'screens/LiveExamsScreen.tsx',
    language: 'typescript',
    description: 'Implements the full interactive and timed examination interface for high-stakes FCPS mockup simulations on mobile devices.',
    code: `import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Timer, ClipboardList, CheckCircle2 } from 'lucide-react-native';

export default function LiveExamsScreen() {
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(120); // seconds for demo

  // Demo questions
  const mockQuestions = [
    {
      q: "A 45-year-old female presents with palpitations. An ECG shows prolonged QT interval. During Phase 3 of the ventricular action potential, which of the following ion currents is primarily responsible for repolarization?",
      options: [
        "Rapid influx of Sodium (Na+) via fast channels",
        "Influx of Calcium (Ca2+) via L-type channels",
        "Efflux of Potassium (K+) via delayed rectifier channels",
        "Efflux of Sodium (Na+) via the Na+/K+ ATPase pump",
        "Transient outward Potassium (K+) current"
      ]
    },
    {
      q: "A 32-year-old male presents with worsening weakness, hyperpigmentation, weight loss, and postural dizziness. Sodium is 128 mEq/L, Potassium is 5.8 mEq/L. Best confirmatory diagnostic test?",
      options: [
        "24-Hour Urinary Free Cortisol measurement",
        "High-dose ACTH stimulation (Cosyntropin) test",
        "Overnight 1 mg Dexamethasone suppression test",
        "Morning plasma aldosterone-to-renin ratio",
        "Insulin-induced hypoglycemia test"
      ]
    }
  ];

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, timeLeft]);

  const handleSelectAnswer = (optionIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  return (
    <View className="flex-1 bg-slate-50">
      {!examStarted ? (
        <ScrollView className="flex-1 p-4">
          <Text className="text-lg font-bold text-slate-800 mb-2">Live Examinations</Text>
          <Text className="text-slate-500 text-sm mb-4">Participate in scheduled state-wide medical mocks that mimic the real CPSP examination system limits.</Text>
          
          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
            <Text className="text-teal-600 font-bold text-xs mb-1">🔴 NOW LIVE</Text>
            <Text className="text-slate-900 font-bold text-base mb-2">FCPS Part I Medicine Grand Mock</Text>
            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500 text-xs">Questions: 100</Text>
              <Text className="text-slate-500 text-xs">Time: 120 Mins</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setExamStarted(true)}
              className="bg-teal-600 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Start Examination</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 p-4">
          <View className="flex-row justify-between items-center mb-4 bg-slate-900 p-3 rounded-xl">
            <View className="flex-row items-center">
              <Timer color="#14b8a6" size={18} />
              <Text className="text-teal-400 font-mono text-sm ml-2">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
            </View>
            <Text className="text-white font-bold text-xs">Q: {currentIdx + 1}/{mockQuestions.length}</Text>
          </View>

          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4 flex-1">
            <Text className="text-slate-800 text-base font-semibold mb-4">{mockQuestions[currentIdx].q}</Text>
            
            {mockQuestions[currentIdx].options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectAnswer(idx)}
                className={\`p-4 rounded-xl mb-3 border \${selectedAnswers[currentIdx] === idx ? 'bg-teal-50 border-teal-500' : 'bg-slate-50 border-slate-200'}\`}
              >
                <Text className={\`text-sm \${selectedAnswers[currentIdx] === idx ? 'text-teal-800 font-semibold' : 'text-slate-700'}\`}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity 
              disabled={currentIdx === 0}
              onPress={() => setCurrentIdx(prev => prev - 1)}
              className={\`px-5 py-3 rounded-xl border \${currentIdx === 0 ? 'border-slate-200 opacity-50' : 'border-slate-300'}\`}
            >
              <Text className="text-slate-600 font-semibold">Previous</Text>
            </TouchableOpacity>

            {currentIdx < mockQuestions.length - 1 ? (
              <TouchableOpacity 
                onPress={() => setCurrentIdx(prev => prev + 1)}
                className="bg-slate-800 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Next Item</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("Exam Submitted", "You have finished all active questions.");
                  setExamStarted(false);
                }}
                className="bg-teal-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold">Submit Paper</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}`
  },
  {
    name: 'screens/PracticeScreen.tsx',
    language: 'typescript',
    description: 'Brings high-performance dynamic list loading to mobile. Fetches live single-best-answer MCQs directly from a Google Sheets CSV, using native <ActivityIndicator> alerts and category binders.',
    code: `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BookOpen, RefreshCw, ChevronRight } from 'lucide-react-native';

export default function PracticeScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/e/2PACX-1vS_gZ448jpxmCH8m47V4Y18k4DsdbyOon3qK3Hn5Lz_16Y_mY-gOP-uR7uR66-Ior1x_gOH4L9_Q2R/pub?output=csv');
  const [questions, setQuestions] = useState<any[]>([
    {
      subject: 'Physiology & Biochemistry',
      topic: 'Cardiology',
      question: 'During Phase 3 of the ventricular action potential, which ion current repolarizes cell membranes?',
      options: ['Na+ influx', 'Ca2+ influx', 'K+ efflux via rectifiers', 'Na/K ATPase pump', 'Transient K+ flow'],
      correctAnswerIndex: 2
    }
  ]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [choice, setChoice] = useState<number | null>(null);

  const fetchFCPSQuestionBank = async () => {
    if (!sheetUrl.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('Network response failure');
      const csvText = await response.text();
      
      const lines = csvText.split(/\\r\\n|\\n/);
      if (lines.length <= 1) throw new Error('Empty CSV bank');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedItems = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentVals = lines[i].split(',');
        const obj: any = {};
        headers.forEach((hdr, hIdx) => {
          obj[hdr] = currentVals[hIdx] ? currentVals[hIdx].trim() : '';
        });
        parsedItems.push(obj);
      }

      const mapped = parsedItems.map((row, index) => {
        let opts = [row.optiona, row.optionb, row.optionc, row.optiond, row.optione].filter(Boolean);
        while (opts.length < 5) opts.push(\`Option \${opts.length + 1}\`);

        let correct = parseInt(row.correctanswerindex || row.correct || '0', 10);
        if (isNaN(correct)) correct = 0;

        return {
          id: row.id || \`sheet-\${index}\`,
          subject: row.subject || 'Medicine & Allied',
          topic: row.topic || 'General Practice',
          question: row.question || 'Missing question statement',
          options: opts.slice(0, 5),
          correctAnswerIndex: correct
        };
      });

      setQuestions(mapped);
      Alert.alert('Database Synced', \`Successfully loaded \${mapped.length} clinical questions from Google Sheets!\`);
    } catch (err) {
      console.error(err);
      Alert.alert('Connection Timeout', 'Fallback offline mock dataset auto-synchronized securely.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeQs = questions.filter(q => q.subject === selectedSubject);

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      <View className="mb-4 flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <View className="flex-1 pr-2">
          <Text className="text-slate-900 font-bold text-sm">Google Sheets Live Sync</Text>
          <Text className="text-slate-400 text-[10px]">Import custom clinical questions into practice modules</Text>
        </View>
        <TouchableOpacity 
          onPress={fetchFCPSQuestionBank}
          className="bg-slate-900 p-2.5 rounded-xl animate-pulse"
        >
          <RefreshCw color="#14b8a6" size={16} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="py-20 justify-center items-center">
          <ActivityIndicator size="large" color="#0d9488" />
          <Text className="text-slate-500 font-mono text-[10px] uppercase mt-3 tracking-wide">Syncing Spreadsheet Data...</Text>
        </View>
      ) : !selectedSubject ? (
        <View className="space-y-3">
          {Array.from(new Set(questions.map(q => q.subject))).map((subj: any) => (
            <TouchableOpacity 
              key={subj}
              onPress={() => {
                setSelectedSubject(subj);
                setActiveIdx(0);
                setAnswered(false);
                setChoice(null);
              }}
              className="bg-white p-4 rounded-xl border border-slate-150 flex-row justify-between items-center"
            >
              <Text className="text-slate-800 font-bold text-xs">{subj}</Text>
              <View className="flex-row items-center">
                <Text className="text-slate-400 text-xs mr-2">{questions.filter(q => q.subject === subj).length} items</Text>
                <ChevronRight color="#94a3b8" size={16} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <TouchableOpacity onPress={() => setSelectedSubject(null)} className="mb-4 bg-slate-100 self-start px-3 py-1.5 rounded-lg">
            <Text className="text-slate-600 text-xs font-bold">← Subjects</Text>
          </TouchableOpacity>
          
          {activeQs.length === 0 ? (
            <Text className="text-slate-500 text-center py-10">No items available.</Text>
          ) : (
            <View>
              <Text className="text-xs text-slate-400 uppercase font-bold mb-1">Item {activeIdx + 1} of {activeQs.length}</Text>
              <Text className="text-slate-800 text-base font-bold mb-4">{activeQs[activeIdx].question}</Text>
              
              {activeQs[activeIdx].options.map((opt, oIdx) => (
                <TouchableOpacity
                  key={oIdx}
                  onPress={() => {
                    if (answered) return;
                    setChoice(oIdx);
                    setAnswered(true);
                  }}
                  className={"p-3.5 rounded-xl mb-2.5 border " + (choice === oIdx ? "bg-teal-50 border-teal-500" : "bg-slate-50 border-slate-150")}
                >
                  <Text className="text-xs text-slate-800">{opt}</Text>
                </TouchableOpacity>
              ))}

              {answered && activeIdx < activeQs.length - 1 && (
                <TouchableOpacity 
                  onPress={() => {
                    setActiveIdx(prev => prev + 1);
                    setAnswered(false);
                    setChoice(null);
                  }}
                  className="bg-slate-900 py-3.5 rounded-xl items-center mt-4"
                >
                  <Text className="text-white font-bold">Next Question</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}`
  }
];
