export interface DiamondData {
  sleeve: string;
  colour: string;
  vvs: number;
  vs1: number;
  vs2: number;
  si1: number;
  si2: number;
  si3: number;
  i1: number;
  i2: number;
}

export async function fetchDiamondData(): Promise<DiamondData[]> {
  try {
    console.log("[v0] Starting Google Sheets fetch...");

    // Updated Google Sheets CSV export URL with your new sheet
    const sheetId = "1w2_hYMXe4iZw-7iwhR4HUHQetRWsvpih";
    const gid = "1300949284"; // GID for the SLEEVE CHART sheet
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    console.log("[v0] Fetching from URL:", csvUrl);

    const response = await fetch(csvUrl, {
      method: "GET",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; DiamondPricing/1.0)",
      },
      redirect: "follow",
      cache: "no-store",
    });

    console.log("[v0] Response status:", response.status);
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log("[v0] CSV content length:", csvText.length);
    console.log("[v0] First 200 chars:", csvText.substring(0, 200));
    console.log("[v0] First 5 lines:", csvText.split("\n").slice(0, 5).join("\n"));

    // Parse CSV data
    const lines = csvText.trim().split("\n");
    console.log("[v0] Total lines:", lines.length);

    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or invalid");
    }

    // Skip header row and parse data
    const data: DiamondData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        console.log(`[v0] Line ${i} is empty, skipping...`);
        continue;
      }

      console.log(`[v0] Raw line ${i}:`, line);

      // Parse CSV line (handle commas within quoted fields)
      const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((col) => col.replace(/^"|"$/g, "").trim());
      console.log(`[v0] Line ${i} parsed columns:`, columns);

      // Check if we have at least 2 columns (sleeve and colour minimum)
      if (columns.length >= 2) {
        const sleeve = columns[0];
        const colour = columns[1];
        
        // Get rate columns if they exist, otherwise use empty strings
        const vvs = columns[2] || "";
        const vs1 = columns[3] || "";
        const vs2 = columns[4] || "";
        const si1 = columns[5] || "";
        const si2 = columns[6] || "";
        const si3 = columns[7] || "";
        const i1 = columns[8] || "";
        const i2 = columns[9] || "";

        // Clean sleeve data (replace -- with -)
        const cleanSleeve = sleeve.replace(/--/g, "-");

        // Check if ALL columns are empty - only skip if everything is empty
        const allColumnsEmpty = !cleanSleeve && !colour && !vvs && !vs1 && !vs2 && !si1 && !si2 && !si3 && !i1 && !i2;

        if (allColumnsEmpty) {
          console.log(`[v0] Line ${i} skipped: all columns are empty`);
          continue;
        }

        // Parse each rate as number, default to 0 if empty or invalid
        const parseRate = (rateStr: string) => {
          return rateStr ? Number.parseFloat(rateStr.replace(/[^\d.-]/g, "")) : 0;
        };

        const diamondData: DiamondData = {
          sleeve: cleanSleeve,
          colour: colour.toUpperCase(),
          vvs: parseRate(vvs),
          vs1: parseRate(vs1),
          vs2: parseRate(vs2),
          si1: parseRate(si1),
          si2: parseRate(si2),
          si3: parseRate(si3),
          i1: parseRate(i1),
          i2: parseRate(i2),
        };

        console.log(`[v0] Line ${i} parsed data:`, diamondData);

        // Add the row as long as at least one column has data
        data.push(diamondData);
        console.log(`[v0] Line ${i} added to data`);
      } else {
        console.log(`[v0] Line ${i} has insufficient columns:`, columns);
      }
    }

    console.log("[v0] Parsed data count:", data.length);
    console.log("[v0] Sample data:", data.slice(0, 3));

    if (data.length === 0) {
      throw new Error("No valid data found in CSV");
    }

    return data;
  } catch (error) {
    console.error("[v0] Error fetching Google Sheets data:", error);
    return [];
  }
}
