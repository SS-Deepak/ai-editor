import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'layouts', 'components');

interface ComponentLayout {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  createdBy: 'admin' | string;
  isPublished: boolean;
  elements: any[];
  exposedProps: any[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// GET - Fetch all layouts
export async function GET() {
  try {
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const allLayouts: ComponentLayout[] = [];

    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      if (data.layouts && Array.isArray(data.layouts)) {
        allLayouts.push(...data.layouts);
      }
    }

    return NextResponse.json({ layouts: allLayouts });
  } catch (error) {
    console.error('Error fetching layouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layouts' },
      { status: 500 }
    );
  }
}

// POST - Create a new layout
export async function POST(request: NextRequest) {
  try {
    const layout: ComponentLayout = await request.json();

    // Determine which file to add to based on category
    const fileName = `${layout.category}.json`;
    const filePath = path.join(DATA_DIR, fileName);

    let existingData = { layouts: [] as ComponentLayout[] };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(content);
    } catch {
      // File doesn't exist, will be created
    }

    existingData.layouts.push(layout);

    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({ success: true, layout });
  } catch (error) {
    console.error('Error creating layout:', error);
    return NextResponse.json(
      { error: 'Failed to create layout' },
      { status: 500 }
    );
  }
}

