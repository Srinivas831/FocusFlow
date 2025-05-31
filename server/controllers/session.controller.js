const { SessionModel } = require("../models/session.model");

// POST /session/start
const startSession = async (req, res) => {
  try {
    const { workDuration, breakDuration, task } = req.body;
    console.log("req.body in startSession", req.body);
    console.log("req.id in startSession", req.userId, req.userName);
    const session = await SessionModel.create({
      userId: req.userId,
      workDuration,
      breakDuration,
      task
    });
    res.status(201).send({ message: 'Session started', session });
  } catch (err) {
    res.status(500).send({ message: 'Error starting session', error: err.message });
  }
};

// POST /session/end
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await SessionModel.findOneAndUpdate(
      { _id: sessionId, userId: req.userId },
      { endTime: Date.now(), status: 'completed' },
      { new: true }
    );
    if (!session) return res.status(404).send({ message: 'Session not found' });
    res.send({ message: 'Session completed', session });
  } catch (err) {
    res.status(500).send({ message: 'Error ending session', error: err.message });
  }
};

// POST /session/abort
const abortSession = async (req, res) => {
  try {
    const { sessionId, abortReason } = req.body;
    const session = await SessionModel.findOneAndUpdate(
      { _id: sessionId, userId: req.userId },
      { endTime: Date.now(), status: 'aborted', abortReason },
      { new: true }
    );
    if (!session) return res.status(404).send({ message: 'Session not found' });
    res.send({ message: 'Session aborted', session });
  } catch (err) {
    res.status(500).send({ message: 'Error aborting session', error: err.message });
  }
};

// PATCH /session/interrupt/:id
const addInterruption = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await SessionModel.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $inc: { interruptions: 1 } },
      { new: true }
    );
    if (!session) return res.status(404).send({ message: 'Session not found' });
    res.send({ message: 'Interruption recorded', session });
  } catch (err) {
    res.status(500).send({ message: 'Error recording interruption', error: err.message });
  }
};

// /get
const getActiveSession = async (req, res) => {
  try {
    const session = await SessionModel.findOne({
      userId: req.userId,
      status: 'running'
    });

    if (!session) return res.status(200).send({ session: null });

    res.status(200).send({ session });
  } catch (err) {
    res.status(500).send({ message: 'Error fetching active session', error: err.message });
  }
};


const moment = require('moment');

// const getAnalytics = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const sessions = await SessionModel.find({ userId });

//     let dailyMap = {}, weeklyMap = {};
//     let totalCompleted = 0, totalInterrupted = 0, totalAborted = 0;
//     let trendLabels = [], trendDurations = [];

//     for (let s of sessions) {
//       const day = moment(s.startTime).format('YYYY-MM-DD');
//       const week = moment(s.startTime).format('YYYY-[W]WW');

//       // Count sessions
//       dailyMap[day] = (dailyMap[day] || 0) + 1;
//       weeklyMap[week] = (weeklyMap[week] || 0) + 1;

//       // Status stats
//       if (s.status === 'ended') totalCompleted++;
//       if (s.status === 'aborted') totalAborted++;
//       if (s.interruptions > 0) totalInterrupted++;

//       // Average durations & trends
//       if (s.status === 'ended' && s.endTime && s.startTime) {
//         const minutes = moment(s.endTime).diff(moment(s.startTime), 'minutes');
//         trendLabels.push(day);
//         trendDurations.push(minutes);
//       }
//     }

//     // Convert to arrays
//     const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
//     const weekly = Object.entries(weeklyMap).map(([week, count]) => ({ week, count }));

//     // Average focus time per day
//     let avgMap = {};
//     for (let i = 0; i < trendLabels.length; i++) {
//       const date = trendLabels[i];
//       const duration = trendDurations[i];
//       if (!avgMap[date]) avgMap[date] = [];
//       avgMap[date].push(duration);
//     }
//     const avgFocusTime = Object.entries(avgMap).map(([date, mins]) => ({
//       date,
//       avgMinutes: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)
//     }));

//     res.send({
//       totalPomodoros: { daily, weekly },
//       averageFocusTime: { daily: avgFocusTime },
//       sessionStatusStats: {
//         completed: totalCompleted,
//         interrupted: totalInterrupted,
//         aborted: totalAborted
//       },
//       trendData: {
//         labels: trendLabels,
//         durations: trendDurations
//       }
//     });
//   } catch (err) {
//     res.status(500).send({ message: 'Failed to calculate analytics', error: err.message });
//   }
// };




