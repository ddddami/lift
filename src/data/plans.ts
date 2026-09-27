export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps?: string;
  note: string;
};

export type TrainingSession = {
  id: string;
  label: string;
  tag: string;
  keyFocus: string;
  exercises: Exercise[];
};

export const rotation: TrainingSession[] = [
{
        id: "UA",
        label: "UPPER A",
        tag: "UPPER — PUSH FOCUS",
        keyFocus: "Chest and shoulders lead. Back gets quality volume too.",
        exercises: [
          { id: "barbell-bench-press", name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Anchor movement. Go heavy, add 2.5kg when all reps clean." },
          { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Upper chest. Most important chest zone for aesthetics." },
          { id: "overhead-press", name: "Overhead Press", sets: "3", reps: "8–10", note: "Shoulder mass. Compound. Do this before isolation." },
          { id: "lat-pulldown-pull-ups", name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Can't skip back even on push days — balance matters." },
          { id: "lateral-raises", name: "Lateral Raises", sets: "4", reps: "12–15", note: "4 sets this day. Shoulder width is the #1 aesthetic muscle." },
          { id: "reverse-pec-deck-flye-band-pull-apart", name: "Reverse Pec-Deck Flye / Band Pull-Apart", sets: "3", reps: "15–20", note: "Second rear-delt hit of the cycle, alongside Face Pulls in Upper B — keeps the 3D shoulder look symmetrical instead of relying on one session." },
          { id: "tricep-pushdown", name: "Tricep Pushdown", sets: "3", reps: "10–12", note: "Superset with lateral raises if you want to save time." },
          { id: "cable-barbell-curl", name: "Cable / Barbell Curl", sets: "3", reps: "10–12", note: "Arms get hit every upper day — consistent volume = arm growth." },
          { id: "standing-calf-raise", name: "Standing Calf Raise", sets: "3", reps: "15–20", note: "Use a controlled full range of motion." },
          { id: "hanging-knee-raises", name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      },
{
        id: "LA",
        label: "LOWER A",
        tag: "LOWER — QUAD FOCUS",
        keyFocus: "Quads and glutes lead. Hamstrings and calves follow.",
        exercises: [
          { id: "squat", name: "Squat", sets: "4", reps: "6–8", note: "King of lower body. Full depth. Don't skip this." },
          { id: "romanian-deadlift", name: "Romanian Deadlift", sets: "3", reps: "10", note: "Slow descent, feel hamstring stretch at bottom." },
          { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", sets: "3", reps: "8–10 each", note: "Each leg. Fixes imbalances. Hard but essential." },
          { id: "leg-press", name: "Leg Press", sets: "3", reps: "12", note: "Quad finisher. Go heavy here since squats are done." },
          { id: "leg-extension", name: "Leg Extension", sets: "3", reps: "12–15", note: "Use a controlled range with a deep stretch." },
          { id: "walking-lunges", name: "Walking Lunges", sets: "2", reps: "10 each", note: "Glute + quad burn at end of session." },
          { id: "calf-raises", name: "Calf Raises", sets: "4", reps: "15–20", note: "Slow and deliberate. Calves respond to time under tension." },
          { id: "pallof-press-suitcase-carry", name: "Pallof Press / Suitcase Carry", sets: "3", note: "Choose either movement. Keep your torso steady." },
          { id: "hanging-knee-raises-plank", name: "Hanging Knee Raises / Plank", sets: "3", reps: "15 / 40s", note: "Core work at end when already fatigued." },
        ],
      },
{
        id: "UB",
        label: "UPPER B",
        tag: "UPPER — PULL FOCUS",
        keyFocus: "Back and rear delts lead. Chest and shoulders get volume hit 2.",
        exercises: [
          { id: "weighted-pull-ups-lat-pulldown", name: "Weighted Pull-ups / Lat Pulldown", sets: "4", reps: "6–10", note: "Back width. The actual V in V-taper. Wide grip, pull to upper chest." },
          { id: "barbell-row", name: "Barbell Row", sets: "3", reps: "8–10", note: "Horizontal pull. Back thickness. Elbows drive back, not up." },
          { id: "seated-cable-row", name: "Seated Cable Row", sets: "3", reps: "10–12", note: "Mid back density. Full stretch at front, full squeeze at back." },
          { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Second hit on upper chest this cycle." },
          { id: "shrugs", name: "Shrugs", sets: "2", reps: "12–15", note: "Controlled shoulder elevation. Keep the volume light." },
          { id: "face-pulls", name: "Face Pulls", sets: "3", reps: "15", note: "Rear delts + rotator cuff. Essential for healthy, round-looking shoulders." },
          { id: "lateral-raises", name: "Lateral Raises", sets: "3", reps: "15", note: "Second hit on side delts. Consistent volume = width over time." },
          { id: "hammer-curls", name: "Hammer Curls", sets: "3", reps: "12", note: "Brachialis thickness. Different stimulus from barbell curls." },
          { id: "overhead-tricep-extension", name: "Overhead Tricep Extension", sets: "3", reps: "12", note: "Long head of tricep — gives arm that full, thick look." },
          { id: "seated-calf-raise", name: "Seated Calf Raise", sets: "3", reps: "15", note: "Pause briefly at the top and lower under control." },
          { id: "cable-crunches", name: "Cable Crunches", sets: "3", reps: "12–15", note: "Constant tension on the abs. Don't pull with arms." },
        ],
      },
{
        id: "LB",
        label: "LOWER B",
        tag: "LOWER — POSTERIOR FOCUS",
        keyFocus: "Hamstrings and glutes lead. Deadlift anchors this session.",
        exercises: [
          { id: "deadlift", name: "Deadlift", sets: "3", reps: "4–6", note: "Heaviest lift of the week. Full posterior chain. Add 5kg when all reps clean." },
          { id: "seated-leg-curl", name: "Seated Leg Curl", sets: "4", reps: "10–12", note: "Hamstring isolation after deadlifts. Full range — most people half-rep this." },
          { id: "leg-extension", name: "Leg Extension", sets: "3", reps: "12", note: "Quad isolation. Completes the quad/hamstring balance." },
          { id: "glute-bridge-hip-thrust", name: "Glute Bridge / Hip Thrust", sets: "3", reps: "12", note: "Glute builder. Makes your lower body look proportional and powerful." },
          { id: "seated-calf-raises", name: "Seated Calf Raises", sets: "4", reps: "15", note: "Soleus-focused. Different calf muscle than standing raises." },
          { id: "ab-wheel-leg-raises", name: "Ab Wheel / Leg Raises", sets: "3", reps: "12–15", note: "Core strength. Keeps waist tight — enhances V-taper visually." },
        ],
      }
];

export const fallbackA: TrainingSession = {
        id: "FA",
        label: "FALLBACK A",
        tag: "FULL BODY — PUSH FOCUS",
        keyFocus: "Chest & quads lead. Back + shoulders + hamstrings follow.",
        exercises: [
          { id: "squat", name: "Squat", sets: "3", reps: "6–8", note: "Full depth. Biggest lift of the session — drives overall strength and training stimulus. Coming off a break: start lighter than last time and do the ramp-up first." },
          { id: "barbell-bench-press", name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Heaviest pressing movement. Chest + front delt mass builder. Add 2.5kg when you hit 8 reps all sets." },
          { id: "lat-pulldown-pull-ups", name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Wide grip, pull to upper chest. Lats = your wings. This is what creates the V." },
          { id: "overhead-press", name: "Overhead Press", sets: "3", reps: "8–10", note: "Barbell or dumbbell. Shoulder mass builder." },
          { id: "romanian-deadlift", name: "Romanian Deadlift", sets: "3", reps: "10–12", note: "Slow down, feel hamstrings stretch. Don't rush this." },
          { id: "lateral-raises", name: "Lateral Raises", sets: "3", reps: "12–15", note: "Controlled. This is what makes shoulders WIDE. Never skip." },
          { id: "calf-raises", name: "Calf Raises", sets: "3", reps: "15–20", note: "Slow up, hold at top, slow down." },
          { id: "hanging-knee-raises", name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      };

export const fallbackB: TrainingSession = {
        id: "FB",
        label: "FALLBACK B",
        tag: "FULL BODY — PULL FOCUS",
        keyFocus: "Back & hamstrings lead. Chest + shoulders + quads follow.",
        exercises: [
          { id: "deadlift", name: "Deadlift", sets: "3", reps: "4–6", note: "Heaviest lift of the week. Back, glutes, hamstrings, core. Everything. Coming off a break: start lighter than last time and do the ramp-up first." },
          { id: "incline-dumbbell-press", name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Upper chest is what fills out your shirts. Incline > flat for aesthetics." },
          { id: "barbell-row-dumbbell-row", name: "Barbell Row / Dumbbell Row", sets: "4", reps: "8–10", note: "Elbows drive back. Upper back thickness. Crucial for V-taper density." },
          { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", sets: "3", reps: "8–10", note: "Each leg. Quad + glute developer. Fixes imbalances. Harder than it looks." },
          { id: "face-pulls", name: "Face Pulls", sets: "3", reps: "15", note: "Rear delts = 3D shoulder look. Most guys skip this and wonder why shoulders look flat." },
          { id: "barbell-curl", name: "Barbell Curl", sets: "3", reps: "10–12", note: "Full range. No swinging." },
          { id: "tricep-pushdown", name: "Tricep Pushdown", sets: "3", reps: "10–12", note: "Triceps = 2/3 of your arm. More important than biceps for arm size." },
          { id: "standing-calf-raise", name: "Standing Calf Raise", sets: "3", reps: "15–20", note: "Use a controlled full range of motion." },
          { id: "cable-crunches", name: "Cable Crunches", sets: "3", reps: "12–15", note: "Constant tension on the abs. Don't pull with arms." },
        ],
      };

export const overloadRules = [
  { rule: "Upper body", add: "+2.5kg when you hit top of rep range" },
  { rule: "Lower body", add: "+5kg when you hit top of rep range" },
  { rule: "Isolation", add: "+1–2 reps first, then +weight" },
  { rule: "Abs & calves", add: "Reach the top on all sets, add 2–3 reps, then add weight and return to the bottom of the range" },
  { rule: "Stalled 3 sessions?", add: "Check sleep and calories first" },
];

export const rotationDescription = 'Upper and lower sessions alternate. Keep following the queue as your schedule allows.';

export const trainingGuidelines = [
  {
    title: 'Warm-up',
    text: 'Before the session’s lead heavy lift, do 3 light ramp-up sets. For 60kg working sets: empty bar × 8–10 easy reps, ~30kg × 5, ~45kg × 2–3. Warm-up sets don’t count toward working sets.',
  },
  {
    title: 'Lighter week',
    text: 'Every 5–6 weeks, take a lighter week on purpose: reduce working sets by roughly 40%, then resume full training the following week.',
  },
];
