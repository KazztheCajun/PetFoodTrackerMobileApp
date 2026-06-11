import { useAuth } from '@clerk/expo'
import { Feather } from '@expo/vector-icons'
import React, { useContext, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFeedingHistory } from '@/features/feeding/api/useFeedingHistory'
import { usePets } from '@/features/pets/api/usePets'
import { useThemeColor } from '@/hooks/useThemeColor'

// useContext with NavigationContext never throws; useNavigation() does during concurrent renders
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NavigationContext } = require('expo-router/build/react-navigation/core')

// ─── Types ───────────────────────────────────────────────────────────────────

type Period = '1W' | '2W' | '1M' | '1Y'

interface Bucket
{
  label: string
  start: number
  end: number
  served: Record<string, number>
  eaten: Record<string, number>
}

interface Point { x: number; y: number }

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: '1W', label: '1 Week' },
  { key: '2W', label: '2 Weeks' },
  { key: '1M', label: '1 Month' },
  { key: '1Y', label: '1 Year' },
]

const PET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CHART_DRAW_HEIGHT = 130 // px available for lines
const CHART_PAD_TOP = 8
const CHART_PAD_BOTTOM = 28
const CHART_HEIGHT = CHART_DRAW_HEIGHT + CHART_PAD_TOP + CHART_PAD_BOTTOM
const MIN_BUCKET_WIDTH = 40
const DOT_RADIUS = 4
const LINE_WIDTH = 2

// ─── Date bucket builder ──────────────────────────────────────────────────────

function buildBuckets(period: Period): { buckets: Bucket[]; startMs: number; endMs: number }
{
  const buckets: Bucket[] = []
  const empty = (label: string, start: number, end: number): Bucket =>
    ({ label, start, end, served: {}, eaten: {} })

  if (period === '1W' || period === '2W')
  {
    const days = period === '1W' ? 7 : 14
    for (let i = days - 1; i >= 0; i--)
    {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      buckets.push(empty(
        period === '1W' ? DAY_NAMES[d.getDay()] : `${d.getMonth() + 1}/${d.getDate()}`,
        d.getTime(), next.getTime(),
      ))
    }
  }
  else if (period === '1M')
  {
    for (let i = 29; i >= 0; i--)
    {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      buckets.push(empty(String(d.getDate()), d.getTime(), next.getTime()))
    }
  }
  else
  {
    for (let i = 11; i >= 0; i--)
    {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); d.setHours(0, 0, 0, 0)
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0)
      buckets.push(empty(MONTH_NAMES[d.getMonth()], d.getTime(), next.getTime()))
    }
  }

  return { buckets, startMs: buckets[0].start, endMs: buckets[buckets.length - 1].end }
}

// ─── Line segment renderer ────────────────────────────────────────────────────

