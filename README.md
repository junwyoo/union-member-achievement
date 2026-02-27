To run:

npm run dev

# Database examples

achievements / attend_5
{
  title: "회의 5회 참석",
  description: "회의 5번 참석 시 달성",
  condition: "attendance >= 5",
  rewardPoint: 100
}

users / uid / userAchievements / attend_5
{
  achievedAt: Timestamp,
  rewardGiven: true
}

