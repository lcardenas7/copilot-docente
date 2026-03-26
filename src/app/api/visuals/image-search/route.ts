import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const source = searchParams.get("source") || "unsplash";

  if (!query) {
    return NextResponse.json(
      { success: false, error: "Query is required" },
      { status: 400 }
    );
  }

  try {
    if (source === "unsplash") {
      return await searchUnsplash(query);
    } else if (source === "wikimedia") {
      return await searchWikimedia(query);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid source" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search images" },
      { status: 500 }
    );
  }
}

async function searchUnsplash(query: string) {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    // Fallback to placeholder if no API key
    return NextResponse.json({
      success: true,
      imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`,
      source: "unsplash",
    });
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unsplash API error");
  }

  const data = await response.json();

  if (data.results && data.results.length > 0) {
    return NextResponse.json({
      success: true,
      imageUrl: data.results[0].urls.regular,
      source: "unsplash",
      attribution: {
        photographer: data.results[0].user.name,
        link: data.results[0].links.html,
      },
    });
  }

  return NextResponse.json({
    success: false,
    error: "No images found",
  });
}

async function searchWikimedia(query: string) {
  // Try Wikipedia API first for article images
  const wikiResponse = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "CopilotDocente/1.0 (educational platform)",
      },
    }
  );

  if (wikiResponse.ok) {
    const data = await wikiResponse.json();
    
    if (data.thumbnail?.source) {
      // Get higher resolution version
      const imageUrl = data.thumbnail.source.replace(/\/\d+px-/, "/800px-");
      
      return NextResponse.json({
        success: true,
        imageUrl,
        source: "wikimedia",
        attribution: {
          title: data.title,
          link: data.content_urls?.desktop?.page,
        },
      });
    }
  }

  // Fallback to Wikimedia Commons search
  const commonsResponse = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=1&format=json`,
    {
      headers: {
        "User-Agent": "CopilotDocente/1.0 (educational platform)",
      },
    }
  );

  if (commonsResponse.ok) {
    const data = await commonsResponse.json();
    
    if (data.query?.search?.length > 0) {
      const title = data.query.search[0].title;
      
      // Get image info
      const imageInfoResponse = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`,
        {
          headers: {
            "User-Agent": "CopilotDocente/1.0 (educational platform)",
          },
        }
      );

      if (imageInfoResponse.ok) {
        const imageData = await imageInfoResponse.json();
        const pages = imageData.query?.pages;
        const pageId = Object.keys(pages || {})[0];
        
        if (pageId && pages[pageId]?.imageinfo?.[0]?.thumburl) {
          return NextResponse.json({
            success: true,
            imageUrl: pages[pageId].imageinfo[0].thumburl,
            source: "wikimedia",
          });
        }
      }
    }
  }

  return NextResponse.json({
    success: false,
    error: "No images found",
  });
}
