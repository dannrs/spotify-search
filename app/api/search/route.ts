import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import {
  ItemTypes,
  SearchResults,
  SpotifyApi,
  Track
} from '@spotify/web-api-ts-sdk'
import { getAccessToken } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || '/'
  revalidatePath(path)
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const type = searchParams.get('type')

  const typeToPropertyMap = {
    album: 'albums',
    artist: 'artists',
    playlist: 'playlists',
    track: 'tracks'
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID as string
  const access_token = await getAccessToken()

  const spotify = SpotifyApi.withAccessToken(client_id, access_token)
  const song = await spotify.search(
    query as string,
    [type as ItemTypes],
    'US',
    20
  )

  const property = typeToPropertyMap[
    type as keyof typeof typeToPropertyMap
  ] as keyof SearchResults

  if (!type || !property || !song[property]) {
    return NextResponse.json({ error: 'Invalid type.' })
  }

  const results = song[property].items.map(item => {
    let imageUrl

    if ('images' in item) {
      imageUrl = item.images?.[0]?.url
    } else if (type === 'track') {
      imageUrl = (item as Track).album?.images?.[0]?.url
    }

    return {
      name: item.name,
      image: imageUrl,
      url: item.external_urls.spotify,
      type: item.type
    }
  })

  return NextResponse.json({ results })
}
