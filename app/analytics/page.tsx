"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, PieChart, Download, Filter, Search } from "lucide-react"

const analyticsData = [
  {
    title: "Total Assessments",
    value: "127",
    change: "+12%",
    trend: "up",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Active Users",
    value: "3,842",
    change: "+8%",
    trend: "up",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Completion Rate",
    value: "89.3%",
    change: "+2.1%",
    trend: "up",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: "Avg. Score",
    value: "78.5",
    change: "-1.2%",
    trend: "down",
    icon: <BarChart3 className="h-5 w-5" />,
  },
]

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track performance, generate reports, and gain insights from your assessment data.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {analyticsData.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-xl bg-muted">
                    {item.icon}
                  </div>
                  <Badge 
                    variant={item.trend === "up" ? "default" : "destructive"}
                    className="rounded-xl"
                  >
                    {item.change}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{item.value}</h3>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Assessment completion rates and scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-2xl bg-muted">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Chart Placeholder</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="rounded-2xl">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Question Type Distribution</CardTitle>
              <CardDescription>Breakdown of assessment types being used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border rounded-2xl bg-muted">
                <PieChart className="h-12 w-12 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Chart Placeholder</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="rounded-2xl">
                <Filter className="mr-2 h-4 w-4" />
                Filter Data
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6"
      >
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest assessment completions and interactions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-2xl">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="rounded-2xl">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Linear Programming Quiz", users: 45, completion: 92, time: "2 hours ago" },
                { name: "Biology Lab Assessment", users: 23, completion: 87, time: "5 hours ago" },
                { name: "History Timeline Test", users: 67, completion: 95, time: "1 day ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <h4 className="font-medium">{activity.name}</h4>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.users} users</p>
                      <p className="text-sm text-muted-foreground">{activity.completion}% completion</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
