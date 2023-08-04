import { Box, useMantineTheme } from "@mantine/core"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { eachDayOfInterval, format, parseISO } from "date-fns"

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

function prepareDataForRecharts(data, splitBy, props, range) {
  // Create a map to hold the processed data
  // const dataMap = {}
  const output = []

  const uniqueSplitByValues =
    splitBy && Array.from(new Set(data.map((item) => item[splitBy].toString())))

  // Initialize map with dates as keys and empty data as values
  eachDayOfInterval({
    // substract 'range' amount of days for start date
    start: new Date(new Date().getTime() - range * 24 * 60 * 60 * 1000),
    end: new Date(),
  }).forEach((day) => {
    const date = format(day, "yyyy-MM-dd")

    const dayData = { date }

    for (let prop of props) {
      if (splitBy) {
        for (let splitByValue of uniqueSplitByValues) {
          dayData[`${splitByValue} ${prop}`] =
            data.find(
              (item) =>
                item[splitBy].toString() === splitByValue &&
                format(parseISO(item.date), "yyyy-MM-dd") === date
            )?.[prop] || 0
        }
      } else {
        dayData[prop] =
          data.find(
            (item) => format(parseISO(item.date), "yyyy-MM-dd") === date
          )?.[prop] || 0
      }
    }

    output.push(dayData)
  })

  return output.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

const LineChart = ({
  data,
  props,
  height = 300,
  splitBy = undefined,
  range,
}) => {
  const theme = useMantineTheme()

  const colors = ["blue", "pink", "indigo", "green", "violet", "yellow"]

  const cleanedData = prepareDataForRecharts(data, splitBy, props, range)

  return (
    <Box mt="sm">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          width={500}
          height={400}
          data={cleanedData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ transform: "translate(0, 6)" }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            padding={{ left: 10, right: 10 }}
            minTickGap={5}
          />

          <Tooltip />

          {Object.keys(cleanedData[0])
            .filter((prop) => prop !== "date")
            .map((prop, i) => (
              <>
                <defs key={prop}>
                  <linearGradient
                    color={theme.colors[colors[i % colors.length]][6]}
                    id={slugify(prop)}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="currentColor"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  color={theme.colors[colors[i % colors.length]][4]}
                  dataKey={prop}
                  stackId="1"
                  stroke="currentColor"
                  dot={false}
                  fill={`url(#${slugify(prop)})`}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default LineChart
