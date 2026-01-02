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

async function findLayoutFile(layoutId: string): Promise<{ filePath: string; data: { layouts: ComponentLayout[] }; layoutIndex: number } | null> {
  const files = await fs.readdir(DATA_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  for (const file of jsonFiles) {
    const filePath = path.join(DATA_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (data.layouts && Array.isArray(data.layouts)) {
      const layoutIndex = data.layouts.findIndex((l: ComponentLayout) => l.id === layoutId);
      if (layoutIndex !== -1) {
        return { filePath, data, layoutIndex };
      }
    }
  }

  return null;
}

// GET - Fetch a single layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await findLayoutFile(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ layout: result.data.layouts[result.layoutIndex] });
  } catch (error) {
    console.error('Error fetching layout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch layout' },
      { status: 500 }
    );
  }
}

// PATCH - Update a layout
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const result = await findLayoutFile(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // Update the layout
    result.data.layouts[result.layoutIndex] = {
      ...result.data.layouts[result.layoutIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Handle category change (move to different file)
    const oldCategory = result.data.layouts[result.layoutIndex].category;
    const newCategory = updates.category;

    if (newCategory && newCategory !== oldCategory) {
      const layout = result.data.layouts[result.layoutIndex];
      
      // Remove from old file
      result.data.layouts.splice(result.layoutIndex, 1);
      await fs.writeFile(result.filePath, JSON.stringify(result.data, null, 2));

      // Add to new file
      const newFilePath = path.join(DATA_DIR, `${newCategory}.json`);
      let newFileData = { layouts: [] as ComponentLayout[] };

      try {
        const content = await fs.readFile(newFilePath, 'utf-8');
        newFileData = JSON.parse(content);
      } catch {
        // File doesn't exist, will be created
      }

      newFileData.layouts.push(layout);
      await fs.writeFile(newFilePath, JSON.stringify(newFileData, null, 2));
    } else {
      // Save to same file
      await fs.writeFile(result.filePath, JSON.stringify(result.data, null, 2));
    }

    return NextResponse.json({ success: true, layout: result.data.layouts[result.layoutIndex] || updates });
  } catch (error) {
    console.error('Error updating layout:', error);
    return NextResponse.json(
      { error: 'Failed to update layout' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a layout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await findLayoutFile(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    // Remove the layout
    result.data.layouts.splice(result.layoutIndex, 1);
    await fs.writeFile(result.filePath, JSON.stringify(result.data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting layout:', error);
    return NextResponse.json(
      { error: 'Failed to delete layout' },
      { status: 500 }
    );
  }
}

