"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import type { DiamondData } from "@/lib/google-sheets"
import { fetchDiamondData } from "@/lib/google-sheets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Gem, TrendingUp, Filter, Search, RefreshCw, ChevronDown, X } from "lucide-react"

interface DiamondPricingDashboardProps {
  initialData: DiamondData[]
}

export function DiamondPricingDashboard({ initialData }: DiamondPricingDashboardProps) {
  const [data, setData] = useState<DiamondData[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [colourFilter, setColourFilter] = useState<string[]>([])
  const [clarityFilter, setClarityFilter] = useState<string[]>([])

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const newData = await fetchDiamondData()
      if (newData.length > 0) {
        setData(newData)
        console.log("[v0] Data refreshed successfully:", newData.length, "items")
      }
    } catch (error) {
      console.error("[v0] Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (initialData.length === 0) {
      setIsLoading(true)
      fetchDiamondData().then((clientData: DiamondData[]) => {
        if (clientData.length > 0) setData(clientData)
        setIsLoading(false)
      })
    }
  }, [initialData])

  useEffect(() => {
    const interval = setInterval(() => refreshData(), 5000)
    return () => clearInterval(interval)
  }, [refreshData])

  const uniqueColours = useMemo(() => {
    const defaultColours = [
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ]
    const dataColours = Array.from(new Set(data.map((item) => item.colour)))
    const allColours = Array.from(new Set([...defaultColours, ...dataColours]))
    return allColours
  }, [data])

  const uniqueClarities = useMemo(() => {
    const defaultClarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]
    const dataClarities = Array.from(new Set(data.map((item) => item.clarity)))
    const allClarities = Array.from(new Set([...defaultClarities, ...dataClarities]))
    return allClarities
  }, [data])

  const filteredData = useMemo(() => {
    const filtered = data.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesColour = colourFilter.length === 0 || colourFilter.includes(item.colour)
      const matchesClarity = clarityFilter.length === 0 || clarityFilter.includes(item.clarity)

      return matchesSearch && matchesColour && matchesClarity
    })

    return filtered
  }, [data, searchTerm, colourFilter, clarityFilter])

  const stats = useMemo(() => {
    const totalInventory = data.length
    const filteredCount = filteredData.length
    const averageRate =
      filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.rate, 0) / filteredData.length : 0
    const highestRate = filteredData.length > 0 ? Math.max(...filteredData.map((item) => item.rate)) : 0

    return { totalInventory, filteredCount, averageRate, highestRate }
  }, [data, filteredData])

  const toggleFilter = (value: string, filter: string[], setFilter: (v: string[]) => void) => {
    console.log("[v0] Current filter:", filter, "Toggling value:", value)
    if (filter.includes(value)) {
      setFilter(filter.filter((v) => v !== value))
    } else {
      setFilter([...filter, value])
    }
  }

  const removeFilterItem = (value: string, filter: string[], setFilter: (v: string[]) => void) => {
    setFilter(filter.filter((v) => v !== value))
  }

  return (
    <div className="space-y-8">
      {isLoading && (
        <Card className="bg-card border-border">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading diamond data from Google Sheets...</div>
          </CardContent>
        </Card>
      )}

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

      <Card className="bg-card border-border overflow-visible">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="border-border text-foreground hover:bg-accent bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-visible">
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

            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className="justify-between bg-input border-border text-foreground hover:bg-accent"
                  onClick={() => console.log("[v0] Colour popover clicked")}
                >
                  <span>{colourFilter.length === 0 ? "Select Colours" : `Colours (${colourFilter.length})`}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 bg-white dark:bg-gray-800 border shadow-lg z-[1000]" align="start" sideOffset={5}>
                <div className="p-4 space-y-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Select Colours</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueColours.map((colour) => (
                      <div key={colour} className="flex items-center space-x-2">
                        <Checkbox
                          id={`colour-${colour}`}
                          checked={colourFilter.includes(colour)}
                          onCheckedChange={() => {
                            console.log("[v0] Toggling colour:", colour)
                            toggleFilter(colour, colourFilter, setColourFilter)
                          }}
                        />
                        <label
                          htmlFor={`colour-${colour}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900 dark:text-gray-100"
                        >
                          {colour}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  className="justify-between bg-input border-border text-foreground hover:bg-accent"
                  onClick={() => console.log("[v0] Clarity popover clicked")}
                >
                  <span>{clarityFilter.length === 0 ? "Select Clarity" : `Clarity (${clarityFilter.length})`}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 bg-white dark:bg-gray-800 border shadow-lg z-[1000]" align="start" sideOffset={5}>
                <div className="p-4 space-y-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Select Clarity</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueClarities.map((clarity) => (
                      <div key={clarity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`clarity-${clarity}`}
                          checked={clarityFilter.includes(clarity)}
                          onCheckedChange={() => {
                            console.log("[v0] Toggling clarity:", clarity)
                            toggleFilter(clarity, clarityFilter, setClarityFilter)
                          }}
                        />
                        <label
                          htmlFor={`clarity-${clarity}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-900 dark:text-gray-100"
                        >
                          {clarity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setColourFilter([])
                setClarityFilter([])
              }}
              className="border-border text-foreground hover:bg-accent"
            >
              Clear Filters
            </Button>
          </div>

          {(colourFilter.length > 0 || clarityFilter.length > 0) && (
            <div className="mt-4 space-y-2">
              {colourFilter.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Colours:</span>
                  {colourFilter.map((colour) => (
                    <Badge
                      key={colour}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      onClick={() => removeFilterItem(colour, colourFilter, setColourFilter)}
                    >
                      {colour}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              {clarityFilter.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Clarity:</span>
                  {clarityFilter.map((clarity) => (
                    <Badge
                      key={clarity}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      onClick={() => removeFilterItem(clarity, clarityFilter, setClarityFilter)}
                    >
                      {clarity}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Diamond Pricing Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-card-foreground">Sleeve</TableHead>
                  <TableHead className="text-card-foreground">Colour</TableHead>
                  <TableHead className="text-card-foreground">Clarity</TableHead>
                  <TableHead className="text-card-foreground text-right">Rate</TableHead>
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

          {filteredData.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              {data.length === 0
                ? "No data available. Please check your Google Sheets configuration."
                : "No diamonds found matching your criteria."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}