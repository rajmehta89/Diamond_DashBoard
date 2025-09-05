"use client"

import { useState, useMemo } from "react"
import type { DiamondData } from "@/lib/google-sheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gem, TrendingUp, Filter, Search } from "lucide-react"

interface DiamondPricingDashboardProps {
  initialData: DiamondData[]
}

export function DiamondPricingDashboard({ initialData }: DiamondPricingDashboardProps) {
  const [data] = useState<DiamondData[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [colourFilter, setColourFilter] = useState<string>("all")
  const [clarityFilter, setClarityFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof DiamondData>("rate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Get unique values for filters
  const uniqueColours = useMemo(() => Array.from(new Set(data.map((item) => item.colour))).sort(), [data])

  const uniqueClarities = useMemo(() => Array.from(new Set(data.map((item) => item.clarity))).sort(), [data])

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filtered = data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesColour = colourFilter === "all" || item.colour === colourFilter
      const matchesClarity = clarityFilter === "all" || item.clarity === clarityFilter

      return matchesSearch && matchesColour && matchesClarity
    })

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      const aStr = aValue.toString()
      const bStr = bValue.toString()
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })

    return filtered
  }, [data, searchTerm, colourFilter, clarityFilter, sortField, sortDirection])

  // Calculate stats
  const stats = useMemo(() => {
    const totalInventory = data.length
    const filteredCount = filteredData.length
    const averageRate =
      filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.rate, 0) / filteredData.length : 0
    const highestRate = filteredData.length > 0 ? Math.max(...filteredData.map((item) => item.rate)) : 0

    return { totalInventory, filteredCount, averageRate, highestRate }
  }, [data, filteredData])

  const handleSort = (field: keyof DiamondData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Inventory</CardTitle>
            <Gem className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalInventory.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Filtered Results</CardTitle>
            <Filter className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.filteredCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Average Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.averageRate.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Highest Rate</CardTitle>
            <Gem className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.highestRate.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>

            <Select value={colourFilter} onValueChange={setColourFilter}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by Colour" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colours</SelectItem>
                {uniqueColours.map((colour) => (
                  <SelectItem key={colour} value={colour}>
                    {colour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={clarityFilter} onValueChange={setClarityFilter}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by Clarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clarities</SelectItem>
                {uniqueClarities.map((clarity) => (
                  <SelectItem key={clarity} value={clarity}>
                    {clarity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setColourFilter("all")
                setClarityFilter("all")
              }}
              className="border-border text-foreground hover:bg-accent"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Diamond Pricing Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead
                    className="cursor-pointer text-card-foreground hover:text-primary"
                    onClick={() => handleSort("sleeve")}
                  >
                    Sleeve {sortField === "sleeve" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-card-foreground hover:text-primary"
                    onClick={() => handleSort("colour")}
                  >
                    Colour {sortField === "colour" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-card-foreground hover:text-primary"
                    onClick={() => handleSort("clarity")}
                  >
                    Clarity {sortField === "clarity" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-card-foreground hover:text-primary text-right"
                    onClick={() => handleSort("rate")}
                  >
                    Rate {sortField === "rate" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-card-foreground">{item.sleeve}</TableCell>
                    <TableCell className="text-card-foreground">{item.colour}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {item.clarity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{item.rate.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No diamonds found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