const LineSegment = ({
  p1, p2, color, opacity = 1,
}: { p1: Point; p2: Point; color: string; opacity?: number }) =>
{
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 1) return null
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
  const cx = (p1.x + p2.x) / 2
  const cy = (p1.y + p2.y) / 2

  return (
    <View
      style={{
        position: 'absolute',
        left: cx - length / 2,
        top: cy - LINE_WIDTH / 2,
        width: length,
        height: LINE_WIDTH,
        backgroundColor: color,
        opacity,
        borderRadius: 1,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  )
}

// ─── Main screen ─────────────────────────────────────────────────────────────

const AnalyticsScreen = () =>
{
  const { userId } = useAuth()
  const { icon, isDark } = useThemeColor()
  // useContext returns undefined instead of throwing when context isn't ready
  const navigation = useContext(NavigationContext)
  const [period, setPeriod] = useState<Period>('1W')

  const { buckets: emptyBuckets, startMs, endMs } = useMemo(() => buildBuckets(period), [period])
  const { data: pets = [], isLoading: petsLoading } = usePets(userId ?? null)
  const { data: events = [], isLoading: eventsLoading } = useFeedingHistory(userId ?? null, startMs, endMs)

  const screenWidth = Dimensions.get('window').width
  const bucketWidth = Math.max(MIN_BUCKET_WIDTH, Math.floor((screenWidth - 64) / emptyBuckets.length))
  const totalChartWidth = emptyBuckets.length * bucketWidth

  const { buckets, maxValue, hasEatenData } = useMemo(() =>
  {
    const filled = emptyBuckets.map(b => ({ ...b, served: { ...b.served }, eaten: { ...b.eaten } }))
    let anyEaten = false

    for (const ev of events)
    {
      for (const bucket of filled)
      {
        if (ev.fed_at >= bucket.start && ev.fed_at < bucket.end)
        {
          bucket.served[ev.pet_id] = (bucket.served[ev.pet_id] ?? 0) + ev.amount
          if (ev.amount_eaten != null)
          {
            bucket.eaten[ev.pet_id] = (bucket.eaten[ev.pet_id] ?? 0) + ev.amount_eaten
            anyEaten = true
          }
          break
        }
      }
    }

    const max = Math.max(
      1,
      ...filled.flatMap(b => [...Object.values(b.served), ...Object.values(b.eaten)]),
    )
    return { buckets: filled, maxValue: max, hasEatenData: anyEaten }
  }, [emptyBuckets, events])

  const getX = (i: number) => i * bucketWidth + bucketWidth / 2
  const getY = (value: number) =>
    CHART_PAD_TOP + (1 - value / maxValue) * CHART_DRAW_HEIGHT

  const isLoading = petsLoading || eventsLoading
  const toggleDrawer = () => navigation?.dispatch({ type: 'TOGGLE_DRAWER' })

  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const labelColor = isDark ? '#6b7280' : '#9ca3af'

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <Pressable onPress={toggleDrawer} hitSlop={12} className="mr-3">
          <Feather name="menu" size={24} color={icon} />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">Feeding Overview</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {/* Period selector */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
          {PERIODS.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              className={`flex-1 py-2 rounded-lg items-center ${period === key ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
            >
              <Text className={`text-xs font-semibold ${period === key ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading
          ? (
              <View style={{ height: CHART_HEIGHT + 80, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            )
          : pets.length === 0
            ? (
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 items-center">
                  <Text className="text-gray-400 dark:text-gray-500 text-center">
                    No pets yet. Add a pet to start tracking feedings.
                  </Text>
                </View>
              )
            : (
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">

                  {/* Chart header */}
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {hasEatenData ? 'Served vs Eaten' : 'Amount Served'}
                    </Text>
                    {hasEatenData && (
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1.5">
                          <View style={{ width: 16, height: LINE_WIDTH, backgroundColor: '#9ca3af', borderRadius: 1 }} />
                          <Text className="text-xs text-gray-400 dark:text-gray-500">Served</Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <View style={{ width: 16, height: LINE_WIDTH, backgroundColor: '#6b7280', borderRadius: 1 }} />
                          <Text className="text-xs text-gray-400 dark:text-gray-500">Eaten</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Chart area */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ width: totalChartWidth, height: CHART_HEIGHT, position: 'relative' }}>

                      {/* Horizontal grid lines at 0%, 33%, 67%, 100% */}
                      {[0, 0.33, 0.67, 1].map(pct => (
                        <View
                          key={pct}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: CHART_PAD_TOP + (1 - pct) * CHART_DRAW_HEIGHT,
                            height: 1,
                            backgroundColor: gridColor,
                          }}
                        />
                      ))}

                      {/* Lines and dots per pet */}
                      {pets.map((pet, pi) =>
                      {
                        const color = PET_COLORS[pi % PET_COLORS.length]

                        const servedPts: Point[] = buckets.map((b, i) => ({
                          x: getX(i),
                          y: getY(b.served[pet.id] ?? 0),
                        }))

                        const eatenPts: Point[] = hasEatenData
                          ? buckets.map((b, i) => ({
                              x: getX(i),
                              y: getY(b.eaten[pet.id] ?? 0),
                            }))
                          : []

                        return (
                          <React.Fragment key={pet.id}>
                            {/* Served line segments */}
                            {servedPts.slice(0, -1).map((p, i) => (
                              <LineSegment
                                key={`s-${i}`}
                                p1={p}
                                p2={servedPts[i + 1]}
                                color={color}
                                opacity={hasEatenData ? 0.35 : 1}
                              />
                            ))}

                            {/* Eaten line segments */}
                            {eatenPts.slice(0, -1).map((p, i) => (
                              <LineSegment
                                key={`e-${i}`}
                                p1={p}
                                p2={eatenPts[i + 1]}
                                color={color}
                              />
                            ))}

                            {/* Served dots */}
                            {servedPts.map((p, i) => (
                              (buckets[i].served[pet.id] ?? 0) > 0
                                ? (
                                    <View
                                      key={`sd-${i}`}
                                      style={{
                                        position: 'absolute',
                                        left: p.x - DOT_RADIUS,
                                        top: p.y - DOT_RADIUS,
                                        width: DOT_RADIUS * 2,
                                        height: DOT_RADIUS * 2,
                                        borderRadius: DOT_RADIUS,
                                        backgroundColor: color,
                                        opacity: hasEatenData ? 0.35 : 1,
                                      }}
                                    />
                                  )
                                : null
                            ))}

                            {/* Eaten dots */}
                            {eatenPts.map((p, i) => (
                              (buckets[i].eaten[pet.id] ?? 0) > 0
                                ? (
                                    <View
                                      key={`ed-${i}`}
                                      style={{
                                        position: 'absolute',
                                        left: p.x - DOT_RADIUS,
                                        top: p.y - DOT_RADIUS,
                                        width: DOT_RADIUS * 2,
                                        height: DOT_RADIUS * 2,
                                        borderRadius: DOT_RADIUS,
                                        backgroundColor: color,
                                      }}
                                    />
                                  )
                                : null
                            ))}
                          </React.Fragment>
                        )
                      })}

                      {/* X-axis labels */}
                      {buckets.map((bucket, i) => (
                        <Text
                          key={i}
                          style={{
                            position: 'absolute',
                            left: getX(i) - bucketWidth / 2,
                            top: CHART_PAD_TOP + CHART_DRAW_HEIGHT + 8,
                            width: bucketWidth,
                            textAlign: 'center',
                            fontSize: 9,
                            color: labelColor,
                          }}
                        >
                          {bucket.label}
                        </Text>
                      ))}
                    </View>
                  </ScrollView>

                  {events.length === 0 && (
                    <Text className="text-center text-gray-400 dark:text-gray-500 text-xs mt-1">
                      No feedings recorded in this period
                    </Text>
                  )}

                  {/* Pet legend */}
                  <View className="flex-row flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {pets.map((pet, i) => (
                      <View key={pet.id} className="flex-row items-center gap-1.5">
                        <View
                          style={{
                            width: 16,
                            height: LINE_WIDTH,
                            backgroundColor: PET_COLORS[i % PET_COLORS.length],
                            borderRadius: 1,
                          }}
                        />
                        <Text className="text-xs text-gray-600 dark:text-gray-400">{pet.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default AnalyticsScreen
