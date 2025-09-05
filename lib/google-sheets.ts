export interface DiamondData {
  sleeve: string;
  colour: string;
  clarity: string;
  rate: number;
}

export async function fetchDiamondData(): Promise<DiamondData[]> {
  try {
    console.log("[v0] Starting Google Sheets fetch...");

    // Google Sheets CSV export URL - ensure the sheet is publicly accessible
    const sheetId = "1cTNY19s84Kntql_IYtm2JFpFlNKQCi7W";
    const gid = "293612211"; // GID for the NATURAL POLISH RATE sheet
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

      if (columns.length >= 4) {
        const [sleeve, colour, clarity, rateStr] = columns;

        // Check if all four fields are empty
        if (!sleeve && !colour && !clarity && !rateStr) {
          console.log(`[v0] Line ${i} skipped: all four fields (sleeve, colour, clarity, rateStr) are empty`);
          continue;
        }

        // Clean sleeve data (replace -- with -)
        const cleanSleeve = sleeve.replace(/--/g, "-");

        // Parse rate as number, default to 0 if empty or invalid
        const rate = rateStr ? Number.parseFloat(rateStr.replace(/[^\d.-]/g, "")) : 0;
        console.log(`[v0] Line ${i} parsed values:`, {
          sleeve: cleanSleeve,
          colour,
          clarity,
          rateStr,
          rate,
        });

        // Validate fields (only sleeve, colour, clarity need to be non-empty, rate is always valid)
        const isValidSleeve = !!cleanSleeve;
        const isValidColour = !!colour;
        const isValidClarity = !!clarity;
        const isValidRate = !isNaN(rate); // Always true since rate defaults to 0

        if (isValidSleeve && isValidColour && isValidClarity) {
          data.push({
            sleeve: cleanSleeve,
            colour: colour.toUpperCase(),
            clarity: clarity.toUpperCase(),
            rate: rate,
          });
          console.log(`[v0] Line ${i} added to data`);
        } else {
          console.log(`[v0] Line ${i} skipped due to invalid fields:`, {
            isValidSleeve,
            isValidColour,
            isValidClarity,
            isValidRate,
            sleeve: cleanSleeve,
            colour,
            clarity,
            rateStr,
            rate,
          });
        }
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