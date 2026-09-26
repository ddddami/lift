export type Exercise = {
  name: string;
  sets: string;
  reps: string;
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
          { name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Anchor movement. Go heavy, add 2.5kg when all reps clean." },
          { name: "Incline Dumbbell Press", sets: "3", reps: "8–10", note: "Upper chest. Most important chest zone for aesthetics." },
          { name: "Overhead Press", sets: "3", reps: "8–10", note: "Shoulder mass. Compound. Do this before isolation." },
          { name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Can't skip back even on push days — balance matters." },
          { name: "Lateral Raises", sets: "4", reps: "12–15", note: "4 sets this day. Shoulder width is the #1 aesthetic muscle." },
          { name: "Reverse Pec-Deck Flye / Band Pull-Apart", sets: "3", reps: "15–20", note: "Second rear-delt hit of the cycle, alongside Face Pulls in Upper B — keeps the 3D shoulder look symmetrical instead of relying on one session." },
          { name: "Tricep Pushdown", sets: "3", reps: "10–12", note: "Superset with lateral raises if you want to save time." },
          { name: "Cable / Barbell Curl", sets: "3", reps: "10–12", note: "Arms get hit every upper day — consistent volume = arm growth." },
          { name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      },
{
        id: "LA",
        label: "LOWER A",
        tag: "LOWER — QUAD FOCUS",
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
      }
];

export const fallbackA: TrainingSession = {
        id: "FA",
        label: "CATCH-UP A",
        tag: "FULL BODY — PUSH FOCUS",
        keyFocus: "Chest & quads lead. Back + shoulders + hamstrings follow.",
        exercises: [
          { name: "Barbell Bench Press", sets: "4", reps: "6–8", note: "Heaviest pressing movement. Chest + front delt mass builder. Add 2.5kg when you hit 8 reps all sets." },
          { name: "Squat", sets: "3", reps: "6–8", note: "Biggest lift of the session — drives overall strength and training stimulus." },
          { name: "Lat Pulldown / Pull-ups", sets: "3", reps: "8–10", note: "Wide grip, pull to upper chest. Lats = your wings. This is what creates the V." },
          { name: "Overhead Press", sets: "3", reps: "8–10", note: "Barbell or dumbbell. Shoulder mass builder." },
          { name: "Romanian Deadlift", sets: "3", reps: "10–12", note: "Slow down, feel hamstrings stretch. Don't rush this." },
          { name: "Lateral Raises", sets: "3", reps: "12–15", note: "Controlled. This is what makes shoulders WIDE. Never skip." },
          { name: "Calf Raises", sets: "3", reps: "15–20", note: "Slow up, hold at top, slow down." },
          { name: "Hanging Knee Raises", sets: "3", reps: "15", note: "Core stability and lower abs." },
        ],
      };

export const fallbackB: TrainingSession = {
        id: "FB",
        label: "CATCH-UP B",
        tag: "FULL BODY — PULL FOCUS",
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
      };

export const overloadRules = [
  { rule: "Upper body", add: "+2.5kg when you hit top of rep range" },
  { rule: "Lower body", add: "+5kg when you hit top of rep range" },
  { rule: "Isolation", add: "+1–2 reps first, then +weight" },
  { rule: "Abs", add: "Add reps first, then weight or a harder variation" },
  { rule: "Stalled 3 sessions?", add: "Check sleep and calories first" },
];
