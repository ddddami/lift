export type Exercise = {
  name: string;
  sets: string;
  reps: string;
  note: string;
};

export type DayPlan = {
  id: string;
  label: string;
  tag: string;
  when: string;
  accentColor: string;
  keyFocus: string;
  exercises: Exercise[];
};

export type Plan = {
  label: string;
  subtitle: string;
  tagline: string;
  science: string;
  days: DayPlan[];
};

export const plans: Record<string, Plan> = {
  "3": {
    label: "3-DAY",
    subtitle: "Busy week version",
    tagline: "Full body 3×/week · Every muscle hit 3 times · Maximum efficiency",
    science: "A 2024 meta-analysis confirmed training each muscle 2–3×/week produces ~3% more growth than once/week. Full body 3-day hits that ceiling with less time.",
    days: [
      {
        id: "A",
        label: "DAY A",
        tag: "FULL BODY — PUSH FOCUS",
        when: "Monday",
        accentColor: "#E8FF3D",
        keyFocus: "Chest & quads lead. Back + shoulders + hamstrings follow.",
        exercises: [
          { name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Heaviest pressing movement. Chest + front delt mass builder. Add 2.5kg when you hit 8 reps all sets." },
          { name: "Squat", sets: "3", reps: "6–8", note: "Full depth. This is non-negotiable — legs = testosterone = everything grows faster." },
          { name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Wide grip, pull to upper chest. Lats = your wings. This is what creates the V." },
          { name: "Overhead Press", sets: "3", reps: "8–10", note: "Barbell or dumbbell. Shoulder mass builder." },
          { name: "Romanian Deadlift", sets: "3", reps: "10–12", note: "Slow down, feel hamstrings stretch. Don't rush this." },
          { name: "Lateral Raises", sets: "3", reps: "12–15", note: "Controlled. This is what makes shoulders WIDE. Never skip." },
          { name: "Calf Raises", sets: "3", reps: "15–20", note: "Slow up, hold at top, slow down." },
          { name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      },
      {
        id: "B",
        label: "DAY B",
        tag: "FULL BODY — PULL FOCUS",
        when: "Wednesday",
        accentColor: "#FF6B35",
        keyFocus: "Back & hamstrings lead. Chest + shoulders + quads follow.",
        exercises: [
          { name: "Deadlift", sets: "3", reps: "4–6", note: "Heaviest lift of the week. Back, glutes, hamstrings, core. Everything. Don't skip." },
          { name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Upper chest is what fills out your shirts. Incline > flat for aesthetics." },
          { name: "Barbell Row / Dumbbell Row", sets: "4", reps: "8–10", note: "Elbows drive back. Upper back thickness. Crucial for V-taper density." },
          { name: "Bulgarian Split Squat", sets: "3", reps: "8–10", note: "Each leg. Quad + glute developer. Fixes imbalances. Harder than it looks." },
          { name: "Face Pulls", sets: "3", reps: "15", note: "Rear delts = 3D shoulder look. Most guys skip this and wonder why shoulders look flat." },
          { name: "Barbell Curl", sets: "3", reps: "10–12", note: "Full range. No swinging." },
          { name: "Tricep Pushdown", sets: "3", reps: "10–12", note: "Triceps = 2/3 of your arm. More important than biceps for arm size." },
          { name: "Cable Crunches", sets: "3", reps: "12–15", note: "Constant tension on the abs. Don't pull with arms." },
        ],
      },
      {
        id: "C",
        label: "DAY C",
        tag: "FULL BODY — LEGS FOCUS",
        when: "Friday",
        accentColor: "#7B5CF0",
        keyFocus: "Legs lead properly this day. Upper body still hits at solid volume.",
        exercises: [
          { name: "Leg Press", sets: "4", reps: "10–12", note: "Go heavy. Quad mass. Legs balance your upper body — skip them and you'll look like Johnny Bravo." },
          { name: "Walking Lunges", sets: "3", reps: "10 each leg", note: "Quad + glute + balance. Better than stationary lunges." },
          { name: "Leg Curl", sets: "3", reps: "10–12", note: "Hamstrings. Full range — most people only go halfway." },
          { name: "Pull-ups / Lat Pulldown", sets: "3", reps: "8–10", note: "Third time hitting lats this week. This is what builds the V." },
          { name: "Dumbbell Shoulder Press", sets: "3", reps: "10–12", note: "Seated. Strict form. Shoulder volume hit 3." },
          { name: "Lateral Raises", sets: "3", reps: "12–15", note: "Third hit this week. Shoulder width compounds over time." },
          { name: "Hammer Curls", sets: "2", reps: "12", note: "Brachialis = arm thickness that shows from all angles." },
          { name: "Ab Wheel", sets: "3", reps: "10", note: "Or plank if wheel unavailable. Core bracing. Keeps waist tight." },
        ],
      },
    ],
  },
  "4": {
    label: "4-DAY",
    subtitle: "Good week version",
    tagline: "Upper/Lower split · Each muscle 2×/week · More volume, more growth",
    science: "The 4-day Upper/Lower split scores 8.4/10 on hypertrophy research — 85% of the gains of a 5-day split with 30% less gym time. Best balance of volume and recovery.",
    days: [
      {
        id: "UA",
        label: "UPPER A",
        tag: "UPPER — PUSH FOCUS",
        when: "Monday",
        accentColor: "#E8FF3D",
        keyFocus: "Chest and shoulders lead. Back gets quality volume too.",
        exercises: [
          { name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Anchor movement. Go heavy, add 2.5kg when all reps clean." },
          { name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Upper chest. Most important chest zone for aesthetics." },
          { name: "Overhead Press", sets: "3", reps: "8–10", note: "Shoulder mass. Compound. Do this before isolation." },
          { name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Can't skip back even on push days — balance matters." },
          { name: "Lateral Raises", sets: "4", reps: "12–15", note: "4 sets this day. Shoulder width is the #1 aesthetic muscle." },
          { name: "Tricep Pushdown", sets: "3", reps: "10–12", note: "Superset with lateral raises if you want to save time." },
          { name: "Cable / Barbell Curl", sets: "3", reps: "10–12", note: "Arms get hit every upper day — consistent volume = arm growth." },
          { name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      },
      {
        id: "LA",
        label: "LOWER A",
        tag: "LOWER — QUAD FOCUS",
        when: "Tuesday",
        accentColor: "#FF6B35",
        keyFocus: "Quads and glutes lead. Hamstrings and calves follow.",
        exercises: [
          { name: "Squat", sets: "4", reps: "6–8", note: "King of lower body. Full depth. Don't skip this." },
          { name: "Romanian Deadlift", sets: "3", reps: "10", note: "Slow descent, feel hamstring stretch at bottom." },
          { name: "Bulgarian Split Squat", sets: "3", reps: "8–10", note: "Each leg. Fixes imbalances. Hard but essential." },
          { name: "Leg Press", sets: "3", reps: "12", note: "Quad finisher. Go heavy here since squats are done." },
          { name: "Walking Lunges", sets: "2", reps: "10 each", note: "Glute + quad burn at end of session." },
          { name: "Calf Raises", sets: "4", reps: "15–20", note: "Slow and deliberate. Calves respond to time under tension." },
          { name: "Hanging Knee Raises / Plank", sets: "3", reps: "15 / 40s", note: "Core work at end when already fatigued." },
        ],
      },
      {
        id: "UB",
        label: "UPPER B",
        tag: "UPPER — PULL FOCUS",
        when: "Thursday",
        accentColor: "#00C9A7",
        keyFocus: "Back and rear delts lead. Chest and shoulders get volume hit 2.",
        exercises: [
          { name: "Weighted Pull-ups / Lat Pulldown", sets: "4", reps: "6–10", note: "Back width. The actual V in V-taper. Wide grip, pull to upper chest." },
          { name: "Barbell Row", sets: "3", reps: "8–10", note: "Horizontal pull. Back thickness. Elbows drive back, not up." },
          { name: "Seated Cable Row", sets: "3", reps: "10–12", note: "Mid back density. Full stretch at front, full squeeze at back." },
          { name: "Face Pulls", sets: "3", reps: "15", note: "Rear delts + rotator cuff. Essential for healthy, round-looking shoulders." },
          { name: "Incline DB Press", sets: "3", reps: "8–10", note: "Second hit on upper chest this week." },
          { name: "Lateral Raises", sets: "3", reps: "15", note: "Second hit on side delts. Consistent volume = width over time." },
          { name: "Hammer Curls", sets: "3", reps: "12", note: "Brachialis thickness. Different stimulus from barbell curls." },
          { name: "Overhead Tricep Extension", sets: "3", reps: "12", note: "Long head of tricep — gives arm that full, thick look." },
          { name: "Cable Crunches", sets: "3", reps: "12–15", note: "Constant tension on the abs. Don't pull with arms." },
        ],
      },
      {
        id: "LB",
        label: "LOWER B",
        tag: "LOWER — POSTERIOR FOCUS",
        when: "Friday",
        accentColor: "#FF6B35",
        keyFocus: "Hamstrings and glutes lead. Deadlift anchors this session.",
        exercises: [
          { name: "Deadlift", sets: "3", reps: "4–6", note: "Heaviest lift of the week. Full posterior chain. Add 5kg when all reps clean." },
          { name: "Leg Curl", sets: "4", reps: "10–12", note: "Hamstring isolation after deadlifts. Full range — most people half-rep this." },
          { name: "Leg Extension", sets: "3", reps: "12", note: "Quad isolation. Completes the quad/hamstring balance." },
          { name: "Leg Press", sets: "3", reps: "10–12", note: "Quad volume. Go heavier than you think you can." },
          { name: "Glute Bridge / Hip Thrust", sets: "3", reps: "12", note: "Glute builder. Makes your lower body look proportional and powerful." },
          { name: "Seated Calf Raises", sets: "4", reps: "15", note: "Soleus-focused. Different calf muscle than standing raises." },
          { name: "Ab Wheel / Leg Raises", sets: "3", reps: "12–15", note: "Core strength. Keeps waist tight — enhances V-taper visually." },
        ],
      },
    ],
  },
};

export const switchLogic = [
  { trigger: "Exam week, busy at work", action: "→ 3-day", color: "#FF6B35" },
  { trigger: "Normal week, free evenings", action: "→ 4-day", color: "#00C9A7" },
  { trigger: "Travelling or sick", action: "→ 3-day or rest", color: "#888888" },
  { trigger: "Feeling strong and energised", action: "→ 4-day", color: "#00C9A7" },
];

export const overloadRules = [
  { rule: "Upper body", add: "+2.5kg when you hit top of rep range" },
  { rule: "Lower body", add: "+5kg when you hit top of rep range" },
  { rule: "Isolation", add: "+1–2 reps first, then +weight" },
  { rule: "Stalled 3 sessions?", add: "Check sleep and calories first" },
];
