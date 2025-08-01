import React from 'react';

interface WritingStreakProps {
  entryDates: string[];
}

const WritingStreak: React.FC<WritingStreakProps> = ({ entryDates }) => {
  // Calculate streaks
  const calculateStreaks = (dates: string[]) => {
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return { current: 0, longest: 0 };
    }

    const uniqueDates = [...new Set(dates)].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate longest streak
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    const lastEntryDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const lastEntryStr = uniqueDates[uniqueDates.length - 1];

    if (lastEntryStr === todayStr || lastEntryStr === yesterdayStr) {
      currentStreak = 1;

      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currDate = new Date(uniqueDates[i + 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  // Generate calendar heatmap data
  const generateCalendarData = () => {
    if (!entryDates || !Array.isArray(entryDates)) {
      return [];
    }

    const uniqueDates = [...new Set(entryDates)];
    const dateSet = new Set(uniqueDates);

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 90); // Last 90 days

    const calendarData = [];

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      calendarData.push({
        date: dateStr,
        hasEntry: dateSet.has(dateStr),
        dayOfWeek: d.getDay(),
        weekOfYear: Math.floor((d.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      });
    }

    return calendarData;
  };

  const streaks = calculateStreaks(entryDates || []);
  const calendarData = generateCalendarData();
  const totalEntries = entryDates && Array.isArray(entryDates) ? new Set(entryDates).size : 0;

  // Calculate writing frequency
  const getWritingFrequency = () => {
    if (!entryDates || !Array.isArray(entryDates) || entryDates.length === 0) {
      return 0;
    }

    const uniqueDates = [...new Set(entryDates)];
    const daysSinceFirst = Math.max(1, Math.ceil(
      (new Date().getTime() - new Date(uniqueDates[0]).getTime()) / (1000 * 60 * 60 * 24)
    ));
    return Math.round((uniqueDates.length / daysSinceFirst) * 100);
  };

  const frequency = getWritingFrequency();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Writing Activity</h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {streaks.current}
          </div>
          <div className="text-sm text-blue-700">Current Streak</div>
          <div className="text-xs text-blue-500 mt-1">
            {streaks.current === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {streaks.longest}
          </div>
          <div className="text-sm text-green-700">Longest Streak</div>
          <div className="text-xs text-green-500 mt-1">
            {streaks.longest === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {totalEntries}
          </div>
          <div className="text-sm text-purple-700">Total Entries</div>
          <div className="text-xs text-purple-500 mt-1">
            {totalEntries === 1 ? 'entry' : 'entries'}
          </div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {frequency}%
          </div>
          <div className="text-sm text-orange-700">Frequency</div>
          <div className="text-xs text-orange-500 mt-1">
            daily writing rate
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div>
        <h4 className="text-lg font-medium text-gray-700 mb-3">
          Last 90 Days Activity
        </h4>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Day labels */}
            <div className="flex mb-1">
              <div className="w-8"></div>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="w-3 h-3 text-xs text-gray-400 flex items-center justify-center mx-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex">
              {/* Month labels */}
              <div className="flex flex-col justify-start mr-2">
                {Array.from({ length: Math.ceil(calendarData.length / 7) }, (_, weekIndex) => {
                  const weekStart = calendarData[weekIndex * 7];
                  if (!weekStart) return null;

                  const date = new Date(weekStart.date);
                  const isFirstOfMonth = date.getDate() <= 7;

                  return (
                    <div key={weekIndex} className="w-6 h-3 text-xs text-gray-400 flex items-center">
                      {isFirstOfMonth ? date.toLocaleDateString('en-US', { month: 'short' }) : ''}
                    </div>
                  );
                })}
              </div>

              {/* Heatmap squares */}
              <div className="grid grid-rows-7 grid-flow-col gap-0.5">
                {calendarData.map((day, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-sm ${
                      day.hasEntry
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors cursor-pointer`}
                    title={`${day.date}${day.hasEntry ? ' - Entry written' : ' - No entry'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="text-center">
          {streaks.current === 0 ? (
            <p className="text-blue-700">
              💪 Ready to start a new writing streak? Your next entry counts!
            </p>
          ) : streaks.current < 3 ? (
            <p className="text-blue-700">
              🌱 Great start! Keep building your writing habit - you're on day {streaks.current}!
            </p>
          ) : streaks.current < 7 ? (
            <p className="text-blue-700">
              🔥 You're on fire! {streaks.current} days strong - the habit is forming!
            </p>
          ) : (
            <p className="text-blue-700">
              🏆 Amazing! {streaks.current} days of consistent journaling - you're a writing champion!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingStreak;