const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await SessionModel.find({ userId });

    // Time period calculations
    const today = moment().startOf('day');
    const startOfWeek = moment().startOf('week');
    const startOfMonth = moment().startOf('month');
    
    // Initialize data structures
    let dailyData = {}, weeklyData = {}, monthlyData = {};
    let hourlyDistribution = Array(24).fill(0);
    let statusStats = { completed: 0, interrupted: 0, aborted: 0 };
    
    // Process each session
    for (let s of sessions) {
      const startMoment = moment(s.startTime);
      const day = startMoment.format('YYYY-MM-DD');
      const week = startMoment.format('YYYY-[W]WW');
      const month = startMoment.format('YYYY-MM');
      const hour = startMoment.hour();
      
      // Initialize day data if not exists
      if (!dailyData[day]) {
        dailyData[day] = {
          count: 0,
          totalMinutes: 0,
          completedCount: 0,
          interruptedCount: 0,
          abortedCount: 0
        };
      }
      
      // Count sessions
      dailyData[day].count++;
      weeklyData[week] = (weeklyData[week] || 0) + 1;
      monthlyData[month] = (monthlyData[month] || 0) + 1;
      
      // Track hourly distribution
      hourlyDistribution[hour]++;
      
      // Status stats
      if (s.status === 'completed') {
        statusStats.completed++;
        dailyData[day].completedCount++;
      }
      if (s.status === 'aborted') {
        statusStats.aborted++;
        dailyData[day].abortedCount++;
      }
      if (s.interruptions > 0) {
        statusStats.interrupted++;
        dailyData[day].interruptedCount++;
      }
      
      // Calculate session duration
      if (s.endTime && s.startTime) {
        const minutes = moment(s.endTime).diff(moment(s.startTime), 'minutes');
        dailyData[day].totalMinutes += minutes;
      }
    }
    
    // Calculate streaks based on unique days (FIXED LOGIC)
    const uniqueDays = Object.keys(dailyData).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (uniqueDays.length > 0) {
      // Check if today or yesterday has sessions (for current streak)
      const todayStr = moment().format('YYYY-MM-DD');
      const yesterdayStr = moment().subtract(1, 'day').format('YYYY-MM-DD');
      
      // Start from the most recent day and work backwards
      let streakActive = false;
      
      // Check if streak is still active (today or yesterday has sessions)
      if (uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr)) {
        streakActive = true;
      }
      
      // Calculate current streak (working backwards from most recent day)
      if (streakActive) {
        for (let i = uniqueDays.length - 1; i >= 0; i--) {
          const currentDay = moment(uniqueDays[i]);
          
          if (i === uniqueDays.length - 1) {
            // First day (most recent)
            currentStreak = 1;
            tempStreak = 1;
          } else {
            const previousDay = moment(uniqueDays[i + 1]);
            const daysDiff = previousDay.diff(currentDay, 'days');
            
            if (daysDiff === 1) {
              // Consecutive day
              currentStreak++;
              tempStreak++;
            } else {
              // Gap found, stop current streak calculation
              break;
            }
          }
        }
      }
      
      // Calculate longest streak (check all possible streaks)
      tempStreak = 1;
      longestStreak = 1;
      
      for (let i = 1; i < uniqueDays.length; i++) {
        const currentDay = moment(uniqueDays[i]);
        const previousDay = moment(uniqueDays[i - 1]);
        const daysDiff = currentDay.diff(previousDay, 'days');
        
        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          // Gap found, reset temp streak
          tempStreak = 1;
        }
      }
    }
    
    // Format data for response
    const daily = Object.entries(dailyData).map(([date, data]) => ({
      date,
      count: data.count,
      avgMinutes: data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0,
      completed: data.completedCount,
      interrupted: data.interruptedCount,
      aborted: data.abortedCount
    })).sort((a, b) => moment(a.date).diff(moment(b.date)));
    
    const weekly = Object.entries(weeklyData).map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
    
    const monthly = Object.entries(monthlyData).map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    // Calculate most productive time
    const mostProductiveHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    
    res.send({
      totalPomodoros: { 
        daily, 
        weekly,
        monthly,
        total: sessions.length
      },
      averageFocusTime: {
        daily: daily.map(d => ({ date: d.date, avgMinutes: d.avgMinutes })),
        overall: daily.length > 0 
          ? Math.round(daily.reduce((sum, d) => sum + d.avgMinutes, 0) / daily.length) 
          : 0
      },
      sessionStatusStats: statusStats,
      productivityPatterns: {
        hourlyDistribution,
        mostProductiveHour,
        currentStreak,
        longestStreak
      },
      trendData: daily.map(d => ({
        date: d.date,
        count: d.count,
        avgMinutes: d.avgMinutes,
        completed: d.completed,
        interrupted: d.interrupted,
        aborted: d.aborted
      }))
    });
  } catch (err) {
    res.status(500).send({ message: 'Failed to calculate analytics', error: err.message });
  }
};


module.exports = {
  startSession,
  endSession,
  abortSession,
  addInterruption,
  getActiveSession, getAnalytics
};
